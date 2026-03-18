import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ActivityIndicator, Text } from 'react-native-paper';
import { colors } from '@theme/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  message,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  const content = (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[styles.container, fullScreen && styles.fullScreen, style]}
    >
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </Animated.View>
  );

  if (fullScreen) {
    return <View style={styles.overlay}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,6,10,0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  message: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default LoadingSpinner;
