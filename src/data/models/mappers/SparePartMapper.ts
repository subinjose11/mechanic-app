import { SparePart, CreateSparePartInput } from '@domain/entities/SparePart';
import { Database } from '@data/datasources/remote/SupabaseClient';

type PartRow = Database['public']['Tables']['spare_parts']['Row'];
type PartInsert = Database['public']['Tables']['spare_parts']['Insert'];
type PartUpdate = Database['public']['Tables']['spare_parts']['Update'];

export class SparePartMapper {
  static toDomain(row: PartRow): SparePart {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      partName: row.part_name,
      partNumber: row.part_number,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      total: row.total,
    };
  }

  static toInsert(input: CreateSparePartInput): PartInsert {
    return {
      service_order_id: input.serviceOrderId,
      part_name: input.partName,
      part_number: input.partNumber || null,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      // total is a generated column in DB, don't include it
    };
  }

  static toUpdate(input: Partial<CreateSparePartInput>, current?: SparePart): PartUpdate {
    const update: PartUpdate = {};
    if (input.partName !== undefined) update.part_name = input.partName;
    if (input.partNumber !== undefined) update.part_number = input.partNumber || null;
    if (input.quantity !== undefined) update.quantity = input.quantity;
    if (input.unitPrice !== undefined) update.unit_price = input.unitPrice;
    // total is a generated column in DB, don't include it
    return update;
  }
}
