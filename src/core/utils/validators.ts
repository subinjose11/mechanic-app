// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleanPhone);
}

// License plate validation (Indian format)
export function isValidLicensePlate(plate: string): boolean {
  // Indian license plate format: XX 00 XX 0000 or XX00XX0000
  const plateRegex = /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{4}$/i;
  return plateRegex.test(plate.trim());
}

// VIN validation (17 characters, no I, O, Q)
export function isValidVIN(vin: string): boolean {
  if (!vin) return true; // VIN is optional
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin.trim());
}

// Required field validation
export function isRequired(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

// Minimum length validation
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

// Maximum length validation
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

// Positive number validation
export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && value > 0;
}

// Non-negative number validation
export function isNonNegativeNumber(value: number): boolean {
  return !isNaN(value) && value >= 0;
}

// Year validation (reasonable range)
export function isValidYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
}

// Password strength validation
export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  return { valid: true, message: '' };
}

// Form validation helper
export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
}
