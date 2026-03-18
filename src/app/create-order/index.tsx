import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  StatusBar,
  TextInput,
  Pressable,
  Animated,
} from 'react-native';
import { Text, Icon, ActivityIndicator, Chip } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Button, Input, TopBar, GlassCard } from '@presentation/components/common';
import { useVehicleStore, useCustomerStore, useUIStore } from '@stores';
import { useVehicleController, useCustomerController, useOrderController } from '@controllers';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@core/constants';
import { Vehicle } from '@models/Vehicle';
import { Customer } from '@models/Customer';

interface LaborItemLocal {
  id: string;
  description: string;
  hours: number;
  ratePerHour: number;
  total: number;
}

interface PartItemLocal {
  id: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ExpandableSectionProps {
  title: string;
  icon: string;
  iconColor: string;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  total?: number;
  children: React.ReactNode;
}

function ExpandableSection({
  title,
  icon,
  iconColor,
  expanded,
  onToggle,
  count,
  total,
  children,
}: ExpandableSectionProps) {
  const animValue = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const rotation = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.expandableSection}>
      <Pressable style={styles.expandableHeader} onPress={onToggle}>
        <View style={[styles.expandableIcon, { backgroundColor: iconColor + '20' }]}>
          <Icon source={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.expandableHeaderInfo}>
          <Text style={styles.expandableTitle}>{title}</Text>
          {count !== undefined && count > 0 && (
            <Text style={styles.expandableCount}>
              {count} item{count !== 1 ? 's' : ''} • {formatCurrency(total || 0)}
            </Text>
          )}
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon source="chevron-down" size={24} color={colors.textSecondary} />
        </Animated.View>
      </Pressable>
      {expanded && <View style={styles.expandableContent}>{children}</View>}
    </View>
  );
}

