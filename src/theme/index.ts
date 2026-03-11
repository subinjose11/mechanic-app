import { MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { shadows } from './shadows';
import { animations } from './animations';
import { glass, glassStyles } from './glass';

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
    surface: colors.surfaceSolid,
    surfaceVariant: colors.surfaceVariantSolid,
    surfaceDisabled: colors.surfaceElevatedSolid,
    error: colors.error,
    errorContainer: colors.errorDim,
    onPrimary: colors.textOnPrimary,
    onSecondary: colors.textOnSecondary,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onSurfaceDisabled: colors.textDisabled,
    outline: colors.borderMedium,
    outlineVariant: colors.borderLight,
    elevation: {
      level0: 'transparent',
      level1: colors.surfaceSolid,
      level2: colors.surfaceVariantSolid,
      level3: colors.surfaceElevatedSolid,
      level4: colors.surfaceElevatedSolid,
      level5: colors.surfaceElevatedSolid,
    },
  },
  roundness: 14,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 18,
  lg: 28,
  xl: 36,
  xxl: 52,
} as const;

export const borderRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  round: 9999,
} as const;

export { colors, typography, shadows, animations, glass, glassStyles };
export type AppTheme = typeof theme;
