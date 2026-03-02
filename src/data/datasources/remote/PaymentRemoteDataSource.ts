import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './SupabaseClient';
import { PaymentType, PaymentMethod } from '@core/constants';

type PaymentRow = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export interface PaymentFilters {
  serviceOrderId?: string;
  paymentType?: PaymentType;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export class PaymentRemoteDataSource {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: PaymentFilters): Promise<PaymentRow[]> {
    let query = this.supabase.from('payments').select('*').order('date', { ascending: false });

    if (filters?.serviceOrderId) query = query.eq('service_order_id', filters.serviceOrderId);
    if (filters?.paymentType) query = query.eq('payment_type', filters.paymentType);
    if (filters?.paymentMethod) query = query.eq('payment_method', filters.paymentMethod);
    if (filters?.startDate) query = query.gte('date', filters.startDate);
    if (filters?.endDate) query = query.lte('date', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<PaymentRow | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(payment: PaymentInsert): Promise<PaymentRow> {
    const { data, error } = await this.supabase
      .from('payments')
      .insert(payment as any)
      .select()
      .single();

    if (error) throw error;
    return data as PaymentRow;
  }

  async update(id: string, updates: PaymentUpdate): Promise<PaymentRow> {
    const { data, error } = await this.supabase
      .from('payments')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PaymentRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  }

  async getByServiceOrderId(serviceOrderId: string): Promise<PaymentRow[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('service_order_id', serviceOrderId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTotalByServiceOrder(serviceOrderId: string): Promise<number> {
    const payments = await this.getByServiceOrderId(serviceOrderId);
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }

  async getPaymentStats(startDate?: string, endDate?: string): Promise<{
    totalRevenue: number;
    totalAdvances: number;
    totalFinalPayments: number;
    paymentsByMethod: Record<PaymentMethod, number>;
  }> {
    let query = this.supabase.from('payments').select('*');
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;

    const payments = data as PaymentRow[] || [];

    const stats = {
      totalRevenue: 0,
      totalAdvances: 0,
      totalFinalPayments: 0,
      paymentsByMethod: { cash: 0, card: 0, upi: 0 } as Record<PaymentMethod, number>,
    };

    payments.forEach((payment) => {
      stats.totalRevenue += payment.amount;
      if (payment.payment_type === 'advance') {
        stats.totalAdvances += payment.amount;
      } else {
        stats.totalFinalPayments += payment.amount;
      }
      stats.paymentsByMethod[payment.payment_method as PaymentMethod] += payment.amount;
    });

    return stats;
  }
}
