import { IExpenseRepository, ExpenseFilters } from '@domain/repositories/IExpenseRepository';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '@domain/entities/Expense';
import { ExpenseRemoteDataSource } from '@data/datasources/remote/ExpenseRemoteDataSource';
import { ExpenseMapper } from '@data/models/mappers';
import { supabase } from '@data/datasources/remote/SupabaseClient';
import { storageService } from '@services/storage/SupabaseStorageService';
import { ExpenseCategory } from '@core/constants';

export class ExpenseRepositoryImpl implements IExpenseRepository {
  constructor(private dataSource: ExpenseRemoteDataSource) {}

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  private convertFilters(filters?: ExpenseFilters) {
    if (!filters) return undefined;
    return {
      category: filters.category,
      startDate: filters.startDate?.toISOString().split('T')[0],
      endDate: filters.endDate?.toISOString().split('T')[0],
    };
  }

  async getAll(filters?: ExpenseFilters): Promise<Expense[]> {
    const rows = await this.dataSource.getAll(this.convertFilters(filters));
    return rows.map(ExpenseMapper.toDomain);
  }

  async getById(id: string): Promise<Expense | null> {
    const row = await this.dataSource.getById(id);
    return row ? ExpenseMapper.toDomain(row) : null;
  }

  async create(data: CreateExpenseInput): Promise<Expense> {
    const userId = await this.getCurrentUserId();
    const insert = ExpenseMapper.toInsert(data, userId);
    const row = await this.dataSource.create(insert);
    return ExpenseMapper.toDomain(row);
  }

  async update(id: string, data: UpdateExpenseInput): Promise<Expense> {
    const update = ExpenseMapper.toUpdate(data);
    const row = await this.dataSource.update(id, update);
    return ExpenseMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(id);
  }

  async getByCategory(category: ExpenseCategory): Promise<Expense[]> {
    const rows = await this.dataSource.getByCategory(category);
    return rows.map(ExpenseMapper.toDomain);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const rows = await this.dataSource.getAll({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
    return rows.map(ExpenseMapper.toDomain);
  }

  async uploadReceipt(expenseId: string, imageUri: string): Promise<Expense> {
    // Upload the receipt image
    const { url } = await storageService.uploadExpenseReceipt(imageUri);

    // Update the expense with the receipt URL
    const row = await this.dataSource.update(expenseId, { receipt_url: url });
    return ExpenseMapper.toDomain(row);
  }

  async getExpenseStats(startDate?: Date, endDate?: Date): Promise<{
    totalExpenses: number;
    expensesByCategory: Record<ExpenseCategory, number>;
    monthlyTrend: Array<{ month: string; total: number }>;
  }> {
    const start = startDate?.toISOString().split('T')[0];
    const end = endDate?.toISOString().split('T')[0];
    return this.dataSource.getExpenseStats(start, end);
  }

  async getPaginated(page: number, limit: number, filters?: ExpenseFilters): Promise<{
    data: Expense[];
    total: number;
    hasMore: boolean;
  }> {
    // Since data source doesn't have pagination, implement it here
    const allData = await this.dataSource.getAll(this.convertFilters(filters));
    const total = allData.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRows = allData.slice(start, end);

    return {
      data: paginatedRows.map(ExpenseMapper.toDomain),
      total,
      hasMore: end < total,
    };
  }
}
