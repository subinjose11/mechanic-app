// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Appointment status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Payment types
export const PAYMENT_TYPE = {
  ADVANCE: 'advance',
  FINAL: 'final',
} as const;

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  advance: 'Advance',
  final: 'Final Payment',
};

// Payment methods
export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
};

// Photo types
export const PHOTO_TYPE = {
  BEFORE: 'before',
  AFTER: 'after',
  DAMAGE: 'damage',
} as const;

export type PhotoType = (typeof PHOTO_TYPE)[keyof typeof PHOTO_TYPE];

export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  before: 'Before',
  after: 'After',
  damage: 'Damage',
};

// Expense categories
export const EXPENSE_CATEGORY = {
  RENT: 'rent',
  UTILITIES: 'utilities',
  SUPPLIES: 'supplies',
  OTHER: 'other',
} as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: 'Rent',
  utilities: 'Utilities',
  supplies: 'Supplies',
  other: 'Other',
};

// Common vehicle makes
export const VEHICLE_MAKES = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Honda',
  'Toyota',
  'Kia',
  'Ford',
  'Renault',
  'Volkswagen',
  'Skoda',
  'MG',
  'Jeep',
  'Nissan',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Other',
];

// Common service types
export const SERVICE_TYPES = [
  'General Service',
  'Oil Change',
  'Brake Service',
  'Engine Repair',
  'Transmission Service',
  'AC Service',
  'Electrical Repair',
  'Body Work',
  'Painting',
  'Tire Service',
  'Wheel Alignment',
  'Battery Replacement',
  'Clutch Replacement',
  'Suspension Repair',
  'Other',
];

// Time slots for appointments
export const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
];

// Default appointment duration in minutes
export const DEFAULT_APPOINTMENT_DURATION = 60;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
