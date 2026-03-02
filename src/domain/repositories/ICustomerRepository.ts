import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@domain/entities/Customer';

export interface ICustomerRepository {
  // CRUD operations
  getAll(): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  create(data: CreateCustomerInput): Promise<Customer>;
  update(id: string, data: UpdateCustomerInput): Promise<Customer>;
  delete(id: string): Promise<void>;

  // Search and filter
  search(query: string): Promise<Customer[]>;
  getByPhone(phone: string): Promise<Customer | null>;

  // Pagination
  getPaginated(page: number, limit: number): Promise<{
    data: Customer[];
    total: number;
    hasMore: boolean;
  }>;
}
