import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text, Icon } from 'react-native-paper';
import { colors } from '@theme/colors';
import { spacing } from '@theme/index';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon = 'inbox-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).stiffness(200)}
      style={[styles.container, style]}
    >
      <View style={styles.iconContainer}>
        <Icon source={icon} size={48} color={colors.systemGray} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button onPress={onAction} mode="contained" style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.lg,
  },
});

export default EmptyState;
