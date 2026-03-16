// Customer controller - handles customer operations
import { BaseController } from './base/BaseController';
import { customerStore } from '@stores/CustomerStore';
import { authStore } from '@stores/AuthStore';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@models/Customer';

class CustomerController extends BaseController<Customer> {
  private static instance: CustomerController;

  private constructor() {
    super('customer');
  }

  static getInstance(): CustomerController {
    if (!CustomerController.instance) {
      CustomerController.instance = new CustomerController();
    }
    return CustomerController.instance;
  }

  // Get all customers
  get customers(): Customer[] {
    return customerStore.customers;
  }

  // Get sorted customers
  get sortedCustomers(): Customer[] {
    return customerStore.sortedCustomers;
  }

  // Get current customer
  get currentCustomer(): Customer | null {
    return customerStore.currentCustomer;
  }

  // Get customer count
  get customerCount(): number {
    return customerStore.customerCount;
  }

  // Check if loading
  get isLoading(): boolean {
    return customerStore.isLoading;
  }

  // Get error
  get error(): string | null {
    return customerStore.error;
  }

  // Get customer by ID
  getById(id: string): Customer | undefined {
    return customerStore.getById(id);
  }

  // Search customers
  search(query: string): Customer[] {
    return customerStore.search(query);
  }

  // Fetch all customers
  async fetchAll(userId?: string): Promise<void> {
    const uid = userId || authStore.userId;
    if (!uid) throw new Error('User not authenticated');

    await this.withLoading(
      () => customerStore.fetchAll(uid),
      'Loading customers...'
    );
  }

  // Fetch single customer
  async fetchById(id: string): Promise<Customer | null> {
    return this.withLoading(
      () => customerStore.fetchById(id)
    );
  }

  // Create customer
  async create(input: CreateCustomerInput): Promise<Customer> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    return this.withLoading(
      () => customerStore.create(userId, input),
      'Creating customer...',
      'Customer created!'
    );
  }

  // Update customer
  async update(id: string, input: UpdateCustomerInput): Promise<void> {
    await this.withLoading(
      () => customerStore.update(id, input),
      'Updating customer...',
      'Customer updated!'
    );
  }

  // Delete customer
  async delete(id: string): Promise<void> {
    await this.withLoading(
      () => customerStore.delete(id),
      'Deleting customer...',
      'Customer deleted!'
    );
  }

  // Set current customer
  setCurrentCustomer(customer: Customer | null): void {
    customerStore.setCurrentCustomer(customer);
  }

  // Clear error
  clearError(): void {
    customerStore.clearError();
  }

  // Subscribe to real-time updates
  subscribe(): void {
    const userId = authStore.userId;
    if (userId) {
      customerStore.subscribeToCustomers(userId);
    }
  }

  // Unsubscribe from updates
  unsubscribe(): void {
    customerStore.dispose();
  }
}

// Export singleton instance
export const customerController = CustomerController.getInstance();
export { CustomerController };
