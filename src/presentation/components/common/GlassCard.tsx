import React, { useRef } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { glass, GlassLevel } from '@theme/glass';
import { shadows } from '@theme/shadows';
import { animations } from '@theme/animations';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  level?: GlassLevel;
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
  blurEnabled = true,
  glow = false,
}: GlassCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glassConfig = glass[level];
  const shouldBlur = blurEnabled && Platform.OS === 'ios';

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

  const cardStyle = [
    styles.card,
    {
      borderRadius: 'borderRadius' in glassConfig ? glassConfig.borderRadius : 20,
    },
    glow && shadows.glowSubtle,
    style,
  ];

  const innerContent = (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const glassContent = shouldBlur ? (
    <BlurView
      intensity={glassConfig.blurIntensity}
      tint={glassConfig.blurTint}
      style={[
        styles.blur,
        {
          borderWidth: glassConfig.borderWidth,
          borderColor: glassConfig.borderColor,
          borderRadius: 'borderRadius' in glassConfig ? glassConfig.borderRadius : 20,
        },
      ]}
    >
      <View style={[styles.overlay, { backgroundColor: glassConfig.backgroundColor }]}>
        {innerContent}
      </View>
    </BlurView>
  ) : (
    <View
      style={[
        styles.fallback,
        {
          backgroundColor: glassConfig.backgroundColor,
          borderWidth: glassConfig.borderWidth,
          borderColor: glassConfig.borderColor,
          borderRadius: 'borderRadius' in glassConfig ? glassConfig.borderRadius : 20,
        },
      ]}
    >
      {innerContent}
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
          {glassContent}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{glassContent}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
  },
  blur: {
    overflow: 'hidden',
  },
  fallback: {
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassCard;
