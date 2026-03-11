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
            toValue: 1.05,
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
          border: colors.warningBorder,
          text: colors.warning,
          icon: 'clock-outline',
        };
      case 'in_progress':
        return {
          bg: colors.primaryDim,
          border: colors.primaryBorder,
          text: colors.primaryLight,
          icon: 'progress-wrench',
        };
      case 'completed':
        return {
          bg: colors.successDim,
          border: colors.successBorder,
          text: colors.success,
          icon: 'check-circle-outline',
        };
      case 'cancelled':
        return {
          bg: 'rgba(96,96,120,0.12)',
          border: 'rgba(96,96,120,0.3)',
          text: colors.textDisabled,
          icon: 'close-circle-outline',
        };
      case 'scheduled':
        return {
          bg: colors.primaryDim,
          border: colors.primaryBorder,
          text: colors.primaryLight,
          icon: 'calendar-clock',
        };
      case 'confirmed':
        return {
          bg: colors.secondaryDim,
          border: 'rgba(34,211,238,0.3)',
          text: colors.secondary,
          icon: 'calendar-check',
        };
      default:
        return {
          bg: 'rgba(160,160,184,0.12)',
          border: 'rgba(160,160,184,0.3)',
          text: colors.textSecondary,
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
          borderColor: config.border,
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
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

export default StatusBadge;
