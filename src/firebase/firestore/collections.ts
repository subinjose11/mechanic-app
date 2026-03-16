// Firestore collection path constants
// All collections use userId for multi-tenant isolation

export const COLLECTIONS = {
  // Root collections
  USERS: 'users',
  CUSTOMERS: 'customers',
  VEHICLES: 'vehicles',
  ORDERS: 'orders',
  APPOINTMENTS: 'appointments',
  EXPENSES: 'expenses',

  // Subcollections (nested under orders)
  LABOR_ITEMS: 'laborItems',
  SPARE_PARTS: 'spareParts',
  PAYMENTS: 'payments',
  PHOTOS: 'photos',
} as const;

// Type for collection names
export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// Helper functions to build collection paths
export function getUserPath(userId: string): string {
  return `${COLLECTIONS.USERS}/${userId}`;
}

export function getCustomersPath(): string {
  return COLLECTIONS.CUSTOMERS;
}

export function getCustomerPath(customerId: string): string {
  return `${COLLECTIONS.CUSTOMERS}/${customerId}`;
}

export function getVehiclesPath(): string {
  return COLLECTIONS.VEHICLES;
}

export function getVehiclePath(vehicleId: string): string {
  return `${COLLECTIONS.VEHICLES}/${vehicleId}`;
}

export function getOrdersPath(): string {
  return COLLECTIONS.ORDERS;
}

export function getOrderPath(orderId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}`;
}

export function getAppointmentsPath(): string {
  return COLLECTIONS.APPOINTMENTS;
}

export function getAppointmentPath(appointmentId: string): string {
  return `${COLLECTIONS.APPOINTMENTS}/${appointmentId}`;
}

export function getExpensesPath(): string {
  return COLLECTIONS.EXPENSES;
}

export function getExpensePath(expenseId: string): string {
  return `${COLLECTIONS.EXPENSES}/${expenseId}`;
}

// Subcollection paths (nested under orders)
export function getLaborItemsPath(orderId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}/${COLLECTIONS.LABOR_ITEMS}`;
}

export function getLaborItemPath(orderId: string, itemId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}/${COLLECTIONS.LABOR_ITEMS}/${itemId}`;
}

export function getSparePartsPath(orderId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}/${COLLECTIONS.SPARE_PARTS}`;
}

export function getSparePartPath(orderId: string, partId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}/${COLLECTIONS.SPARE_PARTS}/${partId}`;
}

export function getPaymentsPath(orderId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}/${COLLECTIONS.PAYMENTS}`;
}

export function getPaymentPath(orderId: string, paymentId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}/${COLLECTIONS.PAYMENTS}/${paymentId}`;
}

export function getPhotosPath(orderId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}/${COLLECTIONS.PHOTOS}`;
}

export function getPhotoPath(orderId: string, photoId: string): string {
  return `${COLLECTIONS.ORDERS}/${orderId}/${COLLECTIONS.PHOTOS}/${photoId}`;
}

// Storage paths
export const STORAGE_PATHS = {
  SERVICE_PHOTOS: 'service-photos',
  EXPENSE_RECEIPTS: 'expense-receipts',
} as const;

export function getServicePhotoPath(
  userId: string,
  orderId: string,
  fileName: string
): string {
  return `${STORAGE_PATHS.SERVICE_PHOTOS}/${userId}/${orderId}/${fileName}`;
}

export function getExpenseReceiptPath(
  userId: string,
  expenseId: string,
  fileName: string
): string {
  return `${STORAGE_PATHS.EXPENSE_RECEIPTS}/${userId}/${expenseId}/${fileName}`;
}
