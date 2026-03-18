import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text, Icon } from 'react-native-paper';
import { colors } from '@theme/colors';
import { OrderStatus, AppointmentStatus, ORDER_STATUS_LABELS, APPOINTMENT_STATUS_LABELS } from '@core/constants';
import { useEffect } from 'react';

interface StatusBadgeProps {
  status: OrderStatus | AppointmentStatus;
  type?: 'order' | 'appointment';
  style?: ViewStyle;
  showIcon?: boolean;
}

export function StatusBadge({ status, type = 'order', style, showIcon = true }: StatusBadgeProps) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (status === 'in_progress') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        false,
      );
    }
  }, [status, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: status === 'in_progress' ? pulseScale.value : 1 }],
  }));

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bg: colors.warningDim,
          text: colors.warning,
          border: colors.warningBorder,
          icon: 'clock-outline',
        };
      case 'in_progress':
        return {
          bg: colors.primaryDim,
          text: colors.primary,
          border: colors.primaryBorder,
          icon: 'progress-wrench',
        };
      case 'completed':
        return {
          bg: colors.successDim,
          text: colors.success,
          border: colors.successBorder,
          icon: 'check-circle-outline',
        };
      case 'cancelled':
        return {
          bg: 'rgba(100,116,139,0.15)',
          text: colors.systemGray,
          border: 'rgba(100,116,139,0.25)',
          icon: 'close-circle-outline',
        };
      case 'scheduled':
        return {
          bg: colors.primaryDim,
          text: colors.primary,
          border: colors.primaryBorder,
          icon: 'calendar-clock',
        };
      case 'confirmed':
        return {
          bg: colors.accentDim,
          text: colors.accent,
          border: colors.accentBorder,
          icon: 'calendar-check',
        };
      default:
        return {
          bg: 'rgba(100,116,139,0.15)',
          text: colors.systemGray,
          border: 'rgba(100,116,139,0.25)',
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
        },
        animatedStyle,
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
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default StatusBadge;
