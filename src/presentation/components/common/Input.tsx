import React from 'react';
import { StyleSheet, TextStyle, StyleProp } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { colors } from '@theme/colors';

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
  return (
    <>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
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
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        left={left}
        right={right}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </>
  );
}

export default Input;

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 100,
  },
});
