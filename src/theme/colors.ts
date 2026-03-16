export const colors = {
  // Background colors (Light theme - Apple style)
  background: '#FFFFFF',
  backgroundAlt: '#F2F2F7',      // System gray 6
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  surfaceGrouped: '#F2F2F7',
  surfaceElevated: '#FFFFFF',

  // For solid fallbacks
  surfaceSolid: '#FFFFFF',
  surfaceVariant: '#F2F2F7',
  surfaceVariantSolid: '#F2F2F7',
  surfaceElevatedSolid: '#FFFFFF',

  // Primary accent - iOS Blue
  primary: '#007AFF',
  primaryDark: '#0056B3',
  primaryLight: '#5AC8FA',
  primaryDim: 'rgba(0,122,255,0.10)',
  primaryGlow: 'rgba(0,122,255,0.15)',
  primaryBorder: 'rgba(0,122,255,0.20)',

  // Secondary colors (Teal)
  secondary: '#5AC8FA',
  secondaryDark: '#34AADC',
  secondaryLight: '#70D7FF',
  secondaryDim: 'rgba(90,200,250,0.10)',

  // System colors (iOS style)
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemGreen: '#34C759',
  systemBlue: '#007AFF',
  systemIndigo: '#5856D6',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D55',
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  // Status colors
  success: '#34C759',
  successDim: 'rgba(52,199,89,0.12)',
  successBorder: 'rgba(52,199,89,0.25)',

  warning: '#FF9500',
  warningDim: 'rgba(255,149,0,0.12)',
  warningBorder: 'rgba(255,149,0,0.25)',

  error: '#FF3B30',
  errorDim: 'rgba(255,59,48,0.12)',
  errorBorder: 'rgba(255,59,48,0.25)',

  info: '#5AC8FA',
  infoDim: 'rgba(90,200,250,0.12)',

  // Text colors (Light theme)
  textPrimary: '#000000',
  textSecondary: 'rgba(60,60,67,0.6)',    // 60% opacity
  textTertiary: 'rgba(60,60,67,0.3)',     // 30% opacity
  textDisabled: '#C7C7CC',
  textPlaceholder: '#C7C7CC',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Border and separator colors
  border: 'rgba(60,60,67,0.12)',
  borderLight: 'rgba(60,60,67,0.08)',
  borderMedium: 'rgba(60,60,67,0.18)',
  separator: '#C6C6C8',
  separatorOpaque: '#E5E5EA',

  // Order status colors
  statusPending: '#FF9500',
  statusPendingDim: 'rgba(255,149,0,0.12)',
  statusInProgress: '#007AFF',
  statusInProgressDim: 'rgba(0,122,255,0.12)',
  statusCompleted: '#34C759',
  statusCompletedDim: 'rgba(52,199,89,0.12)',
  statusCancelled: '#8E8E93',

  // Appointment status colors
  appointmentScheduled: '#007AFF',
  appointmentConfirmed: '#5856D6',
  appointmentCompleted: '#34C759',
  appointmentCancelled: '#8E8E93',

  // Expense categories
  expenseRent: '#FF3B30',
  expenseUtilities: '#AF52DE',
  expenseSupplies: '#5856D6',
  expenseOther: '#8E8E93',

  // Gradient colors (subtle for light theme)
  gradientStart: '#007AFF',
  gradientEnd: '#5856D6',
} as const;

export type ColorKey = keyof typeof colors;
