export const colors = {
  // Primary colors
  primary: '#1976D2',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',

  // Secondary colors
  secondary: '#FF6F00',
  secondaryDark: '#E65100',
  secondaryLight: '#FFA726',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Neutral colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceVariant: '#E3E3E3',

  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  // Order status colors
  statusPending: '#FFC107',
  statusInProgress: '#2196F3',
  statusCompleted: '#4CAF50',
  statusCancelled: '#9E9E9E',

  // Appointment status colors
  appointmentScheduled: '#9C27B0',
  appointmentConfirmed: '#2196F3',
  appointmentCompleted: '#4CAF50',
  appointmentCancelled: '#9E9E9E',

  // Expense categories
  expenseRent: '#E91E63',
  expenseUtilities: '#9C27B0',
  expenseSupplies: '#3F51B5',
  expenseOther: '#607D8B',
} as const;

export type ColorKey = keyof typeof colors;
