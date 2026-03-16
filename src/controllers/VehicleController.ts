// Vehicle controller - handles vehicle operations
import { BaseController } from './base/BaseController';
import { vehicleStore } from '@stores/VehicleStore';
import { customerStore } from '@stores/CustomerStore';
import { authStore } from '@stores/AuthStore';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@models/Vehicle';

class VehicleController extends BaseController<Vehicle> {
  private static instance: VehicleController;

  private constructor() {
    super('vehicle');
  }

  static getInstance(): VehicleController {
    if (!VehicleController.instance) {
      VehicleController.instance = new VehicleController();
    }
    return VehicleController.instance;
  }

  // Get all vehicles
  get vehicles(): Vehicle[] {
    return vehicleStore.vehicles;
  }

  // Get current vehicle
  get currentVehicle(): Vehicle | null {
    return vehicleStore.currentVehicle;
  }

  // Get vehicle count
  get vehicleCount(): number {
    return vehicleStore.vehicleCount;
  }

  // Check if loading
  get isLoading(): boolean {
    return vehicleStore.isLoading;
  }

  // Get error
  get error(): string | null {
    return vehicleStore.error;
  }

  // Get vehicle by ID
  getById(id: string): Vehicle | undefined {
    return vehicleStore.getById(id);
  }

  // Get vehicles by customer
  getByCustomerId(customerId: string): Vehicle[] {
    return vehicleStore.getByCustomerId(customerId);
  }

  // Search vehicles
  search(query: string): Vehicle[] {
    return vehicleStore.search(query);
  }

  // Fetch all vehicles
  async fetchAll(userId?: string): Promise<void> {
    const uid = userId || authStore.userId;
    if (!uid) throw new Error('User not authenticated');

    await this.withLoading(
      () => vehicleStore.fetchAll(uid),
      'Loading vehicles...'
    );
  }

  // Fetch vehicles by customer
  async fetchByCustomer(customerId: string): Promise<Vehicle[]> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    return this.withLoading(
      () => vehicleStore.fetchByCustomer(userId, customerId)
    );
  }

  // Fetch single vehicle
  async fetchById(id: string): Promise<Vehicle | null> {
    return this.withLoading(
      () => vehicleStore.fetchById(id)
    );
  }

  // Create vehicle
  async create(input: CreateVehicleInput): Promise<Vehicle> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    // Get customer name for denormalization
    const customer = customerStore.getById(input.customerId);
    const customerName = customer?.name;

    return this.withLoading(
      () => vehicleStore.create(userId, input, customerName),
      'Creating vehicle...',
      'Vehicle created!'
    );
  }

  // Update vehicle
  async update(id: string, input: UpdateVehicleInput): Promise<void> {
    await this.withLoading(
      () => vehicleStore.update(id, input),
      'Updating vehicle...',
      'Vehicle updated!'
    );
  }

  // Delete vehicle
  async delete(id: string): Promise<void> {
    await this.withLoading(
      () => vehicleStore.delete(id),
      'Deleting vehicle...',
      'Vehicle deleted!'
    );
  }

  // Set current vehicle
  setCurrentVehicle(vehicle: Vehicle | null): void {
    vehicleStore.setCurrentVehicle(vehicle);
  }

  // Clear error
  clearError(): void {
    vehicleStore.clearError();
  }

  // Subscribe to real-time updates
  subscribe(): void {
    const userId = authStore.userId;
    if (userId) {
      vehicleStore.subscribeToVehicles(userId);
    }
  }

  // Unsubscribe from updates
  unsubscribe(): void {
    vehicleStore.dispose();
  }
}

// Export singleton instance
export const vehicleController = VehicleController.getInstance();
export { VehicleController };
