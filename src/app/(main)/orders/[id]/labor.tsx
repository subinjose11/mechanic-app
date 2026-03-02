import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Divider, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@presentation/components/common';
import { useAddLaborItem, useLaborItems, useDeleteLaborItem } from '@presentation/viewmodels/useOrders';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';
import { LaborItem } from '@domain/entities/LaborItem';

export default function AddLaborScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const addLaborMutation = useAddLaborItem();
  const deleteLaborMutation = useDeleteLaborItem();
  const { data: laborItems, isLoading } = useLaborItems(orderId || '');

  const [form, setForm] = useState({
    description: '',
    amount: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate() || !orderId) return;

    try {
      await addLaborMutation.mutateAsync({
        serviceOrderId: orderId,
        description: form.description.trim(),
        hours: 1, // Fixed at 1 since we're using flat rate
        ratePerHour: parseFloat(form.amount),
      });
      // Clear form for next entry
      setForm({ description: '', amount: '' });
    } catch (err) {
      console.error('Failed to add labor item:', err);
    }
  };

  const handleDelete = async (item: LaborItem) => {
    if (!orderId) return;
    try {
      await deleteLaborMutation.mutateAsync({ id: item.id, orderId });
    } catch (err) {
      console.error('Failed to delete labor item:', err);
    }
  };

  const total = (laborItems || []).reduce((sum, item) => sum + item.total, 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Existing Labor Items */}
          {(laborItems || []).length > 0 && (
            <Card style={styles.listCard}>
              <Text style={styles.listTitle}>Added Labor ({laborItems?.length})</Text>
              {(laborItems || []).map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <Divider style={styles.divider} />}
                  <View style={styles.listItem}>
                    <View style={styles.listItemInfo}>
                      <Text style={styles.listItemName}>{item.description}</Text>
                    </View>
                    <Text style={styles.listItemAmount}>{formatCurrency(item.total)}</Text>
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={colors.error}
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Labor</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
            </Card>
          )}

          {/* Add New Labor Form */}
          <Text style={styles.sectionTitle}>Add Labor</Text>

          <Input
            label="Description *"
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            placeholder="e.g., General Service, AC Repair, Brake Work"
            error={errors.description}
            autoCapitalize="sentences"
          />

          <View style={styles.spacing} />

          <Input
            label="Amount (₹) *"
            value={form.amount}
            onChangeText={(v) => updateField('amount', v.replace(/[^0-9]/g, ''))}
            placeholder="e.g., 500"
            keyboardType="numeric"
            error={errors.amount}
          />

          <Button
            onPress={handleAdd}
            loading={addLaborMutation.isPending}
            style={styles.addButton}
            icon="plus"
          >
            Add Labor
          </Button>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={() => router.back()}
            mode="contained"
            style={styles.doneButton}
          >
            Done
          </Button>
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
  listCard: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  listItemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  spacing: {
    height: 16,
  },
  addButton: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneButton: {
    width: '100%',
  },
});
