import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text, Icon } from 'react-native-paper';
import { colors } from '@theme/colors';
import { Button } from './Button';

interface ErrorViewProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorView({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}: ErrorViewProps) {
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).stiffness(200)}
      style={[styles.container, style]}
    >
      <Icon source="alert-circle-outline" size={64} color={colors.error} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button onPress={onRetry} mode="outlined" color="error" style={styles.button}>
          Try Again
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
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
  },
});

export default ErrorView;
