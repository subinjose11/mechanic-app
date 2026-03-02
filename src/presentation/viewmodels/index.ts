// Authentication
export { useAuth, AuthProvider } from './useAuth';

// Customers
export {
  useCustomers,
  useCustomer,
  useSearchCustomers,
  usePaginatedCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCustomerByPhone,
  customerKeys,
} from './useCustomers';

// Vehicles
export {
  useVehicles,
  useVehicle,
  useVehiclesByCustomer,
  useSearchVehicles,
  useVehicleByLicensePlate,
  usePaginatedVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  vehicleKeys,
} from './useVehicles';

// Orders
export {
  useOrders,
  useOrder,
  useOrderWithDetails,
  useOrdersByVehicle,
  useOrdersByCustomer,
  useOrderStats,
  usePaginatedOrders,
  useCreateOrder,
  useUpdateOrder,
  useUpdateOrderStatus,
  useCompleteOrder,
  useCancelOrder,
  useDeleteOrder,
  useLaborItems,
  useAddLaborItem,
  useUpdateLaborItem,
  useDeleteLaborItem,
  useSpareParts,
  useAddSparePart,
  useUpdateSparePart,
  useDeleteSparePart,
  orderKeys,
} from './useOrders';

// Payments
export {
  usePayments,
  usePayment,
  usePaymentsByOrder,
  useTotalPaymentByOrder,
  useTotalAdvancesByOrder,
  usePaymentStats,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
  paymentKeys,
} from './usePayments';

// Appointments
export {
  useAppointments,
  useAppointment,
  useUpcomingAppointments,
  useAppointmentsByDate,
  useAppointmentsForMonth,
  useAppointmentsByCustomer,
  useAppointmentsByVehicle,
  useAvailableTimeSlots,
  useAppointmentStats,
  useCreateAppointment,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
  useConfirmAppointment,
  useCancelAppointment,
  useCompleteAppointment,
  useDeleteAppointment,
  appointmentKeys,
} from './useAppointments';

// Photos
export {
  usePhotos,
  usePhoto,
  usePhotosByOrder,
  usePhotosByOrderAndType,
  useUploadPhoto,
  useCreatePhoto,
  useUpdatePhoto,
  useDeletePhoto,
  photoKeys,
} from './usePhotos';

// Expenses
export {
  useExpenses,
  useExpense,
  useExpensesByCategory,
  useExpensesByDateRange,
  useExpenseStats,
  usePaginatedExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useUploadReceipt,
  expenseKeys,
} from './useExpenses';

// Analytics
export {
  useDashboardAnalytics,
  useRevenueAnalytics,
  useExpenseAnalytics,
  useAnalyticsByDateRange,
  useThisMonthAnalytics,
  useThisWeekAnalytics,
  useTodayAnalytics,
  analyticsKeys,
} from './useAnalytics';
