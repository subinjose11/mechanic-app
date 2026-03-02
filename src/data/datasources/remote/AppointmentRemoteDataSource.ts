import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './SupabaseClient';
import { AppointmentStatus, TIME_SLOTS } from '@core/constants';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export interface AppointmentFilters {
  status?: AppointmentStatus;
  customerId?: string;
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
}

export class AppointmentRemoteDataSource {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: AppointmentFilters): Promise<AppointmentRow[]> {
    let query = this.supabase
      .from('appointments')
      .select('*')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
    if (filters?.startDate) query = query.gte('scheduled_date', filters.startDate);
    if (filters?.endDate) query = query.lte('scheduled_date', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<AppointmentRow | null> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(appointment: AppointmentInsert): Promise<AppointmentRow> {
    const { data, error } = await this.supabase
      .from('appointments')
      .insert(appointment as any)
      .select()
      .single();

    if (error) throw error;
    return data as AppointmentRow;
  }

  async update(id: string, updates: AppointmentUpdate): Promise<AppointmentRow> {
    const { data, error } = await this.supabase
      .from('appointments')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AppointmentRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<AppointmentRow> {
    return this.update(id, { status });
  }

  async getUpcoming(): Promise<AppointmentRow[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .gte('scheduled_date', today)
      .neq('status', 'cancelled')
      .neq('status', 'completed')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getByDate(date: string): Promise<AppointmentRow[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('scheduled_date', date)
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAppointmentsForMonth(year: number, month: number): Promise<AppointmentRow[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .gte('scheduled_date', startDate)
      .lt('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAvailableTimeSlots(date: string): Promise<string[]> {
    const appointments = await this.getByDate(date);
    const bookedTimes = new Set(appointments.map((a) => a.scheduled_time));
    return TIME_SLOTS.filter((time) => !bookedTimes.has(time));
  }

  async getAppointmentStats(): Promise<{
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    todayCount: number;
    weekCount: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await this.supabase.from('appointments').select('status, scheduled_date');
    if (error) throw error;

    const appointments = data as Array<{ status: string; scheduled_date: string }> || [];

    const stats = {
      total: appointments.length,
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      todayCount: 0,
      weekCount: 0,
    };

    appointments.forEach((apt) => {
      switch (apt.status) {
        case 'scheduled': stats.scheduled++; break;
        case 'confirmed': stats.confirmed++; break;
        case 'completed': stats.completed++; break;
        case 'cancelled': stats.cancelled++; break;
      }
      if (apt.scheduled_date === today) stats.todayCount++;
      if (apt.scheduled_date >= today && apt.scheduled_date <= weekFromNow) stats.weekCount++;
    });

    return stats;
  }
}
