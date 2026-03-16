// Controllers index - exports all controllers
export { authController, AuthController } from './AuthController';
export { customerController, CustomerController } from './CustomerController';
export { vehicleController, VehicleController } from './VehicleController';
export { orderController, OrderController } from './OrderController';
export { appointmentController, AppointmentController } from './AppointmentController';
export { expenseController, ExpenseController } from './ExpenseController';
export { analyticsController, AnalyticsController } from './AnalyticsController';
export type { DashboardStats, RevenueByPeriod, OrdersByStatus } from './AnalyticsController';

// Re-export controller hooks from views/hooks
export {
  useAuthController,
  useCustomerController,
  useVehicleController,
  useOrderController,
  useAppointmentController,
  useExpenseController,
  useAnalyticsController,
} from '@views/hooks/useController';
