import React, { useRef } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { shadows } from '@theme/shadows';
import { animations } from '@theme/animations';
import { colors } from '@theme/colors';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: animations.press.scale,
      duration: animations.press.duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: animations.press.duration,
      useNativeDriver: true,
    }).start();
  };

  const getLevelStyles = () => {
    switch (level) {
      case 'base':
        return { borderRadius: 10 };
      case 'elevated':
        return { borderRadius: 14, ...shadows.md };
      case 'modal':
        return { borderRadius: 16, ...shadows.lg };
      case 'card':
      default:
        return { borderRadius: 12, ...shadows.sm };
    }
  };

  const levelStyles = getLevelStyles();

  const cardStyle = [
    styles.card,
    levelStyles,
    glow && shadows.glowSubtle,
    style,
  ];

  const innerContent = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={[cardStyle, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[styles.pressable, disabled && styles.disabled]}
        >
          {innerContent}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{innerContent}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassCard;
