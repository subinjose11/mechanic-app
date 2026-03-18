import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass } from '@theme/glass';
import { colors } from '@theme/colors';

interface GlassViewProps {
  children: React.ReactNode;
  level?: 'base' | 'card' | 'elevated' | 'modal' | 'tabBar';
  style?: ViewStyle;
  blurEnabled?: boolean;
  gradientBorder?: boolean;
}

export function GlassView({
  children,
  level = 'card',
  style,
  blurEnabled = true,
}: GlassViewProps) {
  const config = glass[level];

  if (Platform.OS === 'ios' && blurEnabled && config.blurIntensity > 0) {
    return (
      <BlurView
        intensity={config.blurIntensity}
        tint={config.blurTint}
        style={[
          styles.base,
          {
            borderRadius: 'borderRadius' in config ? config.borderRadius : 0,
            borderWidth: config.borderWidth,
            borderColor: config.borderColor,
          },
          style,
        ]}
      >
        <View
          style={[
            styles.overlay,
            { backgroundColor: config.backgroundColor },
          ]}
        >
          {children}
        </View>
      </BlurView>
    );
  }

  // Android: solid dark fallback
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: level === 'base'
            ? colors.backgroundAlt
            : level === 'tabBar'
            ? colors.background
            : colors.surface,
          borderRadius: 'borderRadius' in config ? config.borderRadius : 0,
          borderWidth: config.borderWidth,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
  },
});

export default GlassView;
