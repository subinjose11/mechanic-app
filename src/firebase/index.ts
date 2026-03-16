// Firebase module exports
export {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseStorage,
} from './config';

export { COLLECTIONS, STORAGE_PATHS } from './firestore/collections';
export * from './firestore/collections';

export { firestoreService, FirestoreService } from './firestore/FirestoreService';
export type { FirestoreDocument, QueryOptions, FilterCondition } from './firestore/FirestoreService';

export { authService, AuthService } from './auth/AuthService';
export type { RegisterInput, LoginInput } from './auth/AuthService';

export { storageService, StorageService } from './storage/StorageService';
export type { UploadProgress } from './storage/StorageService';
