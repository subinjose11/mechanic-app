import { Payment, CreatePaymentInput } from '@domain/entities/Payment';
import { Database } from '@data/datasources/remote/SupabaseClient';
import { PaymentType, PaymentMethod } from '@core/constants';

type PaymentRow = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export class PaymentMapper {
  static toDomain(row: PaymentRow): Payment {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      amount: row.amount,
      paymentType: row.payment_type as PaymentType,
      paymentMethod: row.payment_method as PaymentMethod,
      date: new Date(row.date),
      notes: row.notes,
    };
  }

  static toInsert(input: CreatePaymentInput): PaymentInsert {
    return {
      service_order_id: input.serviceOrderId,
      amount: input.amount,
      payment_type: input.paymentType,
      payment_method: input.paymentMethod,
      date: (input.date || new Date()).toISOString().split('T')[0],
      notes: input.notes || null,
    };
  }

  static toUpdate(input: Partial<CreatePaymentInput>): PaymentUpdate {
    const update: PaymentUpdate = {};
    if (input.amount !== undefined) update.amount = input.amount;
    if (input.paymentType !== undefined) update.payment_type = input.paymentType;
    if (input.paymentMethod !== undefined) update.payment_method = input.paymentMethod;
    if (input.notes !== undefined) update.notes = input.notes || null;
    return update;
  }
}
