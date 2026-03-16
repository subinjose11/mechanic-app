// Firebase configuration
// Auth & Firestore: @react-native-firebase (native SDK)
// Storage: firebase web SDK (for now)

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase app (web SDK - only needed for Storage)
let app: FirebaseApp;
let storage: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Storage (web SDK)
storage = getStorage(app);

export function getFirebaseApp(): FirebaseApp {
  return app;
}

export function getFirebaseStorage(): FirebaseStorage {
  return storage;
}

export function initializeFirebase() {
  return { app, storage };
}

export type { FirebaseApp, FirebaseStorage };
