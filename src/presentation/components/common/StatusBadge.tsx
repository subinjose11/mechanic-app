import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { colors } from '@theme/colors';
import { OrderStatus, AppointmentStatus, ORDER_STATUS_LABELS, APPOINTMENT_STATUS_LABELS } from '@core/constants';

interface StatusBadgeProps {
  status: OrderStatus | AppointmentStatus;
  type?: 'order' | 'appointment';
  style?: ViewStyle;
  showIcon?: boolean;
}

export function StatusBadge({ status, type = 'order', style, showIcon = true }: StatusBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'in_progress') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnim]);

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bg: colors.warningDim,
          text: colors.systemOrange,
          icon: 'clock-outline',
        };
      case 'in_progress':
        return {
          bg: colors.primaryDim,
          text: colors.primary,
          icon: 'progress-wrench',
        };
      case 'completed':
        return {
          bg: colors.successDim,
          text: colors.success,
          icon: 'check-circle-outline',
        };
      case 'cancelled':
        return {
          bg: 'rgba(142,142,147,0.12)',
          text: colors.systemGray,
          icon: 'close-circle-outline',
        };
      case 'scheduled':
        return {
          bg: colors.primaryDim,
          text: colors.primary,
          icon: 'calendar-clock',
        };
      case 'confirmed':
        return {
          bg: 'rgba(88,86,214,0.12)',
          text: colors.systemIndigo,
          icon: 'calendar-check',
        };
      default:
        return {
          bg: 'rgba(142,142,147,0.12)',
          text: colors.systemGray,
          icon: 'help-circle-outline',
        };
    }
  };

  const getLabel = () => {
    if (type === 'order') {
      return ORDER_STATUS_LABELS[status as OrderStatus] || status;
    }
    return APPOINTMENT_STATUS_LABELS[status as AppointmentStatus] || status;
  };

  const config = getStatusConfig();

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          transform: [{ scale: status === 'in_progress' ? pulseAnim : 1 }],
        },
        style,
      ]}
    >
      {showIcon && (
        <Icon source={config.icon} size={12} color={config.text} />
      )}
      <Text style={[styles.text, { color: config.text }]}>{getLabel()}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default StatusBadge;
