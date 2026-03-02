import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@domain/entities/Vehicle';

export interface IVehicleRepository {
  // CRUD operations
  getAll(): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
  create(data: CreateVehicleInput): Promise<Vehicle>;
  update(id: string, data: UpdateVehicleInput): Promise<Vehicle>;
  delete(id: string): Promise<void>;

  // Relationships
  getByCustomerId(customerId: string): Promise<Vehicle[]>;
  getByLicensePlate(licensePlate: string): Promise<Vehicle | null>;

  // Search
  search(query: string): Promise<Vehicle[]>;

  // Pagination
  getPaginated(page: number, limit: number): Promise<{
    data: Vehicle[];
    total: number;
    hasMore: boolean;
  }>;
}
