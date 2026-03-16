import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';

interface GlassViewProps {
  children: React.ReactNode;
  level?: 'base' | 'card' | 'elevated' | 'modal' | 'tabBar';
  style?: ViewStyle;
  blurEnabled?: boolean;
}

export function GlassView({
  children,
  level = 'card',
  style,
}: GlassViewProps) {
  const getLevelStyles = (): ViewStyle => {
    switch (level) {
      case 'base':
        return { backgroundColor: colors.surfaceSecondary };
      case 'elevated':
        return { backgroundColor: colors.surface, borderRadius: 14 };
      case 'modal':
        return { backgroundColor: colors.surface, borderRadius: 16 };
      case 'tabBar':
        return {
          backgroundColor: 'rgba(249,249,249,0.94)',
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
        };
      case 'card':
      default:
        return { backgroundColor: colors.surface, borderRadius: 12 };
    }
  };

  return (
    <View style={[styles.base, getLevelStyles(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export default GlassView;
