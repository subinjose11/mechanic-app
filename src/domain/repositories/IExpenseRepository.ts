import { Expense, CreateExpenseInput, UpdateExpenseInput } from '@domain/entities/Expense';
import { ExpenseCategory } from '@core/constants';

export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: Date;
  endDate?: Date;
}

export interface IExpenseRepository {
  // CRUD operations
  getAll(filters?: ExpenseFilters): Promise<Expense[]>;
  getById(id: string): Promise<Expense | null>;
  create(data: CreateExpenseInput): Promise<Expense>;
  update(id: string, data: UpdateExpenseInput): Promise<Expense>;
  delete(id: string): Promise<void>;

  // Queries
  getByCategory(category: ExpenseCategory): Promise<Expense[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;

  // Upload receipt
  uploadReceipt(expenseId: string, imageUri: string): Promise<Expense>;

  // Statistics
  getExpenseStats(startDate?: Date, endDate?: Date): Promise<{
    totalExpenses: number;
    expensesByCategory: Record<ExpenseCategory, number>;
    monthlyTrend: Array<{ month: string; total: number }>;
  }>;

  // Pagination
  getPaginated(page: number, limit: number, filters?: ExpenseFilters): Promise<{
    data: Expense[];
    total: number;
    hasMore: boolean;
  }>;
}
