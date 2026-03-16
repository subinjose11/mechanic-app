import React, { useRef } from 'react';
import { StyleSheet, ViewStyle, Pressable, View, Animated } from 'react-native';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { animations } from '@theme/animations';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  elevated?: boolean;
  disabled?: boolean;
  blurEnabled?: boolean;
}

export function Card({
  children,
  onPress,
  style,
  contentStyle,
  elevated = false,
  disabled = false,
}: CardProps) {
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

  const cardRadius = elevated ? 14 : 12;
  const cardShadow = elevated ? shadows.md : shadows.sm;

  const innerContent = (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  if (onPress) {
    return (
      <Animated.View
        style={[
          styles.card,
          { borderRadius: cardRadius },
          cardShadow,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
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

  return (
    <View style={[styles.card, { borderRadius: cardRadius }, cardShadow, style]}>
      {innerContent}
    </View>
  );
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

export default Card;
