import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@theme/colors';
import { OrderStatus, AppointmentStatus, ORDER_STATUS_LABELS, APPOINTMENT_STATUS_LABELS } from '@core/constants';

interface StatusBadgeProps {
  status: OrderStatus | AppointmentStatus;
  type?: 'order' | 'appointment';
  style?: ViewStyle;
}

export function StatusBadge({ status, type = 'order', style }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return colors.statusPending;
      case 'in_progress':
        return colors.statusInProgress;
      case 'completed':
        return colors.statusCompleted;
      case 'cancelled':
        return colors.statusCancelled;
      case 'scheduled':
        return colors.appointmentScheduled;
      case 'confirmed':
        return colors.appointmentConfirmed;
      default:
        return colors.textSecondary;
    }
  };

  const getLabel = () => {
    if (type === 'order') {
      return ORDER_STATUS_LABELS[status as OrderStatus] || status;
    }
    return APPOINTMENT_STATUS_LABELS[status as AppointmentStatus] || status;
  };

  const statusColor = getStatusColor();

  return (
    <View style={[styles.badge, { backgroundColor: `${statusColor}20` }, style]}>
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.text, { color: statusColor }]}>{getLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusBadge;
