import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Chip, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { Button, Input, Card, TopBar } from '@presentation/components/common';
import { colors } from '@theme/colors';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@core/constants';
import { formatDate } from '@core/utils/formatDate';

const categories: ExpenseCategory[] = ['rent', 'utilities', 'supplies', 'other'];

const categoryColors: Record<ExpenseCategory, string> = {
  rent: colors.expenseRent,
  utilities: colors.expenseUtilities,
  supplies: colors.expenseSupplies,
  other: colors.expenseOther,
};

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
      <TopBar title="New Expense" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Category Section */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.chipContainer}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  selected={form.category === cat}
                  onPress={() => updateField('category', cat)}
                  style={[
                    styles.chip,
                    form.category === cat && {
                      backgroundColor: `${categoryColors[cat]}15`,
                      borderColor: `${categoryColors[cat]}40`
                    },
                  ]}
                  textStyle={[
                    styles.chipText,
                    form.category === cat && { color: categoryColors[cat], fontWeight: '600' },
                  ]}
                  showSelectedCheck={false}
                >
                  {EXPENSE_CATEGORY_LABELS[cat]}
                </Chip>
              ))}
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </Card>

          {/* Amount Section */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <Input
              label="Amount *"
              value={form.amount}
              onChangeText={(v) => updateField('amount', v.replace(/[^0-9.]/g, ''))}
              placeholder="Enter amount"
              keyboardType="decimal-pad"
              error={errors.amount}
              left={<IconButton icon="currency-inr" size={20} iconColor={colors.textSecondary} />}
            />
          </Card>

          {/* Date Section */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Date</Text>
            <Card style={styles.dateCard} onPress={() => setShowCalendar(!showCalendar)}>
              <View style={styles.dateRow}>
                <View style={styles.dateIconContainer}>
                  <IconButton icon="calendar" size={22} iconColor={colors.primary} />
                </View>
                <Text style={styles.dateText}>{formatDate(new Date(form.date))}</Text>
                <IconButton icon={showCalendar ? 'chevron-up' : 'chevron-down'} size={20} iconColor={colors.textSecondary} />
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
                  calendarBackground: colors.surfaceVariant,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: colors.textOnPrimary,
                  todayTextColor: colors.primary,
                  dayTextColor: colors.textPrimary,
                  textDisabledColor: colors.textDisabled,
                  monthTextColor: colors.textPrimary,
                  arrowColor: colors.primary,
                  textSectionTitleColor: colors.textSecondary,
                }}
                style={styles.calendar}
              />
            )}
          </Card>

          {/* Description Section */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <Input
              label="Description"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="What was this expense for?"
              multiline
              numberOfLines={3}
            />
          </Card>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipText: {
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
  },
  dateCard: {
    padding: 0,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 4,
  },
  dateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  calendar: {
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerButton: {
    flex: 1,
  },
});
