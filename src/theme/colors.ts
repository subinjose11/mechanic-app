export const colors = {
  // Background colors (Dark Premium)
  background: '#06060A',
  backgroundAlt: '#0C0C14',
  surface: '#12121C',
  surfaceSecondary: '#1A1A28',
  surfaceGrouped: '#0C0C14',
  surfaceElevated: '#1E1E2E',

  // For solid fallbacks
  surfaceSolid: '#12121C',
  surfaceVariant: '#1A1A28',
  surfaceVariantSolid: '#1A1A28',
  surfaceElevatedSolid: '#1E1E2E',

  // Primary accent - Indigo
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDim: 'rgba(99,102,241,0.12)',
  primaryGlow: 'rgba(99,102,241,0.20)',
  primaryBorder: 'rgba(99,102,241,0.25)',

  // Secondary colors (Cyan)
  secondary: '#22D3EE',
  secondaryDark: '#06B6D4',
  secondaryLight: '#67E8F9',
  secondaryDim: 'rgba(34,211,238,0.12)',

  // System colors (Dark Premium)
  systemRed: '#EF4444',
  systemOrange: '#F59E0B',
  systemYellow: '#FBBF24',
  systemGreen: '#22C55E',
  systemBlue: '#38BDF8',
  systemIndigo: '#6366F1',
  systemPurple: '#A855F7',
  systemPink: '#EC4899',
  systemGray: '#64748B',
  systemGray2: '#475569',
  systemGray3: '#334155',
  systemGray4: '#1E293B',
  systemGray5: '#1A1A28',
  systemGray6: '#12121C',

  // Status colors
  success: '#22C55E',
  successDim: 'rgba(34,197,94,0.15)',
  successBorder: 'rgba(34,197,94,0.30)',

  warning: '#F59E0B',
  warningDim: 'rgba(245,158,11,0.15)',
  warningBorder: 'rgba(245,158,11,0.30)',

  error: '#EF4444',
  errorDim: 'rgba(239,68,68,0.15)',
  errorBorder: 'rgba(239,68,68,0.30)',

  info: '#38BDF8',
  infoDim: 'rgba(56,189,248,0.12)',

  // Accent - Violet
  accent: '#A855F7',
  accentDim: 'rgba(168,85,247,0.12)',
  accentBorder: 'rgba(168,85,247,0.25)',

  // Text colors (Dark theme)
  textPrimary: '#F1F5F9',
  textSecondary: 'rgba(148,163,184,0.80)',   // slate-400 @ 80%
  textTertiary: 'rgba(100,116,139,0.60)',     // slate-500 @ 60%
  textDisabled: '#334155',
  textPlaceholder: '#475569',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#06060A',

  // Border and separator colors
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.04)',
  borderMedium: 'rgba(255,255,255,0.10)',
  separator: 'rgba(148,163,184,0.08)',
  separatorOpaque: 'rgba(255,255,255,0.08)',

  // Order status colors
  statusPending: '#F59E0B',
  statusPendingDim: 'rgba(245,158,11,0.15)',
  statusInProgress: '#6366F1',
  statusInProgressDim: 'rgba(99,102,241,0.15)',
  statusCompleted: '#22C55E',
  statusCompletedDim: 'rgba(34,197,94,0.15)',
  statusCancelled: '#64748B',

  // Appointment status colors
  appointmentScheduled: '#6366F1',
  appointmentConfirmed: '#A855F7',
  appointmentCompleted: '#22C55E',
  appointmentCancelled: '#64748B',

  // Expense categories
  expenseRent: '#EF4444',
  expenseUtilities: '#A855F7',
  expenseSupplies: '#6366F1',
  expenseOther: '#64748B',

  // Gradient colors
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',

  // Additional gradients
  gradients: {
    primary: ['#6366F1', '#8B5CF6'] as const,
    cyan: ['#06B6D4', '#22D3EE'] as const,
    violet: ['#7C3AED', '#A855F7'] as const,
    success: ['#16A34A', '#22C55E'] as const,
    warm: ['#F59E0B', '#FBBF24'] as const,
  },
} as const;

export type ColorKey = keyof typeof colors;
