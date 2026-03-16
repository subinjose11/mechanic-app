import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Button, TopBar, GlassCard } from '@presentation/components/common';
import { useOrderStore } from '@stores';
import { useOrderController } from '@controllers';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';
import { SparePart } from '@models';

// Common parts with typical prices
const COMMON_PARTS = [
  { label: 'Engine Oil (1L)', price: 450 },
  { label: 'Oil Filter', price: 250 },
  { label: 'Air Filter', price: 350 },
  { label: 'Spark Plug', price: 180 },
  { label: 'Brake Pad (Set)', price: 1200 },
  { label: 'Brake Disc', price: 2500 },
  { label: 'Coolant (1L)', price: 300 },
  { label: 'Wiper Blade', price: 400 },
];

interface PartItemProps {
  item: SparePart;
  onDelete: () => void;
}

function PartItem({ item, onDelete }: PartItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <Pressable
      onLongPress={() => setShowDelete(true)}
      onPress={() => showDelete && setShowDelete(false)}
      style={styles.itemContainer}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemIcon}>
          <Icon source="cog" size={18} color={colors.secondary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.partName}</Text>
          <Text style={styles.itemDetails}>
            {item.quantity} × {formatCurrency(item.unitPrice)}
            {item.partNumber && ` • ${item.partNumber}`}
          </Text>
        </View>
        <Text style={styles.itemAmount}>{formatCurrency(item.total)}</Text>
        {showDelete && (
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Icon source="close-circle" size={22} color={colors.error} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const AddSparePartScreen = observer(function AddSparePartScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const orderStore = useOrderStore();
  const orderController = useOrderController();

  const partNameRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);

  const [partName, setPartName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Hide tab bar - need grandparent since: Tabs -> Stack -> Screen
  useLayoutEffect(() => {
    const tabNavigator = navigation.getParent()?.getParent();
    tabNavigator?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      tabNavigator?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  useEffect(() => {
    if (orderId) {
      orderController.fetchWithDetails(orderId);
    }
  }, [orderId]);

  const spareParts = orderStore.currentOrder?.spareParts || [];
  const total = spareParts.reduce((sum, item) => sum + item.total, 0);

  const qty = parseInt(quantity) || 1;
  const price = parseFloat(unitPrice) || 0;
  const itemTotal = qty * price;

  const handleQuickAdd = async (part: { label: string; price: number }) => {
    if (!orderId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await orderController.addSparePart(orderId, {
        partName: part.label,
        quantity: 1,
        unitPrice: part.price,
      });
    } catch (err) {
      console.error('Failed to add part:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomAdd = async () => {
    if (!orderId || !partName.trim() || price <= 0) return;

    setIsSubmitting(true);
    try {
      await orderController.addSparePart(orderId, {
        partName: partName.trim(),
        quantity: qty,
        unitPrice: price,
      });
      setPartName('');
      setUnitPrice('');
      setQuantity('1');
      setShowCustomForm(false);
    } catch (err) {
      console.error('Failed to add part:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: SparePart) => {
    if (!orderId) return;
    try {
      await orderController.deleteSparePart(orderId, item.id);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const incrementQty = () => {
    setQuantity((prev) => String((parseInt(prev) || 0) + 1));
  };

  const decrementQty = () => {
    const current = parseInt(quantity) || 1;
    if (current > 1) {
      setQuantity(String(current - 1));
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="Add Parts" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Common Parts */}
          <Text style={styles.sectionLabel}>COMMON PARTS</Text>
          <View style={styles.quickGrid}>
            {COMMON_PARTS.map((part) => (
              <Pressable
                key={part.label}
                style={({ pressed }) => [
                  styles.quickChip,
                  pressed && styles.quickChipPressed,
                ]}
                onPress={() => handleQuickAdd(part)}
                disabled={isSubmitting}
              >
                <Text style={styles.quickLabel}>{part.label}</Text>
                <Text style={styles.quickPrice}>{formatCurrency(part.price)}</Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Part */}
          <Pressable
            style={styles.customButton}
            onPress={() => {
              setShowCustomForm(!showCustomForm);
              if (!showCustomForm) {
                setTimeout(() => partNameRef.current?.focus(), 100);
              }
            }}
          >
            <View style={[styles.customButtonIcon, { backgroundColor: colors.secondaryDim }]}>
              <Icon source={showCustomForm ? "chevron-up" : "plus"} size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.customButtonText, { color: colors.secondary }]}>Custom Part</Text>
          </Pressable>

          {showCustomForm && (
            <GlassCard style={styles.customForm}>
              {/* Part Name */}
              <TextInput
                ref={partNameRef}
                style={styles.textInput}
                value={partName}
                onChangeText={setPartName}
                placeholder="Part name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => priceRef.current?.focus()}
              />

              {/* Price and Quantity Row */}
              <View style={styles.priceQtyRow}>
                {/* Price Input */}
                <View style={styles.priceInputContainer}>
                  <View style={styles.currencyPrefix}>
                    <Text style={styles.currencyText}>₹</Text>
                  </View>
                  <TextInput
                    ref={priceRef}
                    style={styles.priceInput}
                    value={unitPrice}
                    onChangeText={(v) => setUnitPrice(v.replace(/[^0-9]/g, ''))}
                    placeholder="Price"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                  />
                </View>

                {/* Quantity Stepper */}
                <View style={styles.qtyStepper}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={decrementQty}
                  >
                    <Icon source="minus" size={18} color={colors.textPrimary} />
                  </Pressable>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={incrementQty}
                  >
                    <Icon source="plus" size={18} color={colors.textPrimary} />
                  </Pressable>
                </View>
              </View>

              {/* Item Total Preview & Add Button */}
              <View style={styles.addRow}>
                {itemTotal > 0 && (
                  <View style={styles.itemTotalPreview}>
                    <Text style={styles.itemTotalLabel}>Total:</Text>
                    <Text style={styles.itemTotalValue}>{formatCurrency(itemTotal)}</Text>
                  </View>
                )}
                <Pressable
                  style={[
                    styles.addButton,
                    (!partName.trim() || price <= 0) && styles.addButtonDisabled
                  ]}
                  onPress={handleCustomAdd}
                  disabled={!partName.trim() || price <= 0 || isSubmitting}
                >
                  <Icon source="plus" size={20} color={colors.textOnPrimary} />
                  <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              </View>
            </GlassCard>
          )}

          {/* Added Parts */}
          {spareParts.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                ADDED ({spareParts.length})
              </Text>
              <GlassCard style={styles.itemsCard}>
                {spareParts.map((item, index) => (
                  <View key={item.id}>
                    {index > 0 && <View style={styles.itemDivider} />}
                    <PartItem item={item} onDelete={() => handleDelete(item)} />
                  </View>
                ))}
              </GlassCard>
              <Text style={styles.hintText}>Long press item to delete</Text>
            </>
          )}
        </ScrollView>

        {/* Footer with Total */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Parts Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.doneButton}
          >
            Done
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
});

export default AddSparePartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickChip: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: '47%',
    flexGrow: 1,
  },
  quickChipPressed: {
    backgroundColor: colors.secondaryDim,
    borderColor: colors.secondary,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  quickPrice: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '600',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  customButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  customForm: {
    marginTop: 8,
    padding: 14,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  priceQtyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priceInput: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surfaceSecondary,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  qtyButton: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTotalPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTotalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  addButtonDisabled: {
    backgroundColor: colors.systemGray4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  itemsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  itemContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.secondaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  itemDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.separator,
    marginLeft: 62,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  hintText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    padding: 16,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
  },
  doneButton: {
    width: '100%',
  },
});
