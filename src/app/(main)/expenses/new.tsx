import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Chip, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { Button, Input, Card } from '@presentation/components/common';
import { colors } from '@theme/colors';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@core/constants';
import { formatDate } from '@core/utils/formatDate';

const categories: ExpenseCategory[] = ['rent', 'utilities', 'supplies', 'other'];

export default function NewExpenseScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [form, setForm] = useState({
    category: '' as ExpenseCategory,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.category) newErrors.category = 'Please select a category';
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!form.date) newErrors.date = 'Please select a date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.back();
    } catch (err) {
      console.error('Failed to add expense:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.chipContainer}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                selected={form.category === cat}
                onPress={() => updateField('category', cat)}
                style={styles.chip}
                showSelectedCheck
              >
                {EXPENSE_CATEGORY_LABELS[cat]}
              </Chip>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          <Text style={styles.sectionTitle}>Amount</Text>
          <Input
            label="Amount *"
            value={form.amount}
            onChangeText={(v) => updateField('amount', v.replace(/[^0-9.]/g, ''))}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            error={errors.amount}
            left={<IconButton icon="currency-inr" size={20} />}
          />

          <Text style={styles.sectionTitle}>Date</Text>
          <Card style={styles.dateCard} onPress={() => setShowCalendar(!showCalendar)}>
            <View style={styles.dateRow}>
              <IconButton icon="calendar" size={24} iconColor={colors.primary} />
              <Text style={styles.dateText}>{formatDate(new Date(form.date))}</Text>
              <IconButton icon={showCalendar ? 'chevron-up' : 'chevron-down'} size={20} />
            </View>
          </Card>
          {showCalendar && (
            <Calendar
              current={form.date}
              onDayPress={(day: DateData) => {
                updateField('date', day.dateString);
                setShowCalendar(false);
              }}
              maxDate={new Date().toISOString().split('T')[0]}
              markedDates={{ [form.date]: { selected: true, selectedColor: colors.primary } }}
              theme={{
                calendarBackground: colors.surface,
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.primary,
                arrowColor: colors.primary,
              }}
              style={styles.calendar}
            />
          )}

          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <Input
            label="Description"
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            placeholder="What was this expense for?"
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={() => router.back()} mode="outlined" style={styles.footerButton}>Cancel</Button>
          <Button onPress={handleSubmit} loading={isLoading} style={styles.footerButton}>Add Expense</Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 16, marginBottom: 12 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 4 },
  errorText: { fontSize: 12, color: colors.error, marginTop: 4 },
  dateCard: { padding: 0 },
  dateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dateText: { flex: 1, fontSize: 16, color: colors.textPrimary },
  calendar: { borderRadius: 12, marginTop: 8, elevation: 2 },
  footer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  footerButton: { flex: 1 },
});