const CreateOrderScreen = observer(function CreateOrderScreen() {
  const { vehicleId: initialVehicleId, customerId: initialCustomerId } = useLocalSearchParams<{
    vehicleId?: string;
    customerId?: string;
  }>();

  const insets = useSafeAreaInsets();
  const vehicleStore = useVehicleStore();
  const customerStore = useCustomerStore();
  const uiStore = useUIStore();
  const vehicleController = useVehicleController();
  const customerController = useCustomerController();
  const orderController = useOrderController();

  // Refs for custom inputs
  const laborDescRef = useRef<TextInput>(null);
  const laborAmountRef = useRef<TextInput>(null);
  const partNameRef = useRef<TextInput>(null);
  const partPriceRef = useRef<TextInput>(null);

  // Picker state
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [description, setDescription] = useState('');
  const [kmReading, setKmReading] = useState('');
  const [notes, setNotes] = useState('');

  // Items state
  const [laborItems, setLaborItems] = useState<LaborItemLocal[]>([]);
  const [partItems, setPartItems] = useState<PartItemLocal[]>([]);

  // Advance payment state
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceMethod, setAdvanceMethod] = useState<PaymentMethod>('cash');
  const [advanceNotes, setAdvanceNotes] = useState('');

  // Expandable sections
  const [laborExpanded, setLaborExpanded] = useState(false);
  const [partsExpanded, setPartsExpanded] = useState(false);
  const [paymentExpanded, setPaymentExpanded] = useState(false);

  // Input state for labor
  const [customLaborDesc, setCustomLaborDesc] = useState('');
  const [customLaborAmount, setCustomLaborAmount] = useState('');

  // Input state for parts
  const [customPartName, setCustomPartName] = useState('');
  const [customPartPrice, setCustomPartPrice] = useState('');
  const [customPartQty, setCustomPartQty] = useState('1');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data
  useEffect(() => {
    customerController.fetchAll();
    vehicleController.fetchAll();
  }, []);

  // Pre-fill from URL params
  useEffect(() => {
    if (initialCustomerId && customerStore.customers.length > 0) {
      const customer = customerStore.getById(initialCustomerId);
      if (customer) setSelectedCustomer(customer);
    }
    if (initialVehicleId && vehicleStore.vehicles.length > 0) {
      const vehicle = vehicleStore.getById(initialVehicleId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        // Also set customer from vehicle
        if (vehicle.customerId) {
          const customer = customerStore.getById(vehicle.customerId);
          if (customer) setSelectedCustomer(customer);
        }
      }
    }
  }, [initialCustomerId, initialVehicleId, customerStore.customers.length, vehicleStore.vehicles.length]);

  // Filter vehicles by selected customer
  const filteredVehiclesForPicker = useMemo(() => {
    let vehicles = vehicleStore.vehicles;
    if (selectedCustomer) {
      vehicles = vehicles.filter((v) => v.customerId === selectedCustomer.id);
    }
    if (vehicleSearchQuery) {
      const query = vehicleSearchQuery.toLowerCase();
      vehicles = vehicles.filter(
        (v) =>
          v.licensePlate.toLowerCase().includes(query) ||
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query)
      );
    }
    return vehicles;
  }, [vehicleStore.vehicles, selectedCustomer, vehicleSearchQuery]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery) return customerStore.customers;
    const query = customerSearchQuery.toLowerCase();
    return customerStore.customers.filter(
      (c) => c.name.toLowerCase().includes(query) || c.phone?.toLowerCase().includes(query)
    );
  }, [customerStore.customers, customerSearchQuery]);

  // Calculated totals
  const laborTotal = laborItems.reduce((sum, item) => sum + item.total, 0);
  const partsTotal = partItems.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = laborTotal + partsTotal;
  const advanceValue = parseFloat(advanceAmount) || 0;
  const balanceDue = grandTotal - advanceValue;

  // Handlers
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerPicker(false);
    setCustomerSearchQuery('');
    // If vehicle was selected from different customer, clear it
    if (selectedVehicle && selectedVehicle.customerId !== customer.id) {
      setSelectedVehicle(null);
    }
    if (errors.customerId) setErrors((prev) => ({ ...prev, customerId: '' }));
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehiclePicker(false);
    setVehicleSearchQuery('');
    // Auto-select customer if not already selected
    if (!selectedCustomer && vehicle.customerId) {
      const customer = customerStore.getById(vehicle.customerId);
      if (customer) setSelectedCustomer(customer);
    }
    if (errors.vehicleId) setErrors((prev) => ({ ...prev, vehicleId: '' }));
  };

  const handleAddLabor = () => {
    if (!customLaborDesc.trim() || !customLaborAmount) return;
    const price = parseFloat(customLaborAmount);
    if (price <= 0) return;

    const newItem: LaborItemLocal = {
      id: Date.now().toString(),
      description: customLaborDesc.trim(),
      hours: 1,
      ratePerHour: price,
      total: price,
    };
    setLaborItems((prev) => [...prev, newItem]);
    setCustomLaborDesc('');
    setCustomLaborAmount('');
  };

  const handleDeleteLabor = (id: string) => {
    setLaborItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddPart = () => {
    if (!customPartName.trim() || !customPartPrice) return;
    const price = parseFloat(customPartPrice);
    const qty = parseInt(customPartQty) || 1;
    if (price <= 0) return;

    const newItem: PartItemLocal = {
      id: Date.now().toString(),
      partName: customPartName.trim(),
      quantity: qty,
      unitPrice: price,
      total: price * qty,
    };
    setPartItems((prev) => [...prev, newItem]);
    setCustomPartName('');
    setCustomPartPrice('');
    setCustomPartQty('1');
  };

  const handleDeletePart = (id: string) => {
    setPartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedCustomer) newErrors.customerId = 'Please select a customer';
    if (!selectedVehicle) newErrors.vehicleId = 'Please select a vehicle';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validate() || !selectedCustomer || !selectedVehicle) return;

    setIsSubmitting(true);
    try {
      const order = await orderController.createWithItems({
        vehicleId: selectedVehicle.id,
        customerId: selectedCustomer.id,
        description: description.trim() || undefined,
        kmReading: kmReading ? parseInt(kmReading, 10) : undefined,
        notes: notes.trim() || undefined,
        laborItems: laborItems.map((item) => ({
          description: item.description,
          hours: item.hours,
          ratePerHour: item.ratePerHour,
        })),
        spareParts: partItems.map((item) => ({
          partName: item.partName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        advancePayment:
          advanceValue > 0
            ? {
                amount: advanceValue,
                paymentMethod: advanceMethod,
                notes: advanceNotes.trim() || undefined,
              }
            : undefined,
      });
      router.replace(`/(main)/orders/${order.id}`);
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadingData = uiStore.isLoading;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <TopBar title="Create Order" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 180 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Customer Selection */}
          <Text style={styles.sectionLabel}>CUSTOMER *</Text>
          <Pressable
            style={[styles.selectorCard, errors.customerId && styles.errorCard]}
            onPress={() => setShowCustomerPicker(true)}
          >
            {selectedCustomer ? (
              <View style={styles.selectedItem}>
                <View style={styles.selectedAvatar}>
                  <Text style={styles.selectedAvatarText}>
                    {selectedCustomer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>{selectedCustomer.name}</Text>
                  <Text style={styles.selectedSubtitle}>{selectedCustomer.phone || 'No phone'}</Text>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedCustomer(null);
                    setSelectedVehicle(null);
                  }}
                  hitSlop={12}
                >
                  <Icon source="close-circle" size={22} color={colors.systemGray3} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.placeholderRow}>
                <Icon source="account-search" size={28} color={colors.systemGray3} />
                <Text style={styles.placeholderText}>Tap to select customer</Text>
                <Icon source="chevron-right" size={20} color={colors.systemGray3} />
              </View>
            )}
          </Pressable>
          {errors.customerId && <Text style={styles.errorText}>{errors.customerId}</Text>}

          {/* Vehicle Selection */}
          <Text style={styles.sectionLabel}>VEHICLE *</Text>
          <Pressable
            style={[styles.selectorCard, errors.vehicleId && styles.errorCard]}
            onPress={() => setShowVehiclePicker(true)}
          >
            {selectedVehicle ? (
              <View style={styles.selectedItem}>
                <View style={[styles.selectedAvatar, { backgroundColor: colors.secondaryDim }]}>
                  <Icon source="car" size={22} color={colors.secondary} />
                </View>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>
                    {selectedVehicle.make} {selectedVehicle.model}
                  </Text>
                  <Text style={[styles.selectedSubtitle, { color: colors.primary }]}>
                    {selectedVehicle.licensePlate}
                  </Text>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedVehicle(null);
                  }}
                  hitSlop={12}
                >
                  <Icon source="close-circle" size={22} color={colors.systemGray3} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.placeholderRow}>
                <Icon source="car-search" size={28} color={colors.systemGray3} />
                <Text style={styles.placeholderText}>
                  {selectedCustomer ? 'Tap to select vehicle' : 'Select customer first'}
                </Text>
                <Icon source="chevron-right" size={20} color={colors.systemGray3} />
              </View>
            )}
          </Pressable>
          {errors.vehicleId && <Text style={styles.errorText}>{errors.vehicleId}</Text>}

          {/* Order Details */}
          <Text style={styles.sectionLabel}>ORDER DETAILS</Text>
          <GlassCard style={styles.detailsCard}>
            <Input
              label="Work Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the work to be done..."
              multiline
              numberOfLines={2}
            />
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Input
                  label="KM Reading"
                  value={kmReading}
                  onChangeText={(v) => setKmReading(v.replace(/[^0-9]/g, ''))}
                  placeholder="Odometer"
                  keyboardType="numeric"
                  leftIcon="speedometer"
                />
              </View>
            </View>
            <Input
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Internal notes..."
              multiline
              numberOfLines={2}
            />
          </GlassCard>

          {/* Labor Section */}
          <ExpandableSection
            title="Labor"
            icon="wrench"
            iconColor={colors.primary}
            expanded={laborExpanded}
            onToggle={() => setLaborExpanded(!laborExpanded)}
            count={laborItems.length}
            total={laborTotal}
          >
            {/* Add Labor Form */}
            <Text style={styles.subSectionLabel}>ADD LABOR</Text>
            <View style={styles.inputForm}>
              <TextInput
                ref={laborDescRef}
                style={styles.formInput}
                value={customLaborDesc}
                onChangeText={setCustomLaborDesc}
                placeholder="Service description"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => laborAmountRef.current?.focus()}
              />
              <View style={styles.formAmountRow}>
                <View style={styles.currencyPrefix}>
                  <Text style={styles.currencyText}>Rs.</Text>
                </View>
                <TextInput
                  ref={laborAmountRef}
                  style={styles.formAmountInput}
                  value={customLaborAmount}
                  onChangeText={(v) => setCustomLaborAmount(v.replace(/[^0-9]/g, ''))}
                  placeholder="Amount"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleAddLabor}
                />
                <Pressable
                  style={[
                    styles.addBtn,
                    (!customLaborDesc.trim() || !customLaborAmount) && styles.addBtnDisabled,
                  ]}
                  onPress={handleAddLabor}
                  disabled={!customLaborDesc.trim() || !customLaborAmount}
                >
                  <Icon source="plus" size={18} color={colors.textOnPrimary} />
                </Pressable>
              </View>
            </View>

            {/* Added Items */}
            {laborItems.length > 0 && (
              <>
                <Text style={[styles.subSectionLabel, { marginTop: 16 }]}>
                  ADDED ({laborItems.length})
                </Text>
                <View style={styles.addedItemsList}>
                  {laborItems.map((item) => (
                    <View key={item.id} style={styles.addedItem}>
                      <View style={styles.addedItemIcon}>
                        <Icon source="wrench" size={16} color={colors.primary} />
                      </View>
                      <Text style={styles.addedItemName} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <Text style={styles.addedItemPrice}>{formatCurrency(item.total)}</Text>
                      <Pressable onPress={() => handleDeleteLabor(item.id)} hitSlop={8}>
                        <Icon source="close-circle" size={20} color={colors.error} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ExpandableSection>

          {/* Parts Section */}
          <ExpandableSection
            title="Parts"
            icon="cog"
            iconColor={colors.secondary}
            expanded={partsExpanded}
            onToggle={() => setPartsExpanded(!partsExpanded)}
            count={partItems.length}
            total={partsTotal}
          >
            {/* Add Part Form */}
            <Text style={styles.subSectionLabel}>ADD PART</Text>
            <View style={styles.inputForm}>
              <TextInput
                ref={partNameRef}
                style={styles.formInput}
                value={customPartName}
                onChangeText={setCustomPartName}
                placeholder="Part name"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => partPriceRef.current?.focus()}
              />
              <View style={styles.formAmountRow}>
                <View style={styles.currencyPrefix}>
                  <Text style={styles.currencyText}>Rs.</Text>
                </View>
                <TextInput
                  ref={partPriceRef}
                  style={[styles.formAmountInput, { flex: 1 }]}
                  value={customPartPrice}
                  onChangeText={(v) => setCustomPartPrice(v.replace(/[^0-9]/g, ''))}
                  placeholder="Price"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                />
                <View style={styles.qtyStepper}>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => {
                      const q = parseInt(customPartQty) || 1;
                      if (q > 1) setCustomPartQty(String(q - 1));
                    }}
                  >
                    <Icon source="minus" size={16} color={colors.textPrimary} />
                  </Pressable>
                  <Text style={styles.qtyValue}>{customPartQty}</Text>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => setCustomPartQty(String((parseInt(customPartQty) || 0) + 1))}
                  >
                    <Icon source="plus" size={16} color={colors.textPrimary} />
                  </Pressable>
                </View>
                <Pressable
                  style={[
                    styles.addBtn,
                    { backgroundColor: colors.secondary },
                    (!customPartName.trim() || !customPartPrice) && styles.addBtnDisabled,
                  ]}
                  onPress={handleAddPart}
                  disabled={!customPartName.trim() || !customPartPrice}
                >
                  <Icon source="plus" size={18} color={colors.textOnPrimary} />
                </Pressable>
              </View>
            </View>

            {/* Added Parts */}
            {partItems.length > 0 && (
              <>
                <Text style={[styles.subSectionLabel, { marginTop: 16 }]}>
                  ADDED ({partItems.length})
                </Text>
                <View style={styles.addedItemsList}>
                  {partItems.map((item) => (
                    <View key={item.id} style={styles.addedItem}>
                      <View style={[styles.addedItemIcon, { backgroundColor: colors.secondaryDim }]}>
                        <Icon source="cog" size={16} color={colors.secondary} />
                      </View>
                      <View style={styles.addedItemInfo}>
                        <Text style={styles.addedItemName} numberOfLines={1}>
                          {item.partName}
                        </Text>
                        {item.quantity > 1 && (
                          <Text style={styles.addedItemQty}>
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.addedItemPrice, { color: colors.secondary }]}>
                        {formatCurrency(item.total)}
                      </Text>
                      <Pressable onPress={() => handleDeletePart(item.id)} hitSlop={8}>
                        <Icon source="close-circle" size={20} color={colors.error} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ExpandableSection>

          {/* Advance Payment Section */}
          <ExpandableSection
            title="Advance Payment"
            icon="cash"
            iconColor={colors.success}
            expanded={paymentExpanded}
            onToggle={() => setPaymentExpanded(!paymentExpanded)}
            count={advanceValue > 0 ? 1 : undefined}
            total={advanceValue > 0 ? advanceValue : undefined}
          >
            <Input
              label="Amount (Rs.)"
              value={advanceAmount}
              onChangeText={(v) => setAdvanceAmount(v.replace(/[^0-9]/g, ''))}
              placeholder="Enter advance amount"
              keyboardType="numeric"
              leftIcon="cash"
            />

            <Text style={[styles.subSectionLabel, { marginTop: 16 }]}>PAYMENT METHOD</Text>
            <View style={styles.paymentMethodRow}>
              {(['cash', 'upi', 'card'] as PaymentMethod[]).map((method) => (
                <Chip
                  key={method}
                  selected={advanceMethod === method}
                  onPress={() => setAdvanceMethod(method)}
                  style={styles.paymentChip}
                >
                  {PAYMENT_METHOD_LABELS[method]}
                </Chip>
              ))}
            </View>

            <View style={{ marginTop: 12 }}>
              <Input
                label="Notes (Optional)"
                value={advanceNotes}
                onChangeText={setAdvanceNotes}
                placeholder="Payment notes..."
              />
            </View>
          </ExpandableSection>
        </ScrollView>

        {/* Sticky Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              {advanceValue > 0 && (
                <Text style={styles.balanceText}>Balance: {formatCurrency(balanceDue)}</Text>
              )}
            </View>
            <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
          </View>
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!selectedCustomer || !selectedVehicle}
            fullWidth
          >
            Create Order
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Customer Picker Modal */}
      <Modal
        visible={showCustomerPicker}
        animationType="slide"
        onRequestClose={() => setShowCustomerPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Customer</Text>
            <Pressable onPress={() => setShowCustomerPicker(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
          </View>
          <View style={styles.modalSearchContainer}>
            <View style={styles.modalSearchBar}>
              <Icon source="magnify" size={20} color={colors.systemGray} />
              <TextInput
                style={styles.modalSearchInput}
                value={customerSearchQuery}
                onChangeText={setCustomerSearchQuery}
                placeholder="Search by name or phone..."
                placeholderTextColor={colors.textTertiary}
                autoCorrect={false}
              />
              {customerSearchQuery.length > 0 && (
                <Pressable onPress={() => setCustomerSearchQuery('')}>
                  <Icon source="close-circle" size={18} color={colors.systemGray3} />
                </Pressable>
              )}
            </View>
            {/* Add Customer Button */}
            <Pressable
              style={styles.addNewRow}
              onPress={() => {
                setShowCustomerPicker(false);
                router.push('/customer-new?fromCreateOrder=true');
              }}
            >
              <View style={[styles.addNewIcon, { backgroundColor: colors.successDim }]}>
                <Icon source="plus" size={18} color={colors.success} />
              </View>
              <Text style={styles.addNewText}>Add New Customer</Text>
              <Icon source="chevron-right" size={18} color={colors.systemGray} />
            </Pressable>
          </View>
          {loadingData ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : filteredCustomers.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon source="account-off" size={48} color={colors.systemGray3} />
              <Text style={styles.emptyText}>No customers found</Text>
              <Text style={styles.emptySubtext}>Add a new customer to get started</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable style={styles.listItem} onPress={() => handleSelectCustomer(item)}>
                  <View style={styles.listItemAvatar}>
                    <Text style={styles.listItemAvatarText}>
                      {item.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{item.name}</Text>
                    <Text style={styles.listItemSubtitle}>{item.phone || 'No phone'}</Text>
                  </View>
                  <Icon source="chevron-right" size={20} color={colors.systemGray3} />
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Vehicle Picker Modal */}
      <Modal
        visible={showVehiclePicker}
        animationType="slide"
        onRequestClose={() => setShowVehiclePicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Vehicle</Text>
            <Pressable onPress={() => setShowVehiclePicker(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
          </View>
          <View style={styles.modalSearchContainer}>
            <View style={styles.modalSearchBar}>
              <Icon source="magnify" size={20} color={colors.systemGray} />
              <TextInput
                style={styles.modalSearchInput}
                value={vehicleSearchQuery}
                onChangeText={setVehicleSearchQuery}
                placeholder="Search by plate, make, model..."
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {vehicleSearchQuery.length > 0 && (
                <Pressable onPress={() => setVehicleSearchQuery('')}>
                  <Icon source="close-circle" size={18} color={colors.systemGray3} />
                </Pressable>
              )}
            </View>
            {/* Add Vehicle Button */}
            <Pressable
              style={styles.addNewRow}
              onPress={() => {
                setShowVehiclePicker(false);
                router.push(
                  selectedCustomer
                    ? `/vehicle-new?customerId=${selectedCustomer.id}&fromCreateOrder=true`
                    : '/vehicle-new?fromCreateOrder=true'
                );
              }}
            >
              <View style={[styles.addNewIcon, { backgroundColor: colors.successDim }]}>
                <Icon source="plus" size={18} color={colors.success} />
              </View>
              <Text style={styles.addNewText}>Add New Vehicle</Text>
              <Icon source="chevron-right" size={18} color={colors.systemGray} />
            </Pressable>
          </View>
          {loadingData ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : filteredVehiclesForPicker.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon source="car-off" size={48} color={colors.systemGray3} />
              <Text style={styles.emptyText}>
                {selectedCustomer ? 'No vehicles for this customer' : 'No vehicles found'}
              </Text>
              <Text style={styles.emptySubtext}>Add a new vehicle to get started</Text>
            </View>
          ) : (
            <FlatList
              data={filteredVehiclesForPicker}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable style={styles.listItem} onPress={() => handleSelectVehicle(item)}>
                  <View style={[styles.listItemAvatar, { backgroundColor: colors.secondaryDim }]}>
                    <Icon source="car" size={22} color={colors.secondary} />
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemPlate}>{item.licensePlate}</Text>
                    <Text style={styles.listItemTitle}>
                      {item.make} {item.model}
                      {item.year ? ` (${item.year})` : ''}
                    </Text>
                    {item.customerName && !selectedCustomer && (
                      <Text style={styles.listItemSubtitle}>{item.customerName}</Text>
                    )}
                  </View>
                  <Icon source="chevron-right" size={20} color={colors.systemGray3} />
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
});

export default CreateOrderScreen;

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
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  selectorCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  errorCard: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  selectedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectedSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: colors.textTertiary,
    marginLeft: 12,
  },
  detailsCard: {
    padding: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  inputHalf: {
    flex: 1,
  },
  expandableSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  expandableIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandableHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  expandableCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expandableContent: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  subSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 10,
  },
  inputForm: {
    padding: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
  },
  formInput: {
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  formAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyPrefix: {
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  formAmountInput: {
    flex: 2,
    height: 44,
    backgroundColor: colors.surface,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 8,
    fontSize: 15,
    color: colors.textPrimary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: colors.systemGray4,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  addedItemsList: {
    gap: 8,
  },
  addedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  addedItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedItemInfo: {
    flex: 1,
  },
  addedItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  addedItemQty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  addedItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentChip: {
    marginBottom: 4,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
  },
  balanceText: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalCancel: {
    fontSize: 17,
    color: colors.primary,
  },
  modalSearchContainer: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  addNewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  addNewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.success,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
  },
  listItemAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  listItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  listItemPlate: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.separator,
    marginLeft: 70,
  },
});
