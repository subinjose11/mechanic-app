// Environment configuration
// Replace these with your actual Firebase credentials

export const env = {
  // Firebase configuration
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',

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
