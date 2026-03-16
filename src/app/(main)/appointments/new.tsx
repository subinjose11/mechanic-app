import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, FlatList, TextInput, Pressable, Alert } from 'react-native';
import { Text, IconButton, Chip, ActivityIndicator, Icon } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { observer } from 'mobx-react-lite';
import { Button, Input, Card, TopBar } from '@presentation/components/common';
import { useVehicleStore, useCustomerStore } from '@stores';
import { useVehicleController, useAppointmentController } from '@controllers';
import { colors } from '@theme/colors';
import { SERVICE_TYPES, TIME_SLOTS, DEFAULT_APPOINTMENT_DURATION } from '@core/constants';
import { formatDate } from '@core/utils/formatDate';

const NewAppointmentScreen = observer(function NewAppointmentScreen() {
  const insets = useSafeAreaInsets();
  const vehicleStore = useVehicleStore();
  const customerStore = useCustomerStore();
  const vehicleController = useVehicleController();
  const appointmentController = useAppointmentController();

  const [isLoading, setIsLoading] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [form, setForm] = useState({
    vehicleId: '',
    customerId: '',
    scheduledDate: '',
    scheduledTime: '',
    serviceType: '',
    durationMinutes: DEFAULT_APPOINTMENT_DURATION,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    vehicleController.fetchAll();
  }, []);

  const vehicles = vehicleStore.vehicles || [];
  const loadingVehicles = vehicleStore.isLoading;

  const filteredVehicles = vehicles.filter(v => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.licensePlate.toLowerCase().includes(query) ||
      v.make.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query)
    );
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const selectVehicle = (vehicle: any) => {
    const customer = customerStore.getById(vehicle.customerId);
    setSelectedVehicle(vehicle);
    setForm(prev => ({
      ...prev,
      vehicleId: vehicle.id,
      customerId: vehicle.customerId,
    }));
    setShowVehiclePicker(false);
    setSearchQuery('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.vehicleId) newErrors.vehicleId = 'Please select a vehicle';
    if (!form.scheduledDate) newErrors.scheduledDate = 'Please select a date';
    if (!form.scheduledTime) newErrors.scheduledTime = 'Please select a time';
    if (!form.serviceType) newErrors.serviceType = 'Please select a service type';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await appointmentController.create({
        vehicleId: form.vehicleId,
        customerId: form.customerId,
        scheduledDate: new Date(form.scheduledDate),
        scheduledTime: form.scheduledTime,
        durationMinutes: form.durationMinutes,
        serviceType: form.serviceType,
        notes: form.notes.trim() || undefined,
      });
      router.back();
    } catch (err) {
      console.error('Failed to book appointment:', err);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (day: DateData) => {
    updateField('scheduledDate', day.dateString);
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const customer = selectedVehicle ? customerStore.getById(selectedVehicle.customerId) : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TopBar title="New Appointment" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Selection */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Vehicle</Text>
          <Card
            style={[styles.selectionCard, errors.vehicleId && styles.errorCard] as any}
            onPress={() => setShowVehiclePicker(true)}
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
                  <Text style={styles.selectedSubtitle}>
                    {selectedVehicle.licensePlate} {customer ? `• ${customer.name}` : ''}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    setSelectedVehicle(null);
                    updateField('vehicleId', '');
                    updateField('customerId', '');
                  }}
                  iconColor={colors.textSecondary}
                />
              </View>
            ) : (
              <View style={styles.placeholderItem}>
                <Icon source="car-search" size={32} color={colors.textSecondary} />
                <Text style={styles.placeholderText}>Tap to select a vehicle</Text>
              </View>
            )}
          </Card>
          {errors.vehicleId && <Text style={styles.errorText}>{errors.vehicleId}</Text>}
        </Card>

        {/* Service Type */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Service Type</Text>
          <View style={styles.chipContainer}>
            {SERVICE_TYPES.slice(0, 8).map((type) => (
              <Chip
                key={type}
                selected={form.serviceType === type}
                onPress={() => updateField('serviceType', type)}
                style={[styles.chip, form.serviceType === type && styles.chipSelected]}
                textStyle={[styles.chipText, form.serviceType === type && styles.chipTextSelected]}
                showSelectedCheck={false}
              >
                {type}
              </Chip>
            ))}
          </View>
          {errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
        </Card>

        {/* Date Selection */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            current={form.scheduledDate || getMinDate()}
            onDayPress={handleDateSelect}
            minDate={getMinDate()}
            markedDates={{
              [form.scheduledDate]: {
                selected: true,
                selectedColor: colors.primary,
              },
            }}
            theme={{
              calendarBackground: colors.surfaceVariant,
              selectedDayBackgroundColor: colors.primary,
              todayTextColor: colors.primary,
              arrowColor: colors.primary,
              monthTextColor: colors.textPrimary,
              dayTextColor: colors.textPrimary,
              textDisabledColor: colors.textDisabled,
            }}
            style={styles.calendar}
          />
          {form.scheduledDate && (
            <Text style={styles.selectedDateText}>
              Selected: {formatDate(new Date(form.scheduledDate))}
            </Text>
          )}
          {errors.scheduledDate && <Text style={styles.errorText}>{errors.scheduledDate}</Text>}
        </Card>

        {/* Time Selection */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => (
              <Chip
                key={time}
                selected={form.scheduledTime === time}
                onPress={() => updateField('scheduledTime', time)}
                style={[styles.timeChip, form.scheduledTime === time && styles.chipSelected]}
                textStyle={[styles.chipText, form.scheduledTime === time && styles.chipTextSelected]}
              >
                {time}
              </Chip>
            ))}
          </View>
          {errors.scheduledTime && <Text style={styles.errorText}>{errors.scheduledTime}</Text>}
        </Card>

        {/* Duration */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationContainer}>
            {[30, 60, 90, 120].map((mins) => (
              <Chip
                key={mins}
                selected={form.durationMinutes === mins}
                onPress={() => updateField('durationMinutes', mins)}
                style={[styles.chip, form.durationMinutes === mins && styles.chipSelected]}
                textStyle={[styles.chipText, form.durationMinutes === mins && styles.chipTextSelected]}
              >
                {mins} min
              </Chip>
            ))}
          </View>
        </Card>

        {/* Notes */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <Input
            label="Additional Notes"
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            placeholder="Any special requirements..."
            multiline
            numberOfLines={3}
          />
        </Card>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button onPress={() => router.back()} mode="outlined" style={styles.footerButton}>
          Cancel
        </Button>
        <Button onPress={handleSubmit} loading={isLoading} style={styles.footerButton}>
          Book Appointment
        </Button>
      </View>

      {/* Vehicle Picker Modal */}
      <Modal
        visible={showVehiclePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVehiclePicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Vehicle</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => {
                setShowVehiclePicker(false);
                setSearchQuery('');
              }}
            />
          </View>

          <View style={styles.searchContainer}>
            <Icon source="magnify" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by plate, make, or model..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <IconButton
                icon="close-circle"
                size={18}
                onPress={() => setSearchQuery('')}
                iconColor={colors.textSecondary}
              />
            )}
          </View>

          {loadingVehicles ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredVehicles}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.vehicleList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon source="car-off" size={48} color={colors.textDisabled} />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No vehicles found' : 'No vehicles added yet'}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowVehiclePicker(false);
                      router.push('/(main)/quick-add');
                    }}
                    style={styles.addButton}
                  >
                    Add Vehicle
                  </Button>
                </View>
              }
              renderItem={({ item }) => {
                const itemCustomer = customerStore.getById(item.customerId);
                return (
                  <Pressable
                    style={styles.vehicleItem}
                    onPress={() => selectVehicle(item)}
                  >
                    <View style={styles.vehicleIcon}>
                      <Text style={styles.vehicleEmoji}>
                        {item.make?.toLowerCase().includes('bike') ? '🛵' : '🚗'}
                      </Text>
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleName}>
                        {item.make} {item.model}
                      </Text>
                      <Text style={styles.vehicleDetails}>
                        {item.licensePlate} • {itemCustomer?.name || 'Unknown'}
                      </Text>
                    </View>
                    <Icon source="chevron-right" size={20} color={colors.textDisabled} />
                  </Pressable>
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
});

export default NewAppointmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  selectionCard: {
    padding: 0,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: colors.primaryDim,
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
    fontSize: 13,
    color: colors.textSecondary,
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
    marginTop: 8,
    marginLeft: 4,
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
  chipSelected: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  chipText: {
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  calendar: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  selectedDateText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    marginBottom: 4,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 8,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    margin: 16,
    paddingLeft: 12,
    paddingRight: 4,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleList: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleEmoji: {
    fontSize: 20,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  vehicleDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
