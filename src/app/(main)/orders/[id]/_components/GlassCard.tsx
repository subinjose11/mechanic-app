import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type GlowPosition = 'top-left' | 'top-right' | 'bottom-right' | 'center-top';

interface GlassCardProps {
  children: React.ReactNode;
  glowColor?: string;
  glowPosition?: GlowPosition;
  style?: ViewStyle;
}

const glowPositionStyles: Record<GlowPosition, ViewStyle> = {
  'top-left': { top: -20, left: -20 },
  'top-right': { top: -20, right: -20 },
  'bottom-right': { bottom: -20, right: -20 },
  'center-top': { top: -30, left: '40%' as any },
};

export function GlassCard({ children, glowColor, glowPosition, style }: GlassCardProps) {
  return (
    <View style={[styles.card, style]}>
      {glowColor && glowPosition && (
        <View
          style={[
            styles.glow,
            glowPositionStyles[glowPosition],
            { backgroundColor: glowColor },
          ]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.6,
  },
});
