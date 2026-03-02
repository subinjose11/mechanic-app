import { ServiceOrder, CreateServiceOrderInput, UpdateServiceOrderInput } from '@domain/entities/ServiceOrder';
import { Database } from '@data/datasources/remote/SupabaseClient';
import { OrderStatus } from '@core/constants';

type OrderRow = Database['public']['Tables']['service_orders']['Row'];
type OrderInsert = Database['public']['Tables']['service_orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['service_orders']['Update'];

export class ServiceOrderMapper {
  static toDomain(row: OrderRow): ServiceOrder {
    return {
      id: row.id,
      userId: row.user_id,
      vehicleId: row.vehicle_id,
      customerId: row.customer_id,
      status: row.status as OrderStatus,
      kmReading: (row as any).km_reading || null,
      description: row.description,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
    };
  }

  static toInsert(input: CreateServiceOrderInput, userId: string): OrderInsert {
    return {
      user_id: userId,
      vehicle_id: input.vehicleId,
      customer_id: input.customerId,
      status: 'pending',
      km_reading: input.kmReading || null,
      description: input.description || null,
      notes: input.notes || null,
    } as any;
  }

  static toUpdate(input: UpdateServiceOrderInput): OrderUpdate {
    const update: any = {};
    if (input.description !== undefined) update.description = input.description || null;
    if (input.notes !== undefined) update.notes = input.notes || null;
    if (input.status !== undefined) update.status = input.status;
    if (input.kmReading !== undefined) update.km_reading = input.kmReading || null;
    return update;
  }
}
