import { Customer, CreateCustomerInput } from '@domain/entities/Customer';
import { Database } from '@data/datasources/remote/SupabaseClient';

type CustomerRow = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export class CustomerMapper {
  static toDomain(row: CustomerRow): Customer {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      createdAt: new Date(row.created_at),
    };
  }

  static toInsert(input: CreateCustomerInput, userId: string): CustomerInsert {
    return {
      user_id: userId,
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
    };
  }

  static toUpdate(input: Partial<CreateCustomerInput>): CustomerUpdate {
    const update: CustomerUpdate = {};
    if (input.name !== undefined) update.name = input.name;
    if (input.phone !== undefined) update.phone = input.phone || null;
    if (input.email !== undefined) update.email = input.email || null;
    if (input.address !== undefined) update.address = input.address || null;
    return update;
  }
}
