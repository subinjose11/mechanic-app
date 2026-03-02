import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Text, IconButton, Searchbar, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@presentation/components/common';
import { useVehicles, useVehicle } from '@presentation/viewmodels/useVehicles';
import { useCreateOrder } from '@presentation/viewmodels/useOrders';
import { colors } from '@theme/colors';

export default function NewOrderScreen() {
  const { vehicleId: initialVehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const createOrderMutation = useCreateOrder();

  const [form, setForm] = useState({
    vehicleId: initialVehicleId || '',
    kmReading: '',
    description: '',
    notes: '',
  });

  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load selected vehicle details
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

    try {
      await createOrderMutation.mutateAsync({
        vehicleId: form.vehicleId,
        customerId: selectedVehicle?.customerId || '',
        kmReading: form.kmReading ? parseInt(form.kmReading, 10) : undefined,
        description: form.description || undefined,
        notes: form.notes || undefined,
      });
      router.replace('/(main)/orders');
    } catch (err) {
      console.error('Failed to create order:', err);
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
          {/* Vehicle Selection */}
          <Text style={styles.sectionTitle}>Select Vehicle *</Text>
          <Card
            style={[styles.selectionCard, errors.vehicleId && styles.errorCard] as any}
            onPress={() => setShowVehiclePicker(true)}
          >
            {selectedVehicle ? (
              <View style={styles.selectedItem}>
                <View style={styles.selectedIcon}>
                  <IconButton icon="car" size={24} iconColor={colors.primary} />
                </View>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>
                    {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                  </Text>
                  <Text style={styles.selectedSubtitle}>{selectedVehicle.licensePlate}</Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    updateField('vehicleId', '');
                    setSelectedVehicle(null);
                  }}
                />
              </View>
            ) : (
              <View style={styles.placeholderItem}>
                <IconButton icon="car-search" size={32} iconColor={colors.textSecondary} />
                <Text style={styles.placeholderText}>Tap to select a vehicle</Text>
              </View>
            )}
          </Card>
          {errors.vehicleId && <Text style={styles.errorText}>{errors.vehicleId}</Text>}

          {/* KM Reading */}
          <Text style={styles.sectionTitle}>KM Reading</Text>
          <Input
            label="Odometer Reading (KM)"
            value={form.kmReading}
            onChangeText={(v) => updateField('kmReading', v.replace(/[^0-9]/g, ''))}
            placeholder="Enter current KM reading"
            keyboardType="numeric"
            left={<IconButton icon="speedometer" size={20} iconColor={colors.textSecondary} />}
          />

          {/* Description */}
          <Text style={styles.sectionTitle}>Work Description</Text>
          <Input
            label="Service Details"
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            placeholder="Describe the work to be done (e.g., Oil change, Brake repair, etc.)"
            multiline
            numberOfLines={4}
          />

          {/* Notes */}
          <View style={styles.spacing} />
          <Input
            label="Internal Notes (Optional)"
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            placeholder="Any internal notes or reminders..."
            multiline
            numberOfLines={2}
          />

          {/* Info */}
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconButton icon="information" size={20} iconColor={colors.info} />
              <Text style={styles.infoText}>
                After creating the order, you can add labor charges and spare parts from the order details page.
              </Text>
            </View>
          </Card>
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
            loading={createOrderMutation.isPending}
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
            <IconButton icon="close" onPress={() => setShowVehiclePicker(false)} />
          </View>

          <Searchbar
            placeholder="Search by plate, make, model..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.modalSearchBar}
          />

          {loadingVehicles ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : filteredVehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <IconButton icon="car-off" size={48} iconColor={colors.textDisabled} />
              <Text style={styles.emptyText}>No vehicles found</Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowVehiclePicker(false);
                  router.push('/(main)/vehicles/new');
                }}
                style={styles.addButton}
              >
                Add New Vehicle
              </Button>
            </View>
          ) : (
            <FlatList
              data={filteredVehicles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.vehicleItem}
                  onPress={() => selectVehicle(item)}
                >
                  <View style={styles.vehicleIcon}>
                    <IconButton icon="car" size={24} iconColor={colors.primary} />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleTitle}>
                      {item.make} {item.model} ({item.year})
                    </Text>
                    <Text style={styles.vehiclePlate}>{item.licensePlate}</Text>
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
    height: 8,
  },
  infoCard: {
    marginTop: 24,
    backgroundColor: `${colors.info}10`,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
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
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  vehiclePlate: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
