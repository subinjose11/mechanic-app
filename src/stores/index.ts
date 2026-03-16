// Stores index - exports all MobX stores
export { rootStore, RootStore, RootStoreContext, useRootStore } from './RootStore';
export { authStore, AuthStore } from './AuthStore';
export { customerStore, CustomerStore } from './CustomerStore';
export { vehicleStore, VehicleStore } from './VehicleStore';
export { orderStore, OrderStore } from './OrderStore';
export { appointmentStore, AppointmentStore } from './AppointmentStore';
export { expenseStore, ExpenseStore } from './ExpenseStore';
export { uiStore, UIStore } from './UIStore';
export type { ToastMessage, FilterState } from './UIStore';
export type { AuthStatus } from './AuthStore';

// Re-export hooks from views/hooks
export {
  useRootStore as useRootStoreHook,
  useAuthStore,
  useCustomerStore,
  useVehicleStore,
  useOrderStore,
  useAppointmentStore,
  useExpenseStore,
  useUIStore,
  useUser,
  useLoading,
} from '@views/hooks/useStore';
