import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable, TextInput, Animated } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Button, TopBar, GlassCard } from '@presentation/components/common';
import { useOrderStore } from '@stores';
import { useOrderController } from '@controllers';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';
import { LaborItem } from '@models';

// Common services with preset prices (can be customized)
const QUICK_SERVICES = [
  { label: 'Oil Change', price: 500 },
  { label: 'Oil + Filter', price: 800 },
  { label: 'Brake Service', price: 1500 },
  { label: 'AC Service', price: 2000 },
  { label: 'General Service', price: 2500 },
  { label: 'Wheel Alignment', price: 600 },
  { label: 'Wheel Balance', price: 400 },
  { label: 'Battery Check', price: 200 },
  { label: 'Clutch Repair', price: 3500 },
  { label: 'Engine Tune-up', price: 1500 },
];

interface SwipeableItemProps {
  item: LaborItem;
  onDelete: () => void;
}

function SwipeableItem({ item, onDelete }: SwipeableItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <Pressable
      onLongPress={() => setShowDelete(true)}
      onPress={() => showDelete && setShowDelete(false)}
      style={styles.itemContainer}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemIcon}>
          <Icon source="wrench" size={18} color={colors.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.description}</Text>
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

const AddLaborScreen = observer(function AddLaborScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const orderStore = useOrderStore();
  const orderController = useOrderController();
  const descriptionRef = useRef<TextInput>(null);
  const amountRef = useRef<TextInput>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
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

  const laborItems = orderStore.currentOrder?.laborItems || [];
  const total = laborItems.reduce((sum, item) => sum + item.total, 0);

  const handleQuickAdd = async (service: { label: string; price: number }) => {
    if (!orderId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await orderController.addLaborItem(orderId, {
        description: service.label,
        hours: 1,
        ratePerHour: service.price,
      });
    } catch (err) {
      console.error('Failed to add labor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomAdd = async () => {
    if (!orderId || !description.trim() || !amount) return;

    const price = parseFloat(amount);
    if (price <= 0) return;

    setIsSubmitting(true);
    try {
      await orderController.addLaborItem(orderId, {
        description: description.trim(),
        hours: 1,
        ratePerHour: price,
      });
      setDescription('');
      setAmount('');
      setShowCustomForm(false);
    } catch (err) {
      console.error('Failed to add labor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: LaborItem) => {
    if (!orderId) return;
    try {
      await orderController.deleteLaborItem(orderId, item.id);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="Add Labor" />
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
          {/* Quick Services */}
          <Text style={styles.sectionLabel}>QUICK ADD</Text>
          <View style={styles.quickGrid}>
            {QUICK_SERVICES.map((service) => (
              <Pressable
                key={service.label}
                style={({ pressed }) => [
                  styles.quickChip,
                  pressed && styles.quickChipPressed,
                ]}
                onPress={() => handleQuickAdd(service)}
                disabled={isSubmitting}
              >
                <Text style={styles.quickLabel}>{service.label}</Text>
                <Text style={styles.quickPrice}>{formatCurrency(service.price)}</Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Labor */}
          <Pressable
            style={styles.customButton}
            onPress={() => {
              setShowCustomForm(!showCustomForm);
              if (!showCustomForm) {
                setTimeout(() => descriptionRef.current?.focus(), 100);
              }
            }}
          >
            <View style={styles.customButtonIcon}>
              <Icon source={showCustomForm ? "chevron-up" : "plus"} size={20} color={colors.primary} />
            </View>
            <Text style={styles.customButtonText}>Custom Labor</Text>
          </Pressable>

          {showCustomForm && (
            <GlassCard style={styles.customForm}>
              <View style={styles.inputRow}>
                <TextInput
                  ref={descriptionRef}
                  style={styles.descInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Service description"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="sentences"
                  returnKeyType="next"
                  onSubmitEditing={() => amountRef.current?.focus()}
                />
              </View>
              <View style={styles.inputRow}>
                <View style={styles.currencyPrefix}>
                  <Text style={styles.currencyText}>₹</Text>
                </View>
                <TextInput
                  ref={amountRef}
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
                  placeholder="Amount"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleCustomAdd}
                />
                <Pressable
                  style={[
                    styles.addIconButton,
                    (!description.trim() || !amount) && styles.addIconButtonDisabled
                  ]}
                  onPress={handleCustomAdd}
                  disabled={!description.trim() || !amount || isSubmitting}
                >
                  <Icon source="plus" size={20} color={colors.textOnPrimary} />
                </Pressable>
              </View>
            </GlassCard>
          )}

          {/* Added Items */}
          {laborItems.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                ADDED ({laborItems.length})
              </Text>
              <GlassCard style={styles.itemsCard}>
                {laborItems.map((item, index) => (
                  <View key={item.id}>
                    {index > 0 && <View style={styles.itemDivider} />}
                    <SwipeableItem item={item} onDelete={() => handleDelete(item)} />
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
            <Text style={styles.totalLabel}>Labor Total</Text>
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

export default AddLaborScreen;

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
    minWidth: '30%',
    flexGrow: 1,
  },
  quickChipPressed: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  quickPrice: {
    fontSize: 13,
    color: colors.primary,
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
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  customForm: {
    marginTop: 8,
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  descInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  currencyPrefix: {
    height: 44,
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
  amountInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surfaceSecondary,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  addIconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  addIconButtonDisabled: {
    backgroundColor: colors.systemGray4,
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
    backgroundColor: colors.primaryDim,
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
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
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
    color: colors.primary,
  },
  doneButton: {
    width: '100%',
  },
});
