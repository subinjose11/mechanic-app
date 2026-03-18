import React from 'react';
import { StyleSheet, ViewStyle, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { useAnimatedPress } from '@presentation/hooks/useAnimatedPress';

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
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress(0.97);

  const cardRadius = elevated ? 18 : 14;
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
          animatedStyle,
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
    borderWidth: 1,
    borderColor: colors.border,
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
