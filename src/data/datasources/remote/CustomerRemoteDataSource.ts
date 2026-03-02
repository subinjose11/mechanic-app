import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './SupabaseClient';

type CustomerRow = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export class CustomerRemoteDataSource {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<CustomerRow[]> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<CustomerRow | null> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(customer: CustomerInsert): Promise<CustomerRow> {
    const { data, error } = await this.supabase
      .from('customers')
      .insert(customer as any)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerRow;
  }

  async update(id: string, updates: CustomerUpdate): Promise<CustomerRow> {
    const { data, error } = await this.supabase
      .from('customers')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async search(query: string): Promise<CustomerRow[]> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name')
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async getByPhone(phone: string): Promise<CustomerRow | null> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getPaginated(page: number, limit: number): Promise<{
    data: CustomerRow[];
    count: number;
  }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  }
}
