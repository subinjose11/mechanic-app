import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, FlatList, StatusBar, TextInput, Pressable } from 'react-native';
import { Text, IconButton, ActivityIndicator, Icon } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Button, Input, TopBar } from '@presentation/components/common';
import { useVehicleStore, useUIStore } from '@stores';
import { useVehicleController, useOrderController } from '@controllers';
import { colors } from '@theme/colors';

const NewOrderScreen = observer(function NewOrderScreen() {
  const { vehicleId: initialVehicleId, customerId: initialCustomerId } = useLocalSearchParams<{ vehicleId?: string; customerId?: string }>();
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const vehicleStore = useVehicleStore();
  const uiStore = useUIStore();
  const vehicleController = useVehicleController();
  const orderController = useOrderController();

  useEffect(() => {
    vehicleController.fetchAll();
  }, []);

  const vehicles = vehicleStore.vehicles;
  const loadingVehicles = uiStore.isLoading;

  const [form, setForm] = useState({
    vehicleId: initialVehicleId || '',
    kmReading: '',
    description: '',
    notes: '',
  });

  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (form.vehicleId && vehicles) {
      const vehicle = vehicles.find(v => v.id === form.vehicleId);
      setSelectedVehicle(vehicle || null);
    }
  }, [form.vehicleId, vehicles]);

  const filteredVehicles = vehicles?.filter(v => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.licensePlate.toLowerCase().includes(query) ||
      v.make.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query)
    );
  }) || [];

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const selectVehicle = (vehicle: any) => {
    setForm(prev => ({ ...prev, vehicleId: vehicle.id }));
    setSelectedVehicle(vehicle);
    setShowVehiclePicker(false);
    setSearchQuery('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.vehicleId) {
      newErrors.vehicleId = 'Please select a vehicle';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await orderController.create({
        vehicleId: form.vehicleId,
        customerId: selectedVehicle?.customerId || '',
        kmReading: form.kmReading ? parseInt(form.kmReading, 10) : undefined,
        description: form.description || undefined,
        notes: form.notes || undefined,
      });
      router.replace('/(main)/orders');
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TopBar title="New Order" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Vehicle Selection */}
          <Text style={styles.sectionTitle}>SELECT VEHICLE</Text>
          <TouchableOpacity
            style={[styles.sectionCard, errors.vehicleId && styles.errorCard]}
            onPress={() => setShowVehiclePicker(true)}
            activeOpacity={0.7}
          >
            {selectedVehicle ? (
              <View style={styles.selectedItem}>
                <View style={styles.selectedIcon}>
                  <Icon source="car" size={24} color={colors.primary} />
                </View>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>
                    {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                  </Text>
                  <Text style={styles.selectedSubtitle}>{selectedVehicle.licensePlate}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    updateField('vehicleId', '');
                    setSelectedVehicle(null);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon source="close-circle" size={22} color={colors.systemGray3} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderItem}>
                <Icon source="car-search" size={32} color={colors.systemGray3} />
                <Text style={styles.placeholderText}>Tap to select a vehicle</Text>
                <Icon source="chevron-right" size={20} color={colors.systemGray3} />
              </View>
            )}
          </TouchableOpacity>
          {errors.vehicleId && <Text style={styles.errorText}>{errors.vehicleId}</Text>}

          {/* KM Reading */}
          <Text style={styles.sectionTitle}>ODOMETER</Text>
          <View style={styles.sectionCard}>
            <Input
              label="Odometer Reading (KM)"
              value={form.kmReading}
              onChangeText={(v) => updateField('kmReading', v.replace(/[^0-9]/g, ''))}
              placeholder="Enter current KM reading"
              keyboardType="numeric"
              leftIcon="speedometer"
            />
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>SERVICE DETAILS</Text>
          <View style={styles.sectionCard}>
            <Input
              label="Work Description"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Describe the work to be done..."
              multiline
              numberOfLines={4}
            />

            <View style={styles.spacing} />

            <Input
              label="Internal Notes (Optional)"
              value={form.notes}
              onChangeText={(v) => updateField('notes', v)}
              placeholder="Any internal notes or reminders..."
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Icon source="information" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              After creating the order, you can add labor charges and spare parts from the order details page.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 80 }]}>
          <Button
            onPress={() => router.back()}
            mode="outlined"
            style={styles.footerButton}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.footerButton}
          >
            Create Order
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Vehicle Picker Modal */}
      <Modal
        visible={showVehiclePicker}
        animationType="slide"
        onRequestClose={() => setShowVehiclePicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Vehicle</Text>
            <TouchableOpacity onPress={() => setShowVehiclePicker(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearchContainer}>
            <View style={styles.modalSearchBar}>
              <Icon source="magnify" size={20} color={colors.systemGray} />
              <TextInput
                style={styles.modalSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by plate, make, model..."
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Icon source="close-circle" size={18} color={colors.systemGray3} />
                </Pressable>
              )}
            </View>
            {/* Quick Add Option */}
            <Pressable
              style={styles.quickAddRow}
              onPress={() => {
                setShowVehiclePicker(false);
                router.push(`/(main)/quick-add?plate=${encodeURIComponent(searchQuery)}&createOrder=true`);
              }}
            >
              <View style={[styles.quickAddIcon, { backgroundColor: colors.successDim }]}>
                <Icon source="plus" size={18} color={colors.success} />
              </View>
              <Text style={styles.quickAddText}>Quick Add New Customer + Vehicle</Text>
              <Icon source="chevron-right" size={18} color={colors.systemGray} />
            </Pressable>
          </View>

          {loadingVehicles ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : filteredVehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon source="car-off" size={48} color={colors.systemGray3} />
              <Text style={styles.emptyText}>
                {searchQuery ? `No vehicles matching "${searchQuery}"` : 'No vehicles found'}
              </Text>
              <Text style={styles.emptySubtext}>Add a new customer and vehicle</Text>
              <Button
                mode="contained"
                onPress={() => {
                  setShowVehiclePicker(false);
                  router.push(`/(main)/quick-add?plate=${encodeURIComponent(searchQuery)}&createOrder=true`);
                }}
                style={styles.addButton}
                icon="plus"
              >
                Quick Add
              </Button>
            </View>
          ) : (
            <FlatList
              data={filteredVehicles}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.vehicleItem}
                  onPress={() => selectVehicle(item)}
                >
                  <View style={styles.vehicleIcon}>
                    <Icon source="car" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehiclePlate}>{item.licensePlate}</Text>
                    <Text style={styles.vehicleTitle}>
                      {item.make} {item.model}{item.year ? ` (${item.year})` : ''}
                    </Text>
                    {item.customerName && (
                      <Text style={styles.vehicleCustomer}>{item.customerName}</Text>
                    )}
                  </View>
                  <Icon source="chevron-right" size={20} color={colors.systemGray3} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
});

export default NewOrderScreen;

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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 16,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectedSubtitle: {
    fontSize: 15,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  placeholderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  placeholderText: {
    flex: 1,
    fontSize: 17,
    color: colors.textTertiary,
    marginLeft: 12,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 6,
    marginLeft: 16,
  },
  spacing: {
    height: 16,
  },
  infoCard: {
    marginTop: 24,
    backgroundColor: colors.primaryDim,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.separator,
  },
  footerButton: {
    flex: 1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
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
    height: 40,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  quickAddIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddText: {
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
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    marginTop: 20,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehiclePlate: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  vehicleTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  vehicleCustomer: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.separator,
    marginLeft: 76,
  },
});
