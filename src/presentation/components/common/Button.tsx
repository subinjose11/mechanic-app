import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button as PaperButton, ActivityIndicator } from 'react-native-paper';
import { colors } from '@theme/colors';

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

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      buttonColor={mode === 'contained' ? getButtonColor() : undefined}
      textColor={mode === 'contained' ? colors.textOnPrimary : getButtonColor()}
      style={[styles.button, fullWidth && styles.fullWidth, style]}
      labelStyle={[styles.label, labelStyle]}
      contentStyle={styles.content}
    >
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    paddingVertical: 4,
  },
});

export default Button;
