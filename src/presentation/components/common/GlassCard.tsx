import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { shadows } from '@theme/shadows';
import { colors } from '@theme/colors';
import { glass } from '@theme/glass';
import { useAnimatedPress } from '@presentation/hooks/useAnimatedPress';
import { GlassView } from './GlassView';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  level?: 'base' | 'card' | 'elevated' | 'modal';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
  blurEnabled?: boolean;
  glow?: boolean;
}

export function GlassCard({
  children,
  onPress,
  level = 'card',
  style,
  contentStyle,
  disabled = false,
  glow = false,
}: GlassCardProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress(0.97);

  const config = glass[level];
  const borderRadiusValue = 'borderRadius' in config ? config.borderRadius : 10;

  const innerContent = (
    <View style={[styles.content, contentStyle]}>
      {/* Subtle top highlight */}
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'transparent']}
        style={[styles.topHighlight, { borderTopLeftRadius: borderRadiusValue, borderTopRightRadius: borderRadiusValue }]}
      />
      {children}
    </View>
  );

  const glassLevel = level === 'modal' ? 'modal' : level === 'elevated' ? 'elevated' : level === 'base' ? 'base' : 'card';

  if (onPress) {
    return (
      <Animated.View style={[animatedStyle, glow && shadows.glowSubtle, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={disabled ? styles.disabled : undefined}
        >
          <GlassView level={glassLevel}>
            {innerContent}
          </GlassView>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[glow && shadows.glowSubtle, style]}>
      <GlassView level={glassLevel}>
        {innerContent}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    position: 'relative',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassCard;
