import { ViewStyle } from 'react-native';

// Dark premium glow-based shadows
export const shadows = {
  // Extra small - very subtle
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  // Small - for cards
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  // Medium - for elevated cards
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  // Large - for modals and floating elements
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  // Extra large - for prominent floating elements
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,

  // Primary glow - indigo neon glow for buttons
  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,

  // Subtle glow
  glowSubtle: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  } as ViewStyle,

  // Cyan glow
  glowCyan: {
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  } as ViewStyle,

  // Success glow
  glowSuccess: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,

  // Error glow
  glowError: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,

  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
} as const;

export type ShadowKey = keyof typeof shadows;
