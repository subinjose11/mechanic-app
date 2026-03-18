import { ViewStyle } from 'react-native';

// Dark premium glassmorphism
export const glass = {
  // Base level - subtle for backgrounds
  base: {
    backgroundColor: 'rgba(12,12,20,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    blurIntensity: 20,
    blurTint: 'dark' as const,
  },

  // Card level - standard cards with glass effect
  card: {
    backgroundColor: 'rgba(18,18,28,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    blurIntensity: 40,
    blurTint: 'dark' as const,
  },

  // Elevated level - floating elements
  elevated: {
    backgroundColor: 'rgba(30,30,46,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    blurIntensity: 60,
    blurTint: 'dark' as const,
  },

  // Modal level - modals and sheets
  modal: {
    backgroundColor: 'rgba(30,30,46,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    blurIntensity: 80,
    blurTint: 'dark' as const,
  },

  // Tab bar level - navigation tab bar
  tabBar: {
    backgroundColor: 'rgba(6,6,10,0.85)',
    borderWidth: 0.5,
    borderColor: 'rgba(148,163,184,0.08)',
    blurIntensity: 60,
    blurTint: 'dark' as const,
  },
} as const;

// Style objects for use in StyleSheet
export const glassStyles = {
  base: {
    backgroundColor: glass.base.backgroundColor,
    borderWidth: glass.base.borderWidth,
    borderColor: glass.base.borderColor,
  } as ViewStyle,

  card: {
    backgroundColor: glass.card.backgroundColor,
    borderRadius: glass.card.borderRadius,
    borderWidth: glass.card.borderWidth,
    borderColor: glass.card.borderColor,
  } as ViewStyle,

  elevated: {
    backgroundColor: glass.elevated.backgroundColor,
    borderRadius: glass.elevated.borderRadius,
    borderWidth: glass.elevated.borderWidth,
    borderColor: glass.elevated.borderColor,
  } as ViewStyle,

  modal: {
    backgroundColor: glass.modal.backgroundColor,
    borderRadius: glass.modal.borderRadius,
    borderWidth: glass.modal.borderWidth,
    borderColor: glass.modal.borderColor,
  } as ViewStyle,

  tabBar: {
    backgroundColor: glass.tabBar.backgroundColor,
    borderTopWidth: glass.tabBar.borderWidth,
    borderTopColor: glass.tabBar.borderColor,
  } as ViewStyle,
} as const;

// Card styles with dark surfaces
export const cardStyles = {
  card: {
    backgroundColor: '#12121C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  } as ViewStyle,

  cardElevated: {
    backgroundColor: '#1E1E2E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  } as ViewStyle,

  groupedCard: {
    backgroundColor: '#12121C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  } as ViewStyle,

  insetGrouped: {
    backgroundColor: '#12121C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 16,
  } as ViewStyle,
};

export type GlassLevel = keyof typeof glass;
