import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Text, IconButton, Searchbar, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@presentation/components/common';
import { useCustomers } from '@presentation/viewmodels/useCustomers';
import { useCreateVehicle } from '@presentation/viewmodels/useVehicles';
import { colors } from '@theme/colors';
import { isValidLicensePlate, isValidVIN, isValidYear } from '@core/utils/validators';
import { Customer } from '@domain/entities/Customer';

export default function NewVehicleScreen() {
  const { customerId: initialCustomerId } = useLocalSearchParams<{ customerId?: string }>();
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const createVehicleMutation = useCreateVehicle();

  const [form, setForm] = useState({
    customerId: initialCustomerId || '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    color: '',
    notes: '',
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load selected customer details
  useEffect(() => {
    if (form.customerId && customers) {
      const customer = customers.find(c => c.id === form.customerId);
      setSelectedCustomer(customer || null);
    }
  }, [form.customerId, customers]);

  const filteredCustomers = customers?.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
  }) || [];

  const selectCustomer = (customer: Customer) => {
    setForm(prev => ({ ...prev, customerId: customer.id }));
    setSelectedCustomer(customer);
    setShowCustomerPicker(false);
    setSearchQuery('');
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.customerId) {
      newErrors.customerId = 'Please select a customer';
    }
    if (!form.make.trim()) {
      newErrors.make = 'Vehicle make is required';
    }
    if (!form.model.trim()) {
      newErrors.model = 'Vehicle model is required';
    }
    if (!form.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    } else if (!isValidLicensePlate(form.licensePlate)) {
      newErrors.licensePlate = 'Please enter a valid license plate';
    }
    if (form.year && !isValidYear(parseInt(form.year))) {
      newErrors.year = 'Please enter a valid year';
    }
    if (form.vin && !isValidVIN(form.vin)) {
      newErrors.vin = 'Please enter a valid VIN (17 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createVehicleMutation.mutateAsync({
        customerId: form.customerId,
        make: form.make,
        model: form.model,
        year: form.year ? parseInt(form.year, 10) : undefined,
        licensePlate: form.licensePlate,
        vin: form.vin || undefined,
        color: form.color || undefined,
        notes: form.notes || undefined,
      });
      router.back();
    } catch (err) {
      console.error('Failed to create vehicle:', err);
    }
  };

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
          {/* Customer Selection */}
          <Text style={styles.sectionTitle}>Select Customer *</Text>
          <Card
            style={[styles.selectionCard, errors.customerId && styles.errorCard] as any}
            onPress={() => setShowCustomerPicker(true)}
          >
            {selectedCustomer ? (
              <View style={styles.selectedItem}>
                <View style={styles.selectedIcon}>
                  <IconButton icon="account" size={24} iconColor={colors.primary} />
                </View>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>{selectedCustomer.name}</Text>
                  <Text style={styles.selectedSubtitle}>{selectedCustomer.phone || 'No phone'}</Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    updateField('customerId', '');
                    setSelectedCustomer(null);
                  }}
                />
              </View>
            ) : (
              <View style={styles.placeholderItem}>
                <IconButton icon="account-search" size={32} iconColor={colors.textSecondary} />
                <Text style={styles.placeholderText}>Tap to select a customer</Text>
              </View>
            )}
          </Card>
          {errors.customerId && <Text style={styles.errorText}>{errors.customerId}</Text>}

          {/* Vehicle Information */}
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <Input
            label="Make *"
            value={form.make}
            onChangeText={(v) => updateField('make', v)}
            placeholder="e.g., Maruti Suzuki"
            error={errors.make}
            autoCapitalize="words"
          />

          <View style={styles.spacing} />

          <Input
            label="Model *"
            value={form.model}
            onChangeText={(v) => updateField('model', v)}
            placeholder="e.g., Swift"
            error={errors.model}
            autoCapitalize="words"
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Input
                label="Year"
                value={form.year}
                onChangeText={(v) => updateField('year', v)}
                placeholder="e.g., 2020"
                keyboardType="numeric"
                maxLength={4}
                error={errors.year}
              />
            </View>
            <View style={styles.halfField}>
              <Input
                label="Color"
                value={form.color}
                onChangeText={(v) => updateField('color', v)}
                placeholder="e.g., Red"
                autoCapitalize="words"
              />
            </View>
          </View>

          <Input
            label="License Plate *"
            value={form.licensePlate}
            onChangeText={(v) => updateField('licensePlate', v.toUpperCase())}
            placeholder="e.g., MH 12 AB 1234"
            autoCapitalize="characters"
            error={errors.licensePlate}
          />

          <View style={styles.spacing} />

          <Input
            label="VIN (Optional)"
            value={form.vin}
            onChangeText={(v) => updateField('vin', v.toUpperCase())}
            placeholder="17-character VIN"
            autoCapitalize="characters"
            maxLength={17}
            error={errors.vin}
          />

          <View style={styles.spacing} />

          <Input
            label="Notes (Optional)"
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            placeholder="Any special notes about this vehicle"
            multiline
            numberOfLines={3}
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
            loading={createVehicleMutation.isPending}
            style={styles.footerButton}
          >
            Add Vehicle
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
            <IconButton icon="close" onPress={() => setShowCustomerPicker(false)} />
          </View>

          <Searchbar
            placeholder="Search by name or phone..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.modalSearchBar}
          />

          {loadingCustomers ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : filteredCustomers.length === 0 ? (
            <View style={styles.emptyState}>
              <IconButton icon="account-off" size={48} iconColor={colors.textDisabled} />
              <Text style={styles.emptyText}>No customers found</Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowCustomerPicker(false);
                  router.push('/(main)/customers/new');
                }}
                style={styles.addButton}
              >
                Add New Customer
              </Button>
            </View>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => selectCustomer(item)}
                >
                  <View style={styles.customerIcon}>
                    <IconButton icon="account" size={24} iconColor={colors.primary} />
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <Text style={styles.customerPhone}>{item.phone || 'No phone'}</Text>
                  </View>
                  <IconButton icon="chevron-right" size={20} iconColor={colors.textDisabled} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 12,
  },
  selectionCard: {
    padding: 0,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  selectedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  placeholderItem: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  spacing: {
    height: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  halfField: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalSearchBar: {
    margin: 16,
    backgroundColor: colors.surface,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  addButton: {
    marginTop: 16,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
  },
  customerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
