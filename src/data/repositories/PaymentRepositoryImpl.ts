import { IPaymentRepository, PaymentFilters } from '@domain/repositories/IPaymentRepository';
import { Payment, CreatePaymentInput, UpdatePaymentInput } from '@domain/entities/Payment';
import { PaymentRemoteDataSource } from '@data/datasources/remote/PaymentRemoteDataSource';
import { PaymentMapper } from '@data/models/mappers';
import { PaymentMethod } from '@core/constants';

export class PaymentRepositoryImpl implements IPaymentRepository {
  constructor(private dataSource: PaymentRemoteDataSource) {}

  private convertFilters(filters?: PaymentFilters) {
    if (!filters) return undefined;
    return {
      serviceOrderId: filters.serviceOrderId,
      paymentType: filters.paymentType,
      paymentMethod: filters.paymentMethod,
      startDate: filters.startDate?.toISOString().split('T')[0],
      endDate: filters.endDate?.toISOString().split('T')[0],
    };
  }

  async getAll(filters?: PaymentFilters): Promise<Payment[]> {
    const rows = await this.dataSource.getAll(this.convertFilters(filters));
    return rows.map(PaymentMapper.toDomain);
  }

  async getById(id: string): Promise<Payment | null> {
    const row = await this.dataSource.getById(id);
    return row ? PaymentMapper.toDomain(row) : null;
  }

  async create(data: CreatePaymentInput): Promise<Payment> {
    const insert = PaymentMapper.toInsert(data);
    const row = await this.dataSource.create(insert);
    return PaymentMapper.toDomain(row);
  }

  async update(id: string, data: UpdatePaymentInput): Promise<Payment> {
    const update = PaymentMapper.toUpdate(data);
    const row = await this.dataSource.update(id, update);
    return PaymentMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(id);
  }

  async getByServiceOrderId(serviceOrderId: string): Promise<Payment[]> {
    const rows = await this.dataSource.getByServiceOrderId(serviceOrderId);
    return rows.map(PaymentMapper.toDomain);
  }

  async getTotalByServiceOrder(serviceOrderId: string): Promise<number> {
    return this.dataSource.getTotalByServiceOrder(serviceOrderId);
  }

  async getTotalAdvancesByServiceOrder(serviceOrderId: string): Promise<number> {
    const payments = await this.getByServiceOrderId(serviceOrderId);
    return payments
      .filter((p) => p.paymentType === 'advance')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  async getPaymentStats(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    totalAdvances: number;
    totalFinalPayments: number;
    paymentsByMethod: Record<PaymentMethod, number>;
  }> {
    const start = startDate?.toISOString().split('T')[0];
    const end = endDate?.toISOString().split('T')[0];
    return this.dataSource.getPaymentStats(start, end);
  }
}
