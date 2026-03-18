import React, { useState } from 'react';
import {
  StyleSheet,
  TextStyle,
  StyleProp,
  View,
  TextInput as RNTextInput,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Icon } from 'react-native-paper';
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
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

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
  leftIcon,
  rightIcon,
  onRightIconPress,
  onBlur,
  onFocus,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderProgress = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.error
      : borderProgress.value > 0
      ? colors.primary
      : colors.separatorOpaque,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderProgress.value = withTiming(1, { duration: 200 });
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderProgress.value = withTiming(0, { duration: 200 });
    onBlur?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <AnimatedView
        style={[
          styles.inputContainer,
          animatedBorderStyle,
          error && styles.inputError,
          isFocused && styles.inputFocused,
        ]}
      >
        {leftIcon && (
          <View style={styles.iconLeft}>
            <Icon source={leftIcon} size={20} color={colors.systemGray} />
          </View>
        )}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            multiline && styles.multiline,
            style,
          ]}
          onBlur={handleBlur}
          onFocus={handleFocus}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          keyboardAppearance="dark"
        />
        {rightIcon && (
          <TouchableOpacity style={styles.iconRight} onPress={onRightIconPress}>
            <Icon source={rightIcon} size={20} color={colors.systemGray} />
          </TouchableOpacity>
        )}
      </AnimatedView>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputFocused: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconLeft: {
    paddingLeft: 12,
  },
  iconRight: {
    paddingRight: 12,
    padding: 8,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
