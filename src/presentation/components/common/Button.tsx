import React, { useRef } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Pressable, Animated } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
  icon,
  style,
  labelStyle,
  fullWidth = false,
  color = 'primary',
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
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

  const getButtonColors = () => {
    switch (color) {
      case 'secondary':
        return [colors.secondary, colors.secondaryDark];
      case 'error':
        return [colors.error, '#dc2626'];
      case 'success':
        return [colors.success, '#059669'];
      default:
        return [colors.gradientStart, colors.gradientEnd];
    }
  };

  const getSolidColor = () => {
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
            shadows.glow,
            isDisabled && styles.disabled,
            style,
          ]}
        >
          <LinearGradient
            colors={getButtonColors() as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
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
            { borderColor: getSolidColor() },
            isDisabled && styles.disabled,
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={getSolidColor()} />
          ) : (
            <Text style={[styles.label, { color: getSolidColor() }, labelStyle]}>
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
        <ActivityIndicator size="small" color={getSolidColor()} />
      ) : (
        <Text style={[styles.label, { color: getSolidColor() }, labelStyle]}>
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
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  outlined: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  textButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelContained: {
    color: colors.textOnPrimary,
  },
  pressedText: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.35,
  },
});

export default Button;
