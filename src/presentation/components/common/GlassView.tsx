import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass, GlassLevel } from '@theme/glass';

interface GlassViewProps {
  children: React.ReactNode;
  level?: GlassLevel;
  style?: ViewStyle;
  blurEnabled?: boolean;
}

export function GlassView({
  children,
  level = 'card',
  style,
  blurEnabled = true,
}: GlassViewProps) {
  const glassConfig = glass[level];

  // Blur is only supported on iOS, use fallback on Android
  const shouldBlur = blurEnabled && Platform.OS === 'ios';

  if (shouldBlur) {
    return (
      <BlurView
        intensity={glassConfig.blurIntensity}
        tint={glassConfig.blurTint}
        style={[
          styles.base,
          {
            borderWidth: glassConfig.borderWidth,
            borderColor: glassConfig.borderColor,
            borderRadius: 'borderRadius' in glassConfig ? glassConfig.borderRadius : 0,
          },
          style,
        ]}
      >
        <View style={[styles.overlay, { backgroundColor: glassConfig.backgroundColor }]}>
          {children}
        </View>
      </BlurView>
    );
  }

  // Fallback for Android - use solid background
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: glassConfig.backgroundColor,
          borderWidth: glassConfig.borderWidth,
          borderColor: glassConfig.borderColor,
          borderRadius: 'borderRadius' in glassConfig ? glassConfig.borderRadius : 0,
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
