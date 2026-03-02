import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './SupabaseClient';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];

export class VehicleRemoteDataSource {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<VehicleRow[]> {
    const { data, error } = await this.supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<VehicleRow | null> {
    const { data, error } = await this.supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(vehicle: VehicleInsert): Promise<VehicleRow> {
    const { data, error } = await this.supabase
      .from('vehicles')
      .insert(vehicle as any)
      .select()
      .single();

    if (error) throw error;
    return data as VehicleRow;
  }

  async update(id: string, updates: VehicleUpdate): Promise<VehicleRow> {
    const { data, error } = await this.supabase
      .from('vehicles')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VehicleRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
  }

  async getByCustomerId(customerId: string): Promise<VehicleRow[]> {
    const { data, error } = await this.supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getByLicensePlate(licensePlate: string): Promise<VehicleRow | null> {
    const { data, error } = await this.supabase
      .from('vehicles')
      .select('*')
      .eq('license_plate', licensePlate)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async search(query: string): Promise<VehicleRow[]> {
    const { data, error } = await this.supabase
      .from('vehicles')
      .select('*')
      .or(`license_plate.ilike.%${query}%,make.ilike.%${query}%,model.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async getPaginated(page: number, limit: number): Promise<{ data: VehicleRow[]; count: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from('vehicles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  }
}
