import { LaborItem, CreateLaborItemInput } from '@domain/entities/LaborItem';
import { Database } from '@data/datasources/remote/SupabaseClient';

type LaborRow = Database['public']['Tables']['labor_items']['Row'];
type LaborInsert = Database['public']['Tables']['labor_items']['Insert'];
type LaborUpdate = Database['public']['Tables']['labor_items']['Update'];

export class LaborItemMapper {
  static toDomain(row: LaborRow): LaborItem {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      description: row.description,
      hours: row.hours,
      ratePerHour: row.rate_per_hour,
      total: row.total,
    };
  }

  static toInsert(input: CreateLaborItemInput): LaborInsert {
    return {
      service_order_id: input.serviceOrderId,
      description: input.description,
      hours: input.hours,
      rate_per_hour: input.ratePerHour,
      // total is a generated column in DB, don't include it
    };
  }

  static toUpdate(input: Partial<CreateLaborItemInput>, current?: LaborItem): LaborUpdate {
    const update: LaborUpdate = {};
    if (input.description !== undefined) update.description = input.description;
    if (input.hours !== undefined) update.hours = input.hours;
    if (input.ratePerHour !== undefined) update.rate_per_hour = input.ratePerHour;
    // total is a generated column in DB, don't include it
    return update;
  }
}
