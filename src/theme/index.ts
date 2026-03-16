import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { shadows } from './shadows';
import { animations } from './animations';
import { glass, glassStyles, cardStyles } from './glass';

export const theme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryDim,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryDim,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    surfaceDisabled: colors.systemGray6,
    error: colors.error,
    errorContainer: colors.errorDim,
    onPrimary: colors.textOnPrimary,
    onSecondary: colors.textOnSecondary,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onSurfaceDisabled: colors.textDisabled,
    outline: colors.border,
    outlineVariant: colors.borderLight,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  roundness: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
} as const;

export { colors, typography, shadows, animations, glass, glassStyles, cardStyles };
export type AppTheme = typeof theme;
