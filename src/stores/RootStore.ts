// Root store - combines all stores and handles hydration
import { createContext, useContext } from 'react';
import { authStore, AuthStore } from './AuthStore';
import { customerStore, CustomerStore } from './CustomerStore';
import { vehicleStore, VehicleStore } from './VehicleStore';
import { orderStore, OrderStore } from './OrderStore';
import { appointmentStore, AppointmentStore } from './AppointmentStore';
import { expenseStore, ExpenseStore } from './ExpenseStore';
import { uiStore, UIStore } from './UIStore';
import { initializeFirebase } from '@firebaseServices/config';

class RootStore {
  authStore: AuthStore;
  customerStore: CustomerStore;
  vehicleStore: VehicleStore;
  orderStore: OrderStore;
  appointmentStore: AppointmentStore;
  expenseStore: ExpenseStore;
  uiStore: UIStore;

  private isInitialized: boolean = false;

  constructor() {
    this.authStore = authStore;
    this.customerStore = customerStore;
    this.vehicleStore = vehicleStore;
    this.orderStore = orderStore;
    this.appointmentStore = appointmentStore;
    this.expenseStore = expenseStore;
    this.uiStore = uiStore;
  }

  // Initialize the root store and Firebase
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize Firebase
    initializeFirebase();

    // Initialize auth listener (this will also initialize Firebase Auth)
    await this.authStore.initialize();

    this.isInitialized = true;
  }

  // Subscribe to all data stores when user is authenticated
  subscribeToUserData(userId: string): void {
    this.customerStore.subscribeToCustomers(userId);
    this.vehicleStore.subscribeToVehicles(userId);
    this.orderStore.subscribeToOrders(userId);
    this.appointmentStore.subscribeToAppointments(userId);
    this.expenseStore.subscribeToExpenses(userId);
  }

  // Fetch all data (one-time, for initial load)
  async fetchAllData(userId: string): Promise<void> {
    this.uiStore.setLoading(true, 'Loading data...');

    try {
      await Promise.all([
        this.customerStore.fetchAll(userId),
        this.vehicleStore.fetchAll(userId),
        this.orderStore.fetchAll(userId),
        this.appointmentStore.fetchAll(userId),
        this.expenseStore.fetchAll(userId),
      ]);
    } catch (error) {
      this.uiStore.setError(
        error instanceof Error ? error.message : 'Failed to load data'
      );
    } finally {
      this.uiStore.setLoading(false);
    }
  }

  // Cleanup all subscriptions
  disposeAll(): void {
    this.customerStore.dispose();
    this.vehicleStore.dispose();
    this.orderStore.dispose();
    this.appointmentStore.dispose();
    this.expenseStore.dispose();
  }

  // Reset all stores (on logout)
  resetAll(): void {
    this.disposeAll();
    this.customerStore.reset();
    this.vehicleStore.reset();
    this.orderStore.reset();
    this.appointmentStore.reset();
    this.expenseStore.reset();
    this.uiStore.reset();
  }
}

// Create singleton instance
export const rootStore = new RootStore();

// React Context for MobX stores
export const RootStoreContext = createContext<RootStore>(rootStore);

// Hook to use root store
export function useRootStore(): RootStore {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error('useRootStore must be used within RootStoreContext.Provider');
  }
  return store;
}

export { RootStore };
