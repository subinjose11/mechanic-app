// MobX store hooks for reactive data access
import { useContext } from 'react';
import { RootStoreContext, RootStore } from '@stores/RootStore';
import { AuthStore, authStore } from '@stores/AuthStore';
import { CustomerStore, customerStore } from '@stores/CustomerStore';
import { VehicleStore, vehicleStore } from '@stores/VehicleStore';
import { OrderStore, orderStore } from '@stores/OrderStore';
import { AppointmentStore, appointmentStore } from '@stores/AppointmentStore';
import { ExpenseStore, expenseStore } from '@stores/ExpenseStore';
import { UIStore, uiStore } from '@stores/UIStore';

// Root store hook
export function useRootStore(): RootStore {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error('useRootStore must be used within RootStoreContext.Provider');
  }
  return store;
}

// Individual store hooks
export function useAuthStore(): AuthStore {
  return authStore;
}

export function useCustomerStore(): CustomerStore {
  return customerStore;
}

export function useVehicleStore(): VehicleStore {
  return vehicleStore;
}

export function useOrderStore(): OrderStore {
  return orderStore;
}

export function useAppointmentStore(): AppointmentStore {
  return appointmentStore;
}

export function useExpenseStore(): ExpenseStore {
  return expenseStore;
}

export function useUIStore(): UIStore {
  return uiStore;
}

// Convenience hooks for common patterns
export function useUser() {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    needsShopSetup: store.needsShopSetup,
    error: store.error,
  };
}

export function useLoading() {
  const store = useUIStore();
  return {
    isLoading: store.isLoading,
    loadingMessage: store.loadingMessage,
    hasActiveOperations: store.hasActiveOperations,
  };
}
