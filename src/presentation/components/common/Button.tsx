import React, { useRef } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Pressable, Animated, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { animations } from '@theme/animations';
import { borderRadius } from '@theme/index';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
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

  const isDisabled = disabled || loading;
  const buttonColor = getButtonColor();

  if (mode === 'contained') {
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
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
            styles.contained,
            { backgroundColor: buttonColor },
            shadows.sm,
            isDisabled && styles.disabled,
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <Text style={[styles.label, styles.labelContained, labelStyle]}>
              {children}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  if (mode === 'outlined') {
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
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
