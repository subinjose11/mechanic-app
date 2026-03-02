import React from 'react';
import { StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { colors } from '@theme/colors';
import { shadows } from '@theme/index';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  elevated?: boolean;
  disabled?: boolean;
}

export function Card({
  children,
  onPress,
  style,
  contentStyle,
  elevated = true,
  disabled = false,
}: CardProps) {
  const CardWrapper = onPress ? Pressable : React.Fragment;
  const wrapperProps = onPress
    ? {
        onPress,
        disabled,
        style: ({ pressed }: { pressed: boolean }) => [
          styles.card,
          elevated && shadows.sm,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ],
      }
    : {};

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.card,
          elevated && shadows.sm,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
      >
        <PaperCard.Content style={[styles.content, contentStyle]}>{children}</PaperCard.Content>
      </Pressable>
    );
  }

  return (
    <PaperCard style={[styles.card, elevated && shadows.sm, style]}>
      <PaperCard.Content style={[styles.content, contentStyle]}>{children}</PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Card;
