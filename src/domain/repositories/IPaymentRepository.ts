import { Payment, CreatePaymentInput, UpdatePaymentInput } from '@domain/entities/Payment';
import { PaymentType, PaymentMethod } from '@core/constants';

export interface PaymentFilters {
  serviceOrderId?: string;
  paymentType?: PaymentType;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
}

export interface IPaymentRepository {
  // CRUD operations
  getAll(filters?: PaymentFilters): Promise<Payment[]>;
  getById(id: string): Promise<Payment | null>;
  create(data: CreatePaymentInput): Promise<Payment>;
  update(id: string, data: UpdatePaymentInput): Promise<Payment>;
  delete(id: string): Promise<void>;

  // Relationships
  getByServiceOrderId(serviceOrderId: string): Promise<Payment[]>;

  // Calculations
  getTotalByServiceOrder(serviceOrderId: string): Promise<number>;
  getTotalAdvancesByServiceOrder(serviceOrderId: string): Promise<number>;

  // Statistics
  getPaymentStats(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    totalAdvances: number;
    totalFinalPayments: number;
    paymentsByMethod: Record<PaymentMethod, number>;
  }>;
}
