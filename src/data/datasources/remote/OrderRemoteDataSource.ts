import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './SupabaseClient';
import { OrderStatus } from '@core/constants';

type OrderRow = Database['public']['Tables']['service_orders']['Row'];
type OrderInsert = Database['public']['Tables']['service_orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['service_orders']['Update'];
type LaborRow = Database['public']['Tables']['labor_items']['Row'];
type LaborInsert = Database['public']['Tables']['labor_items']['Insert'];
type LaborUpdate = Database['public']['Tables']['labor_items']['Update'];
type PartRow = Database['public']['Tables']['spare_parts']['Row'];
type PartInsert = Database['public']['Tables']['spare_parts']['Insert'];
type PartUpdate = Database['public']['Tables']['spare_parts']['Update'];

export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
}

export class OrderRemoteDataSource {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: OrderFilters): Promise<OrderRow[]> {
    let query = this.supabase
      .from('service_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
    if (filters?.startDate) query = query.gte('created_at', filters.startDate);
    if (filters?.endDate) query = query.lte('created_at', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<OrderRow | null> {
    const { data, error } = await this.supabase
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(order: OrderInsert): Promise<OrderRow> {
    const { data, error } = await this.supabase
      .from('service_orders')
      .insert(order as any)
      .select()
      .single();

    if (error) throw error;
    return data as OrderRow;
  }

  async update(id: string, updates: OrderUpdate): Promise<OrderRow> {
    const { data, error } = await this.supabase
      .from('service_orders')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as OrderRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('service_orders').delete().eq('id', id);
    if (error) throw error;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderRow> {
    const updates: OrderUpdate = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    return this.update(id, updates);
  }

  // Labor items
  async getLaborItems(orderId: string): Promise<LaborRow[]> {
    const { data, error } = await this.supabase
      .from('labor_items')
      .select('*')
      .eq('service_order_id', orderId);

    if (error) throw error;
    return data || [];
  }

  async addLaborItem(item: LaborInsert): Promise<LaborRow> {
    const { data, error } = await this.supabase
      .from('labor_items')
      .insert(item as any)
      .select()
      .single();

    if (error) throw error;
    return data as LaborRow;
  }

  async updateLaborItem(id: string, updates: LaborUpdate): Promise<LaborRow> {
    const { data, error } = await this.supabase
      .from('labor_items')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as LaborRow;
  }

  async deleteLaborItem(id: string): Promise<void> {
    const { error } = await this.supabase.from('labor_items').delete().eq('id', id);
    if (error) throw error;
  }

  // Spare parts
  async getSpareParts(orderId: string): Promise<PartRow[]> {
    const { data, error } = await this.supabase
      .from('spare_parts')
      .select('*')
      .eq('service_order_id', orderId);

    if (error) throw error;
    return data || [];
  }

  async addSparePart(part: PartInsert): Promise<PartRow> {
    const { data, error } = await this.supabase
      .from('spare_parts')
      .insert(part as any)
      .select()
      .single();

    if (error) throw error;
    return data as PartRow;
  }

  async updateSparePart(id: string, updates: PartUpdate): Promise<PartRow> {
    const { data, error } = await this.supabase
      .from('spare_parts')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PartRow;
  }

  async deleteSparePart(id: string): Promise<void> {
    const { error } = await this.supabase.from('spare_parts').delete().eq('id', id);
    if (error) throw error;
  }

  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    const { data, error } = await this.supabase.from('service_orders').select('status');

    if (error) throw error;

    const orders = data as Array<{ status: string }> || [];

    const stats = {
      total: orders.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      switch (order.status) {
        case 'pending': stats.pending++; break;
        case 'in_progress': stats.inProgress++; break;
        case 'completed': stats.completed++; break;
        case 'cancelled': stats.cancelled++; break;
      }
    });

    return stats;
  }

  async getPaginated(page: number, limit: number, filters?: OrderFilters): Promise<{
    data: OrderRow[];
    count: number;
  }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from('service_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  }
}
