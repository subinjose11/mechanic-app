import { Vehicle, CreateVehicleInput } from '@domain/entities/Vehicle';
import { Database } from '@data/datasources/remote/SupabaseClient';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];

export class VehicleMapper {
  static toDomain(row: VehicleRow): Vehicle {
    return {
      id: row.id,
      userId: row.user_id,
      customerId: row.customer_id,
      make: row.make,
      model: row.model,
      year: row.year,
      licensePlate: row.license_plate,
      vin: row.vin,
      color: row.color,
      notes: row.notes,
      createdAt: new Date(row.created_at),
    };
  }

  static toInsert(input: CreateVehicleInput, userId: string): VehicleInsert {
    return {
      user_id: userId,
      customer_id: input.customerId,
      make: input.make,
      model: input.model,
      year: input.year || null,
      license_plate: input.licensePlate,
      vin: input.vin || null,
      color: input.color || null,
      notes: input.notes || null,
    };
  }

  static toUpdate(input: Partial<CreateVehicleInput>): VehicleUpdate {
    const update: VehicleUpdate = {};
    if (input.make !== undefined) update.make = input.make;
    if (input.model !== undefined) update.model = input.model;
    if (input.year !== undefined) update.year = input.year || null;
    if (input.licensePlate !== undefined) update.license_plate = input.licensePlate;
    if (input.vin !== undefined) update.vin = input.vin || null;
    if (input.color !== undefined) update.color = input.color || null;
    if (input.notes !== undefined) update.notes = input.notes || null;
    return update;
  }
}
