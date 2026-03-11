import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Divider, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card, TopBar } from '@presentation/components/common';
import { useAddSparePart, useSpareParts, useDeleteSparePart } from '@presentation/viewmodels/useOrders';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';
import { SparePart } from '@domain/entities/SparePart';

export default function AddSparePartScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const addPartMutation = useAddSparePart();
  const deletePartMutation = useDeleteSparePart();
  const { data: spareParts, isLoading } = useSpareParts(orderId || '');

  const [form, setForm] = useState({
    partName: '',
    partNumber: '',
    quantity: '1',
    unitPrice: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const quantity = parseInt(form.quantity) || 0;
  const unitPrice = parseFloat(form.unitPrice) || 0;
  const itemTotal = quantity * unitPrice;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.partName.trim()) {
      newErrors.partName = 'Part name is required';
    }
    if (!form.quantity || parseInt(form.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (!form.unitPrice || parseFloat(form.unitPrice) <= 0) {
      newErrors.unitPrice = 'Price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate() || !orderId) return;

    try {
      await addPartMutation.mutateAsync({
        serviceOrderId: orderId,
        partName: form.partName.trim(),
        partNumber: form.partNumber.trim() || undefined,
        quantity: parseInt(form.quantity),
        unitPrice: parseFloat(form.unitPrice),
      });
      // Clear form for next entry
      setForm({ partName: '', partNumber: '', quantity: '1', unitPrice: '' });
    } catch (err) {
      console.error('Failed to add spare part:', err);
    }
  };

  const handleDelete = async (item: SparePart) => {
    if (!orderId) return;
    try {
      await deletePartMutation.mutateAsync({ id: item.id, orderId });
    } catch (err) {
      console.error('Failed to delete spare part:', err);
    }
  };

  const total = (spareParts || []).reduce((sum, item) => sum + item.total, 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TopBar title="Parts" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Existing Spare Parts */}
          {(spareParts || []).length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.listTitle}>Added Parts ({spareParts?.length})</Text>
              {(spareParts || []).map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <Divider style={styles.divider} />}
                  <View style={styles.listItem}>
                    <View style={styles.listItemInfo}>
                      <Text style={styles.listItemName}>{item.partName}</Text>
                      <Text style={styles.listItemDetails}>
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                        {item.partNumber && ` • ${item.partNumber}`}
                      </Text>
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
                <Text style={styles.totalLabel}>Total Parts</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
            </View>
          )}

          {/* Add New Part Form */}
          <Text style={styles.sectionTitle}>Add Spare Part</Text>

          <Input
            label="Part Name *"
            value={form.partName}
            onChangeText={(v) => updateField('partName', v)}
            placeholder="e.g., Oil Filter, Brake Pad, Battery"
            error={errors.partName}
            autoCapitalize="words"
          />

          <View style={styles.spacing} />

          <Input
            label="Part Number (Optional)"
            value={form.partNumber}
            onChangeText={(v) => updateField('partNumber', v.toUpperCase())}
            placeholder="e.g., OF-123"
            autoCapitalize="characters"
          />

          <View style={styles.spacing} />

          <View style={styles.row}>
            <View style={styles.smallField}>
              <Input
                label="Qty *"
                value={form.quantity}
                onChangeText={(v) => updateField('quantity', v.replace(/[^0-9]/g, ''))}
                placeholder="1"
                keyboardType="numeric"
                error={errors.quantity}
              />
            </View>
            <View style={styles.largeField}>
              <Input
                label="Unit Price (₹) *"
                value={form.unitPrice}
                onChangeText={(v) => updateField('unitPrice', v.replace(/[^0-9]/g, ''))}
                placeholder="e.g., 350"
                keyboardType="numeric"
                error={errors.unitPrice}
              />
            </View>
          </View>

          {/* Item Total Preview */}
          {itemTotal > 0 && (
            <View style={styles.itemTotalRow}>
              <Text style={styles.itemTotalLabel}>Item Total:</Text>
              <Text style={styles.itemTotalValue}>{formatCurrency(itemTotal)}</Text>
            </View>
          )}

          <Button
            onPress={handleAdd}
            loading={addPartMutation.isPending}
            style={styles.addButton}
            icon="plus"
          >
            Add Part
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
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
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
    backgroundColor: colors.borderLight,
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
  listItemDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listItemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
    marginRight: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  smallField: {
    width: 80,
  },
  largeField: {
    flex: 1,
  },
  itemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  itemTotalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  addButton: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  doneButton: {
    width: '100%',
  },
});
