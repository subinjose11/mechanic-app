export const colors = {
  // Primary colors (Indigo from design)
  primary: '#818cf8',
  primaryDark: '#6366f1',
  primaryLight: '#a5b4fc',
  primaryDim: 'rgba(129,140,248,0.10)',
  primaryGlow: 'rgba(129,140,248,0.20)',
  primaryBorder: 'rgba(129,140,248,0.28)',

  // Secondary colors (Cyan)
  secondary: '#22d3ee',
  secondaryDark: '#06b6d4',
  secondaryLight: '#67e8f9',
  secondaryDim: 'rgba(34,211,238,0.1)',

  // Status colors
  success: '#10b981',
  successDim: 'rgba(16,185,129,0.12)',
  successBorder: 'rgba(16,185,129,0.3)',

  warning: '#f59e0b',
  warningDim: 'rgba(245,158,11,0.12)',
  warningBorder: 'rgba(245,158,11,0.3)',

  error: '#f43f5e',
  errorDim: 'rgba(244,63,94,0.12)',
  errorBorder: 'rgba(244,63,94,0.3)',

  info: '#22d3ee',
  infoDim: 'rgba(34,211,238,0.1)',

  // Background colors (Dark theme)
  background: '#0a0a0f',
  backgroundAlt: '#0d0d14',
  surface: 'rgba(255,255,255,0.03)',
  surfaceVariant: 'rgba(255,255,255,0.05)',
  surfaceElevated: 'rgba(255,255,255,0.07)',

  // For solid fallbacks (when blur not available)
  surfaceSolid: '#101016',
  surfaceVariantSolid: '#141420',
  surfaceElevatedSolid: '#1a1a28',

  // Text colors
  textPrimary: '#f4f4f9',
  textSecondary: '#a0a0b8',
  textDisabled: '#606078',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Border colors
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.10)',
  borderMedium: 'rgba(255,255,255,0.14)',

  // Order status colors
  statusPending: '#f59e0b',
  statusPendingDim: 'rgba(245,158,11,0.12)',
  statusInProgress: '#6366f1',
  statusInProgressDim: 'rgba(99,102,241,0.12)',
  statusCompleted: '#10b981',
  statusCompletedDim: 'rgba(16,185,129,0.12)',
  statusCancelled: '#55556a',

  // Appointment status colors
  appointmentScheduled: '#6366f1',
  appointmentConfirmed: '#22d3ee',
  appointmentCompleted: '#10b981',
  appointmentCancelled: '#55556a',

  // Expense categories
  expenseRent: '#f43f5e',
  expenseUtilities: '#a855f7',
  expenseSupplies: '#6366f1',
  expenseOther: '#55556a',

  // Gradient colors
  gradientStart: '#818cf8',
  gradientEnd: '#6366f1',
} as const;

export type ColorKey = keyof typeof colors;
