import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './SupabaseClient';
import { ExpenseCategory } from '@core/constants';
import { storageService } from '@services/storage/SupabaseStorageService';

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
}

export class ExpenseRemoteDataSource {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: ExpenseFilters): Promise<ExpenseRow[]> {
    let query = this.supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.startDate) query = query.gte('date', filters.startDate);
    if (filters?.endDate) query = query.lte('date', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<ExpenseRow | null> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(expense: ExpenseInsert): Promise<ExpenseRow> {
    const { data, error } = await this.supabase
      .from('expenses')
      .insert(expense as any)
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseRow;
  }

  async update(id: string, updates: ExpenseUpdate): Promise<ExpenseRow> {
    const { data, error } = await this.supabase
      .from('expenses')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  }

  async createWithReceipt(
    expense: Omit<ExpenseInsert, 'receipt_url'>,
    receiptUri: string
  ): Promise<ExpenseRow> {
    // Upload receipt to storage
    const { url } = await storageService.uploadExpenseReceipt(receiptUri);

    // Create expense with receipt URL
    return this.create({
      ...expense,
      receipt_url: url,
    });
  }

  async getExpenseStats(startDate?: string, endDate?: string): Promise<{
    totalExpenses: number;
    expensesByCategory: Record<ExpenseCategory, number>;
    monthlyTrend: { month: string; total: number }[];
  }> {
    let query = this.supabase.from('expenses').select('*');
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;

    const expenses = data as ExpenseRow[] || [];

    const stats = {
      totalExpenses: 0,
      expensesByCategory: {
        rent: 0,
        utilities: 0,
        supplies: 0,
        salaries: 0,
        maintenance: 0,
        other: 0,
      } as Record<ExpenseCategory, number>,
      monthlyTrend: [] as { month: string; total: number }[],
    };

    const monthlyMap = new Map<string, number>();

    expenses.forEach((expense) => {
      stats.totalExpenses += expense.amount;
      stats.expensesByCategory[expense.category as ExpenseCategory] += expense.amount;

      // Track monthly trend
      const month = expense.date.substring(0, 7); // YYYY-MM
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + expense.amount);
    });

    // Convert monthly map to sorted array
    stats.monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return stats;
  }

  async getByCategory(category: ExpenseCategory): Promise<ExpenseRow[]> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('category', category)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRecentExpenses(limit: number = 10): Promise<ExpenseRow[]> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
