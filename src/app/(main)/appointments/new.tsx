import { useState } from 'react';
import { View, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { Text, IconButton, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { Button, Input, Card, TopBar } from '@presentation/components/common';
import { colors } from '@theme/colors';
import { SERVICE_TYPES, TIME_SLOTS, DEFAULT_APPOINTMENT_DURATION } from '@core/constants';
import { formatDate } from '@core/utils/formatDate';

export default function NewAppointmentScreen() {
  const [isLoading, setIsLoading] = useState(false);
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

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.back();
    } catch (err) {
      console.error('Failed to book appointment:', err);
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
            onPress={() => {}}
          >
            {form.vehicleId ? (
              <View style={styles.selectedItem}>
                <View style={styles.selectedIcon}>
                  <IconButton icon="car" size={24} iconColor={colors.primary} />
                </View>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>Maruti Swift (2020)</Text>
                  <Text style={styles.selectedSubtitle}>MH 12 AB 1234 • Rahul Sharma</Text>
                </View>
                <IconButton icon="close" size={20} onPress={() => updateField('vehicleId', '')} iconColor={colors.textSecondary} />
              </View>
            ) : (
              <View style={styles.placeholderItem}>
                <IconButton icon="car-search" size={32} iconColor={colors.textSecondary} />
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

      <View style={styles.footer}>
        <Button onPress={() => router.back()} mode="outlined" style={styles.footerButton}>
          Cancel
        </Button>
        <Button onPress={handleSubmit} loading={isLoading} style={styles.footerButton}>
          Book Appointment
        </Button>
      </View>
    </SafeAreaView>
  );
}

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
});
