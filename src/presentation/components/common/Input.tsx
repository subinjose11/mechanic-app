import React, { useState } from 'react';
import { StyleSheet, TextStyle, StyleProp, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { colors } from '@theme/colors';
import { borderRadius } from '@theme/index';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  style?: StyleProp<TextStyle>;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  style,
  left,
  right,
  onBlur,
  onFocus,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={isFocused && styles.focusedContainer}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        error={!!error}
        disabled={disabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        style={[styles.input, multiline ? styles.multiline : null, style]}
        mode="outlined"
        outlineColor={colors.borderLight}
        activeOutlineColor={colors.primary}
        outlineStyle={styles.outline}
        textColor={colors.textPrimary}
        left={left}
        right={right}
        onBlur={handleBlur}
        onFocus={handleFocus}
        theme={{
          colors: {
            onSurfaceVariant: colors.textDisabled,
            error: colors.error,
          },
        }}
      />
      {error && (
        <HelperText type="error" visible={!!error} style={styles.error}>
          {error}
        </HelperText>
      )}
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    fontSize: 15,
  },
  outline: {
    borderRadius: borderRadius.md,
  },
  multiline: {
    minHeight: 100,
  },
  error: {
    color: colors.error,
  },
  focusedContainer: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 0,
  },
});
