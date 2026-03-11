import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, SegmentedButtons, Chip } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card, TopBar } from '@presentation/components/common';
import { useCreatePayment } from '@presentation/viewmodels/usePayments';
import { useOrderWithDetails } from '@presentation/viewmodels/useOrders';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';
import { PaymentType, PaymentMethod, PAYMENT_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@core/constants';

export default function RecordPaymentScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const createPaymentMutation = useCreatePayment();
  const { data: order } = useOrderWithDetails(orderId || '');

  const [form, setForm] = useState({
    amount: '',
    paymentType: 'advance' as PaymentType,
    paymentMethod: 'cash' as PaymentMethod,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate balance due
  const totalLabor = (order?.laborItems || []).reduce((sum, item) => sum + item.total, 0);
  const totalParts = (order?.spareParts || []).reduce((sum, item) => sum + item.total, 0);
  const totalAmount = totalLabor + totalParts;
  const totalPaid = (order?.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = totalAmount - totalPaid;

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const amount = parseFloat(form.amount);

    if (!form.amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !orderId) return;

    try {
      await createPaymentMutation.mutateAsync({
        serviceOrderId: orderId,
        amount: parseFloat(form.amount),
        paymentType: form.paymentType,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || undefined,
      });
      router.back();
    } catch (err) {
      console.error('Failed to record payment:', err);
    }
  };

  const handlePayFull = () => {
    if (balanceDue > 0) {
      updateField('amount', balanceDue.toString());
      updateField('paymentType', 'final');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TopBar title="Payment" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Balance Summary */}
          <View style={styles.sectionCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Already Paid</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {formatCurrency(totalPaid)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.balanceRow]}>
              <Text style={styles.balanceLabel}>Balance Due</Text>
              <Text style={[styles.balanceValue, balanceDue > 0 && styles.balanceDue]}>
                {formatCurrency(balanceDue)}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Payment Details</Text>

          {/* Amount Input */}
          <Input
            label="Amount (₹) *"
            value={form.amount}
            onChangeText={(v) => updateField('amount', v.replace(/[^0-9.]/g, ''))}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            error={errors.amount}
          />

          {balanceDue > 0 && (
            <Button
              mode="text"
              onPress={handlePayFull}
              style={styles.payFullButton}
            >
              Pay Full Balance ({formatCurrency(balanceDue)})
            </Button>
          )}

          {/* Payment Type */}
          <Text style={styles.fieldLabel}>Payment Type</Text>
          <SegmentedButtons
            value={form.paymentType}
            onValueChange={(v) => updateField('paymentType', v)}
            buttons={[
              { value: 'advance', label: 'Advance' },
              { value: 'final', label: 'Final Payment' },
            ]}
            style={styles.segmentedButtons}
          />

          {/* Payment Method */}
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <View style={styles.chipContainer}>
            {(['cash', 'upi', 'card', 'bank_transfer'] as PaymentMethod[]).map((method) => (
              <Chip
                key={method}
                selected={form.paymentMethod === method}
                onPress={() => updateField('paymentMethod', method)}
                style={styles.chip}
              >
                {PAYMENT_METHOD_LABELS[method]}
              </Chip>
            ))}
          </View>

          {/* Notes */}
          <View style={styles.spacing} />
          <Input
            label="Notes (Optional)"
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            placeholder="Any additional notes..."
            multiline
            numberOfLines={2}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={() => router.back()}
            mode="outlined"
            style={styles.footerButton}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            loading={createPaymentMutation.isPending}
            style={styles.footerButton}
          >
            Record Payment
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
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  balanceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  balanceDue: {
    color: colors.error,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  payFullButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDisabled,
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: colors.surface,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  spacing: {
    height: 8,
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
