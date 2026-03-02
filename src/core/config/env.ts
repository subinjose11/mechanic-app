// Environment configuration
// Replace these with your actual Supabase credentials

export const env = {
  // Supabase configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',

  // App configuration
  APP_NAME: 'Mechanic Shop',
  APP_VERSION: '1.0.0',

  // Feature flags
  ENABLE_ANALYTICS: true,
  ENABLE_PHOTO_UPLOAD: true,
  ENABLE_BARCODE_SCANNING: true,

  // Storage bucket names
  PHOTO_BUCKET: 'service-photos',
  RECEIPT_BUCKET: 'expense-receipts',

  // Default values
  DEFAULT_LABOR_RATE: 50, // per hour
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_CURRENCY_SYMBOL: '₹',

  // Date formats
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
} as const;

export type EnvConfig = typeof env;
