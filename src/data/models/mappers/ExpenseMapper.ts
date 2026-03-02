import { Expense, CreateExpenseInput } from '@domain/entities/Expense';
import { Database } from '@data/datasources/remote/SupabaseClient';
import { ExpenseCategory } from '@core/constants';

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export class ExpenseMapper {
  static toDomain(row: ExpenseRow): Expense {
    return {
      id: row.id,
      userId: row.user_id,
      category: row.category as ExpenseCategory,
      amount: row.amount,
      description: row.description,
      date: new Date(row.date),
      receiptUrl: row.receipt_url,
      createdAt: new Date(row.created_at),
    };
  }

  static toInsert(input: CreateExpenseInput, userId: string): ExpenseInsert {
    return {
      user_id: userId,
      category: input.category,
      amount: input.amount,
      description: input.description || null,
      date: input.date.toISOString().split('T')[0],
      receipt_url: input.receiptUrl || null,
    };
  }

  static toUpdate(input: Partial<CreateExpenseInput>): ExpenseUpdate {
    const update: ExpenseUpdate = {};
    if (input.category !== undefined) update.category = input.category;
    if (input.amount !== undefined) update.amount = input.amount;
    if (input.description !== undefined) update.description = input.description || null;
    if (input.date !== undefined) update.date = input.date.toISOString().split('T')[0];
    if (input.receiptUrl !== undefined) update.receipt_url = input.receiptUrl || null;
    return update;
  }
}
