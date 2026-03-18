import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { borderRadius } from '@theme/index';
import { useAnimatedPress } from '@presentation/hooks/useAnimatedPress';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  fullWidth?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'success';
}

export function Button({
  children,
  onPress,
  mode = 'contained',
  loading = false,
  disabled = false,
  style,
  labelStyle,
  fullWidth = false,
  color = 'primary',
}: ButtonProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress(0.97);

  const getGradientColors = (): readonly [string, string] => {
    switch (color) {
      case 'secondary':
        return ['#06B6D4', '#22D3EE'] as const;
      case 'error':
        return ['#DC2626', '#EF4444'] as const;
      case 'success':
        return ['#16A34A', '#22C55E'] as const;
      default:
        return ['#6366F1', '#8B5CF6'] as const;
    }
  };

  const getButtonColor = () => {
    switch (color) {
      case 'secondary':
        return colors.secondary;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const getGlowShadow = () => {
    switch (color) {
      case 'secondary':
        return shadows.glowCyan;
      case 'error':
        return shadows.glowError;
      case 'success':
        return shadows.glowSuccess;
      default:
        return shadows.glow;
    }
  };

  const isDisabled = disabled || loading;
  const buttonColor = getButtonColor();

  if (mode === 'contained') {
    return (
      <Animated.View
        style={[
          animatedStyle,
          fullWidth && styles.fullWidth,
          !isDisabled && getGlowShadow(),
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          style={[isDisabled && styles.disabled]}
        >
          <LinearGradient
            colors={getGradientColors() as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.buttonBase, styles.contained, style]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            ) : (
              <Text style={[styles.label, styles.labelContained, labelStyle]}>
                {children}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  if (mode === 'outlined') {
    return (
      <Animated.View
        style={[
          animatedStyle,
          fullWidth && styles.fullWidth,
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          style={[
            styles.buttonBase,
            styles.outlined,
            { borderColor: buttonColor },
            isDisabled && styles.disabled,
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={buttonColor} />
          ) : (
            <Text style={[styles.label, { color: buttonColor }, labelStyle]}>
              {children}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // text mode
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.textButton,
        fullWidth && styles.fullWidth,
        pressed && styles.pressedText,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={buttonColor} />
      ) : (
        <Text style={[styles.label, { color: buttonColor }, labelStyle]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  contained: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  textButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  labelContained: {
    color: colors.textOnPrimary,
  },
  pressedText: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default Button;
