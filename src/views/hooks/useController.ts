// Controller access hooks
import { authController, AuthController } from '@controllers/AuthController';
import { customerController, CustomerController } from '@controllers/CustomerController';
import { vehicleController, VehicleController } from '@controllers/VehicleController';
import { orderController, OrderController } from '@controllers/OrderController';
import { appointmentController, AppointmentController } from '@controllers/AppointmentController';
import { expenseController, ExpenseController } from '@controllers/ExpenseController';
import { analyticsController, AnalyticsController } from '@controllers/AnalyticsController';

// Auth controller hook
export function useAuthController(): AuthController {
  return authController;
}

// Customer controller hook
export function useCustomerController(): CustomerController {
  return customerController;
}

// Vehicle controller hook
export function useVehicleController(): VehicleController {
  return vehicleController;
}

// Order controller hook
export function useOrderController(): OrderController {
  return orderController;
}

// Appointment controller hook
export function useAppointmentController(): AppointmentController {
  return appointmentController;
}

// Expense controller hook
export function useExpenseController(): ExpenseController {
  return expenseController;
}

// Analytics controller hook
export function useAnalyticsController(): AnalyticsController {
  return analyticsController;
}
