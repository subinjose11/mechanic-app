// Vehicle state store
import { makeAutoObservable, runInAction } from 'mobx';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@models/Vehicle';
import { firestoreService, FilterCondition } from '@firebaseServices/firestore/FirestoreService';
import { COLLECTIONS } from '@firebaseServices/firestore/collections';
import { vehicleConverter } from '@firebaseServices/firestore/converters';

class VehicleStore {
  vehicles: Vehicle[] = [];
  currentVehicle: Vehicle | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private unsubscribe: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed properties
  get vehicleCount(): number {
    return this.vehicles.length;
  }

  // Get vehicles by customer
  getByCustomerId(customerId: string): Vehicle[] {
    return this.vehicles.filter((v) => v.customerId === customerId);
  }

  // Get vehicle by ID from local state
  getById(id: string): Vehicle | undefined {
    return this.vehicles.find((v) => v.id === id);
  }

  // Search vehicles locally
  search(query: string): Vehicle[] {
    const lowerQuery = query.toLowerCase();
    return this.vehicles.filter(
      (v) =>
        v.make.toLowerCase().includes(lowerQuery) ||
        v.model.toLowerCase().includes(lowerQuery) ||
        v.licensePlate.toLowerCase().includes(lowerQuery) ||
        v.customerName?.toLowerCase().includes(lowerQuery)
    );
  }

  // Subscribe to vehicles for a user (real-time updates)
  subscribeToVehicles(userId: string): void {
    this.isLoading = true;

    const filters: FilterCondition[] = [
      { field: 'userId', operator: '==', value: userId },
    ];

    this.unsubscribe = firestoreService.subscribeToCollection<Vehicle>(
      COLLECTIONS.VEHICLES,
      (vehicles) => {
        runInAction(() => {
          this.vehicles = vehicles;
          this.isLoading = false;
        });
      },
      filters,
      { orderByField: 'createdAt', orderDirection: 'desc' },
      vehicleConverter
    );
  }

  // Fetch all vehicles (one-time)
  async fetchAll(userId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: FilterCondition[] = [
        { field: 'userId', operator: '==', value: userId },
      ];

      const vehicles = await firestoreService.getAll<Vehicle>(
        COLLECTIONS.VEHICLES,
        filters,
        { orderByField: 'createdAt', orderDirection: 'desc' },
        vehicleConverter
      );

      runInAction(() => {
        this.vehicles = vehicles;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch vehicles';
        this.isLoading = false;
      });
    }
  }

  // Fetch vehicles by customer
  async fetchByCustomer(userId: string, customerId: string): Promise<Vehicle[]> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: FilterCondition[] = [
        { field: 'userId', operator: '==', value: userId },
        { field: 'customerId', operator: '==', value: customerId },
      ];

      const vehicles = await firestoreService.getAll<Vehicle>(
        COLLECTIONS.VEHICLES,
        filters,
        { orderByField: 'createdAt', orderDirection: 'desc' },
        vehicleConverter
      );

      runInAction(() => {
        // Merge with existing vehicles
        vehicles.forEach((vehicle) => {
          const index = this.vehicles.findIndex((v) => v.id === vehicle.id);
          if (index === -1) {
            this.vehicles.push(vehicle);
          } else {
            this.vehicles[index] = vehicle;
          }
        });
        this.isLoading = false;
      });

      return vehicles;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch vehicles';
        this.isLoading = false;
      });
      return [];
    }
  }

  // Fetch single vehicle
  async fetchById(id: string): Promise<Vehicle | null> {
    this.isLoading = true;
    this.error = null;

    try {
      const vehicle = await firestoreService.getById<Vehicle>(
        COLLECTIONS.VEHICLES,
        id,
        vehicleConverter
      );

      runInAction(() => {
        this.currentVehicle = vehicle;
        this.isLoading = false;
      });

      return vehicle;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch vehicle';
        this.isLoading = false;
      });
      return null;
    }
  }

  // Create vehicle
  async create(
    userId: string,
    input: CreateVehicleInput,
    customerName?: string
  ): Promise<Vehicle> {
    this.isLoading = true;
    this.error = null;

    try {
      const vehicleData: Omit<Vehicle, 'id'> = {
        userId,
        customerId: input.customerId,
        make: input.make,
        model: input.model,
        year: input.year || null,
        licensePlate: input.licensePlate,
        vin: input.vin || null,
        color: input.color || null,
        notes: input.notes || null,
        customerName,
        createdAt: new Date(),
      };

      const vehicle = await firestoreService.create<Vehicle>(
        COLLECTIONS.VEHICLES,
        vehicleData,
        vehicleConverter
      );

      runInAction(() => {
        this.vehicles.unshift(vehicle);
        this.isLoading = false;
      });

      return vehicle;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to create vehicle';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Update vehicle
  async update(id: string, input: UpdateVehicleInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await firestoreService.update<Vehicle>(COLLECTIONS.VEHICLES, id, input);

      runInAction(() => {
        const index = this.vehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          this.vehicles[index] = { ...this.vehicles[index], ...input };
        }
        if (this.currentVehicle?.id === id) {
          this.currentVehicle = { ...this.currentVehicle, ...input };
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to update vehicle';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Delete vehicle
  async delete(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await firestoreService.delete(COLLECTIONS.VEHICLES, id);

      runInAction(() => {
        this.vehicles = this.vehicles.filter((v) => v.id !== id);
        if (this.currentVehicle?.id === id) {
          this.currentVehicle = null;
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to delete vehicle';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Set current vehicle
  setCurrentVehicle(vehicle: Vehicle | null) {
    this.currentVehicle = vehicle;
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
    this.vehicles = [];
    this.currentVehicle = null;
    this.isLoading = false;
    this.error = null;
  }
}

export const vehicleStore = new VehicleStore();
export { VehicleStore };
