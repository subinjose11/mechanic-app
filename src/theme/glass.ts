import { ViewStyle } from 'react-native';

// Apple-style card styles (replacing glass effects)
export const glass = {
  // Base level - subtle for backgrounds
  base: {
    backgroundColor: '#F2F2F7',
    borderWidth: 0,
    borderColor: 'transparent',
    blurIntensity: 0,
    blurTint: 'light' as const,
  },

  // Card level - standard cards with subtle shadow
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 12,
    blurIntensity: 0,
    blurTint: 'light' as const,
  },

  // Elevated level - floating elements
  elevated: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 14,
    blurIntensity: 0,
    blurTint: 'light' as const,
  },

  // Modal level - modals and sheets
  modal: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 16,
    blurIntensity: 0,
    blurTint: 'light' as const,
  },

  // Tab bar level - navigation tab bar
  tabBar: {
    backgroundColor: 'rgba(249,249,249,0.94)',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    blurIntensity: 25,
    blurTint: 'light' as const,
  },
} as const;

// Style objects for use in StyleSheet
export const glassStyles = {
  base: {
    backgroundColor: glass.base.backgroundColor,
  } as ViewStyle,

  card: {
    backgroundColor: glass.card.backgroundColor,
    borderRadius: glass.card.borderRadius,
  } as ViewStyle,

  elevated: {
    backgroundColor: glass.elevated.backgroundColor,
    borderRadius: glass.elevated.borderRadius,
  } as ViewStyle,

  modal: {
    backgroundColor: glass.modal.backgroundColor,
    borderRadius: glass.modal.borderRadius,
  } as ViewStyle,

  tabBar: {
    backgroundColor: glass.tabBar.backgroundColor,
    borderTopWidth: glass.tabBar.borderWidth,
    borderTopColor: glass.tabBar.borderColor,
  } as ViewStyle,
} as const;

// Card styles with shadows (Apple-style)
export const cardStyles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  } as ViewStyle,

  cardElevated: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  groupedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  } as ViewStyle,

  insetGrouped: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 16,
  } as ViewStyle,
};

export type GlassLevel = keyof typeof glass;
