// Customer state store
import { makeAutoObservable, runInAction } from 'mobx';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@models/Customer';
import { firestoreService, FilterCondition } from '@firebaseServices/firestore/FirestoreService';
import { COLLECTIONS } from '@firebaseServices/firestore/collections';
import { customerConverter } from '@firebaseServices/firestore/converters';

class CustomerStore {
  customers: Customer[] = [];
  currentCustomer: Customer | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private unsubscribe: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed properties
  get customerCount(): number {
    return this.customers.length;
  }

  get sortedCustomers(): Customer[] {
    return [...this.customers].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get customer by ID from local state
  getById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  // Search customers locally
  search(query: string): Customer[] {
    const lowerQuery = query.toLowerCase();
    return this.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery)
    );
  }

  // Subscribe to customers for a user (real-time updates)
  subscribeToCustomers(userId: string): void {
    this.isLoading = true;

    const filters: FilterCondition[] = [
      { field: 'userId', operator: '==', value: userId },
    ];

    this.unsubscribe = firestoreService.subscribeToCollection<Customer>(
      COLLECTIONS.CUSTOMERS,
      (customers) => {
        runInAction(() => {
          this.customers = customers;
          this.isLoading = false;
        });
      },
      filters,
      { orderByField: 'name', orderDirection: 'asc' },
      customerConverter
    );
  }

  // Fetch all customers (one-time)
  async fetchAll(userId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: FilterCondition[] = [
        { field: 'userId', operator: '==', value: userId },
      ];

      const customers = await firestoreService.getAll<Customer>(
        COLLECTIONS.CUSTOMERS,
        filters,
        { orderByField: 'name', orderDirection: 'asc' },
        customerConverter
      );

      runInAction(() => {
        this.customers = customers;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch customers';
        this.isLoading = false;
      });
    }
  }

  // Fetch single customer
  async fetchById(id: string): Promise<Customer | null> {
    this.isLoading = true;
    this.error = null;

    try {
      const customer = await firestoreService.getById<Customer>(
        COLLECTIONS.CUSTOMERS,
        id,
        customerConverter
      );

      runInAction(() => {
        this.currentCustomer = customer;
        this.isLoading = false;
      });

      return customer;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch customer';
        this.isLoading = false;
      });
      return null;
    }
  }

  // Create customer
  async create(userId: string, input: CreateCustomerInput): Promise<Customer> {
    this.isLoading = true;
    this.error = null;

    try {
      const customerData: Omit<Customer, 'id'> = {
        userId,
        name: input.name,
        phone: input.phone || null,
        email: input.email || null,
        address: input.address || null,
        createdAt: new Date(),
      };

      const customer = await firestoreService.create<Customer>(
        COLLECTIONS.CUSTOMERS,
        customerData,
        customerConverter
      );

      runInAction(() => {
        this.customers.push(customer);
        this.isLoading = false;
      });

      return customer;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to create customer';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Update customer
  async update(id: string, input: UpdateCustomerInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await firestoreService.update<Customer>(COLLECTIONS.CUSTOMERS, id, input);

      runInAction(() => {
        const index = this.customers.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.customers[index] = { ...this.customers[index], ...input };
        }
        if (this.currentCustomer?.id === id) {
          this.currentCustomer = { ...this.currentCustomer, ...input };
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to update customer';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Delete customer
  async delete(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await firestoreService.delete(COLLECTIONS.CUSTOMERS, id);

      runInAction(() => {
        this.customers = this.customers.filter((c) => c.id !== id);
        if (this.currentCustomer?.id === id) {
          this.currentCustomer = null;
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to delete customer';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Set current customer
  setCurrentCustomer(customer: Customer | null) {
    this.currentCustomer = customer;
  }

  // Clear error
  clearError() {
    this.error = null;
  }

  // Cleanup subscription
  dispose() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Reset store
  reset() {
    this.dispose();
    this.customers = [];
    this.currentCustomer = null;
    this.isLoading = false;
    this.error = null;
  }
}

export const customerStore = new CustomerStore();
export { CustomerStore };
