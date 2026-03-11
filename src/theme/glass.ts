import { ViewStyle } from 'react-native';

// Glass hierarchy levels
export const glass = {
  // Base level - subtle glass for backgrounds
  base: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    blurIntensity: 20,
    blurTint: 'dark' as const,
  },

  // Card level - standard cards
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    blurIntensity: 30,
    blurTint: 'dark' as const,
  },

  // Elevated level - floating elements
  elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 22,
    blurIntensity: 40,
    blurTint: 'dark' as const,
  },

  // Modal level - modals and sheets
  modal: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 26,
    blurIntensity: 60,
    blurTint: 'dark' as const,
  },

  // Tab bar level - navigation tab bar
  tabBar: {
    backgroundColor: 'rgba(8, 8, 12, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    blurIntensity: 50,
    blurTint: 'dark' as const,
  },
} as const;

// Style objects without blur (for use in StyleSheet)
export const glassStyles = {
  base: {
    backgroundColor: glass.base.backgroundColor,
    borderWidth: glass.base.borderWidth,
    borderColor: glass.base.borderColor,
  } as ViewStyle,

  card: {
    backgroundColor: glass.card.backgroundColor,
    borderWidth: glass.card.borderWidth,
    borderColor: glass.card.borderColor,
    borderRadius: glass.card.borderRadius,
  } as ViewStyle,

  elevated: {
    backgroundColor: glass.elevated.backgroundColor,
    borderWidth: glass.elevated.borderWidth,
    borderColor: glass.elevated.borderColor,
    borderRadius: glass.elevated.borderRadius,
  } as ViewStyle,

  modal: {
    backgroundColor: glass.modal.backgroundColor,
    borderWidth: glass.modal.borderWidth,
    borderColor: glass.modal.borderColor,
    borderRadius: glass.modal.borderRadius,
  } as ViewStyle,

  tabBar: {
    backgroundColor: glass.tabBar.backgroundColor,
    borderWidth: glass.tabBar.borderWidth,
    borderColor: glass.tabBar.borderColor,
  } as ViewStyle,
} as const;

export type GlassLevel = keyof typeof glass;
