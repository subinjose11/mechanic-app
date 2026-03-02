import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@domain/entities/Customer';
import { CustomerRemoteDataSource } from '@data/datasources/remote/CustomerRemoteDataSource';
import { CustomerMapper } from '@data/models/mappers';
import { supabase } from '@data/datasources/remote/SupabaseClient';

export class CustomerRepositoryImpl implements ICustomerRepository {
  constructor(private dataSource: CustomerRemoteDataSource) {}

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  async getAll(): Promise<Customer[]> {
    const rows = await this.dataSource.getAll();
    return rows.map(CustomerMapper.toDomain);
  }

  async getById(id: string): Promise<Customer | null> {
    const row = await this.dataSource.getById(id);
    return row ? CustomerMapper.toDomain(row) : null;
  }

  async create(data: CreateCustomerInput): Promise<Customer> {
    const userId = await this.getCurrentUserId();
    const insert = CustomerMapper.toInsert(data, userId);
    const row = await this.dataSource.create(insert);
    return CustomerMapper.toDomain(row);
  }

  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const update = CustomerMapper.toUpdate(data);
    const row = await this.dataSource.update(id, update);
    return CustomerMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(id);
  }

  async search(query: string): Promise<Customer[]> {
    const rows = await this.dataSource.search(query);
    return rows.map(CustomerMapper.toDomain);
  }

  async getByPhone(phone: string): Promise<Customer | null> {
    const row = await this.dataSource.getByPhone(phone);
    return row ? CustomerMapper.toDomain(row) : null;
  }

  async getPaginated(page: number, limit: number): Promise<{
    data: Customer[];
    total: number;
    hasMore: boolean;
  }> {
    const result = await this.dataSource.getPaginated(page, limit);
    return {
      data: result.data.map(CustomerMapper.toDomain),
      total: result.count,
      hasMore: page * limit < result.count,
    };
  }
}
