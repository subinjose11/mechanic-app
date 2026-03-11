import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, SegmentedButtons, Icon } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DateData } from 'react-native-calendars';
import { GlassCard, AnimatedListItem, EmptyState, StatusBadge } from '@presentation/components/common';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { formatDate, formatTime } from '@core/utils/formatDate';
import { AppointmentStatus } from '@core/constants';

interface AppointmentItem {
  id: string;
  customerName: string;
  vehicleName: string;
  licensePlate: string;
  serviceType: string;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
}

const mockAppointments: AppointmentItem[] = [
  {
    id: '1',
    customerName: 'Rahul Sharma',
    vehicleName: 'Maruti Swift',
    licensePlate: 'MH 12 AB 1234',
    serviceType: 'General Service',
    scheduledDate: new Date(),
    scheduledTime: '10:00',
    durationMinutes: 60,
    status: 'confirmed',
  },
  {
    id: '2',
    customerName: 'Priya Patel',
    vehicleName: 'Honda City',
    licensePlate: 'MH 14 CD 5678',
    serviceType: 'AC Service',
    scheduledDate: new Date(),
    scheduledTime: '14:00',
    durationMinutes: 90,
    status: 'scheduled',
  },
  {
    id: '3',
    customerName: 'Amit Kumar',
    vehicleName: 'Hyundai Creta',
    licensePlate: 'MH 01 EF 9012',
    serviceType: 'Oil Change',
    scheduledDate: new Date(Date.now() + 86400000),
    scheduledTime: '11:00',
    durationMinutes: 30,
    status: 'scheduled',
  },
];

export default function AppointmentsScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);

  const filteredAppointments = mockAppointments.filter((apt) => {
    if (viewMode === 'calendar') {
      return apt.scheduledDate.toISOString().split('T')[0] === selectedDate;
    }
    return true;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const getMarkedDates = () => {
    const marked: Record<string, any> = {};
    mockAppointments.forEach((apt) => {
      const dateStr = apt.scheduledDate.toISOString().split('T')[0];
      marked[dateStr] = {
        marked: true,
        dotColor: colors.primary,
        selected: dateStr === selectedDate,
        selectedColor: colors.primary,
      };
    });
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: colors.primary,
      };
    }
    return marked;
  };

  const renderAppointmentCard = ({ item, index }: { item: AppointmentItem; index: number }) => (
    <AnimatedListItem index={index}>
      <GlassCard style={styles.appointmentCard} onPress={() => {}}>
        <View style={styles.appointmentHeader}>
          <View style={styles.timeSlot}>
            <Icon source="clock-outline" size={16} color={colors.primary} />
            <Text style={styles.time}>{item.scheduledTime}</Text>
            <Text style={styles.duration}>{item.durationMinutes} min</Text>
          </View>
          <StatusBadge status={item.status} type="appointment" />
        </View>

        <View style={styles.appointmentBody}>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
          <View style={styles.vehicleRow}>
            <Icon source="car" size={14} color={colors.textSecondary} />
            <Text style={styles.vehicleText}>
              {item.vehicleName} ({item.licensePlate})
            </Text>
          </View>
          <View style={styles.customerRow}>
            <Icon source="account" size={14} color={colors.textSecondary} />
            <Text style={styles.customerText}>{item.customerName}</Text>
          </View>
        </View>

        {viewMode === 'list' && (
          <View style={styles.dateRow}>
            <Icon source="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.dateText}>{formatDate(item.scheduledDate)}</Text>
          </View>
        )}
      </GlassCard>
    </AnimatedListItem>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#10102a', colors.background]}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Appointments</Text>
        <Text style={styles.headerSubtitle}>Manage your schedule</Text>
      </LinearGradient>

      <View style={styles.toggleContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}
          buttons={[
            { value: 'list', label: 'List', icon: 'format-list-bulleted' },
            { value: 'calendar', label: 'Calendar', icon: 'calendar-month' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {viewMode === 'calendar' && (
        <Calendar
          current={selectedDate}
          onDayPress={handleDateSelect}
          markedDates={getMarkedDates()}
          theme={{
            calendarBackground: colors.surface,
            selectedDayBackgroundColor: colors.primary,
            todayTextColor: colors.primary,
            arrowColor: colors.primary,
            monthTextColor: colors.textPrimary,
            dayTextColor: colors.textPrimary,
            textDisabledColor: colors.textDisabled,
            textDayFontWeight: '500',
            textMonthFontWeight: '600',
          }}
          style={styles.calendar}
        />
      )}

      {viewMode === 'calendar' && (
        <Text style={styles.selectedDateLabel}>
          Appointments for {formatDate(new Date(selectedDate))}
        </Text>
      )}

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointmentCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-blank"
            title={viewMode === 'calendar' ? 'No appointments on this day' : 'No appointments yet'}
            description="Book your first appointment to get started"
            actionLabel="Book Appointment"
            onAction={() => router.push('/(main)/appointments/new')}
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(main)/appointments/new')}
        color={colors.textOnPrimary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 5,
    fontWeight: '500',
  },
  toggleContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: colors.surface,
  },
  calendar: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  selectedDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  appointmentCard: {
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  duration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  appointmentBody: {
    marginBottom: 8,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
});
