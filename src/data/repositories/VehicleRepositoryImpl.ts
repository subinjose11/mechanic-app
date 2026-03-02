import { IVehicleRepository } from '@domain/repositories/IVehicleRepository';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@domain/entities/Vehicle';
import { VehicleRemoteDataSource } from '@data/datasources/remote/VehicleRemoteDataSource';
import { VehicleMapper } from '@data/models/mappers';
import { supabase } from '@data/datasources/remote/SupabaseClient';

export class VehicleRepositoryImpl implements IVehicleRepository {
  constructor(private dataSource: VehicleRemoteDataSource) {}

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  async getAll(): Promise<Vehicle[]> {
    const rows = await this.dataSource.getAll();
    return rows.map(VehicleMapper.toDomain);
  }

  async getById(id: string): Promise<Vehicle | null> {
    const row = await this.dataSource.getById(id);
    return row ? VehicleMapper.toDomain(row) : null;
  }

  async create(data: CreateVehicleInput): Promise<Vehicle> {
    const userId = await this.getCurrentUserId();
    const insert = VehicleMapper.toInsert(data, userId);
    const row = await this.dataSource.create(insert);
    return VehicleMapper.toDomain(row);
  }

  async update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    const update = VehicleMapper.toUpdate(data);
    const row = await this.dataSource.update(id, update);
    return VehicleMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(id);
  }

  async getByCustomerId(customerId: string): Promise<Vehicle[]> {
    const rows = await this.dataSource.getByCustomerId(customerId);
    return rows.map(VehicleMapper.toDomain);
  }

  async getByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const row = await this.dataSource.getByLicensePlate(licensePlate);
    return row ? VehicleMapper.toDomain(row) : null;
  }

  async search(query: string): Promise<Vehicle[]> {
    const rows = await this.dataSource.search(query);
    return rows.map(VehicleMapper.toDomain);
  }

  async getPaginated(page: number, limit: number): Promise<{
    data: Vehicle[];
    total: number;
    hasMore: boolean;
  }> {
    const result = await this.dataSource.getPaginated(page, limit);
    return {
      data: result.data.map(VehicleMapper.toDomain),
      total: result.count,
      hasMore: page * limit < result.count,
    };
  }
}
