import { AppError, AuthError, NetworkError, ValidationError } from './AppError';

export interface ErrorResult {
  message: string;
  code: string;
  field?: string;
}

export function handleError(error: unknown): ErrorResult {
  // Handle known app errors
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      field: error instanceof ValidationError ? error.field : undefined,
    };
  }

  // Handle Firebase errors
  if (isFirebaseError(error)) {
    return handleFirebaseError(error);
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('Network')) {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Default error
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

interface FirebaseError {
  code: string;
  message: string;
}

function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as FirebaseError).code === 'string'
  );
}

function handleFirebaseError(error: FirebaseError): ErrorResult {
  // Common Firebase Auth error codes
  switch (error.code) {
    // Auth errors
    case 'auth/email-already-in-use':
      return {
        message: 'This email is already registered.',
        code: 'DUPLICATE_EMAIL',
      };
    case 'auth/invalid-email':
      return {
        message: 'Please enter a valid email address.',
        code: 'INVALID_EMAIL',
      };
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
      };
    case 'auth/weak-password':
      return {
        message: 'Password is too weak. Use at least 6 characters.',
        code: 'WEAK_PASSWORD',
      };
    case 'auth/too-many-requests':
      return {
        message: 'Too many attempts. Please try again later.',
        code: 'RATE_LIMITED',
      };
    case 'auth/network-request-failed':
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    // Firestore errors
    case 'permission-denied':
      return {
        message: 'You do not have permission to perform this action.',
        code: 'PERMISSION_ERROR',
      };
    case 'not-found':
      return {
        message: 'Record not found.',
        code: 'NOT_FOUND',
      };
    case 'already-exists':
      return {
        message: 'This record already exists.',
        code: 'DUPLICATE_ERROR',
      };
    case 'unavailable':
      return {
        message: 'Service temporarily unavailable. Please try again.',
        code: 'SERVICE_UNAVAILABLE',
      };
    default:
      return {
        message: error.message || 'An error occurred.',
        code: error.code || 'FIREBASE_ERROR',
      };
  }
}

export function getErrorMessage(error: unknown): string {
  return handleError(error).message;
}
