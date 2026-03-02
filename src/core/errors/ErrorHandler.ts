import { AppError, AuthError, NetworkError, ValidationError } from './AppError';
import { PostgrestError } from '@supabase/supabase-js';

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

  // Handle Supabase PostgrestError
  if (isPostgrestError(error)) {
    return handleSupabaseError(error);
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

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

function handleSupabaseError(error: PostgrestError): ErrorResult {
  // Common Supabase error codes
  switch (error.code) {
    case '23505': // unique_violation
      return {
        message: 'This record already exists.',
        code: 'DUPLICATE_ERROR',
      };
    case '23503': // foreign_key_violation
      return {
        message: 'Related record not found.',
        code: 'REFERENCE_ERROR',
      };
    case '42501': // insufficient_privilege
      return {
        message: 'You do not have permission to perform this action.',
        code: 'PERMISSION_ERROR',
      };
    case 'PGRST116': // Row not found
      return {
        message: 'Record not found.',
        code: 'NOT_FOUND',
      };
    default:
      return {
        message: error.message || 'Database error occurred.',
        code: error.code || 'DATABASE_ERROR',
      };
  }
}

export function getErrorMessage(error: unknown): string {
  return handleError(error).message;
}
