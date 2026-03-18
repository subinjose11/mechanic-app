import { MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { shadows } from './shadows';
import { animations, springPresets, enteringPresets, exitingPresets, listItemEntering } from './animations';
import { glass, glassStyles, cardStyles } from './glass';

export const theme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryDim,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryDim,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    surfaceDisabled: colors.systemGray5,
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
      level2: colors.surfaceSecondary,
      level3: colors.surfaceElevated,
      level4: colors.surfaceElevated,
      level5: colors.surfaceElevated,
    },
  },
  roundness: 14,
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
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  round: 9999,
} as const;

export { colors, typography, shadows, animations, springPresets, enteringPresets, exitingPresets, listItemEntering, glass, glassStyles, cardStyles };
export type AppTheme = typeof theme;
