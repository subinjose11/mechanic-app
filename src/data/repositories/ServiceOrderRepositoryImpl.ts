import { IServiceOrderRepository, OrderFilters } from '@domain/repositories/IServiceOrderRepository';
import {
  ServiceOrder,
  ServiceOrderWithDetails,
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
  calculateOrderTotals,
} from '@domain/entities/ServiceOrder';
import { LaborItem, CreateLaborItemInput, UpdateLaborItemInput } from '@domain/entities/LaborItem';
import { SparePart, CreateSparePartInput, UpdateSparePartInput } from '@domain/entities/SparePart';
import { OrderRemoteDataSource } from '@data/datasources/remote/OrderRemoteDataSource';
import { PaymentRemoteDataSource } from '@data/datasources/remote/PaymentRemoteDataSource';
import { PhotoRemoteDataSource } from '@data/datasources/remote/PhotoRemoteDataSource';
import {
  ServiceOrderMapper,
  LaborItemMapper,
  SparePartMapper,
  PaymentMapper,
  PhotoMapper,
} from '@data/models/mappers';
import { supabase } from '@data/datasources/remote/SupabaseClient';
import { OrderStatus } from '@core/constants';

export class ServiceOrderRepositoryImpl implements IServiceOrderRepository {
  constructor(
    private orderDataSource: OrderRemoteDataSource,
    private paymentDataSource: PaymentRemoteDataSource,
    private photoDataSource: PhotoRemoteDataSource
  ) {}

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  private convertFilters(filters?: OrderFilters) {
    if (!filters) return undefined;
    return {
      status: filters.status,
      customerId: filters.customerId,
      vehicleId: filters.vehicleId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    };
  }

  async getAll(filters?: OrderFilters): Promise<ServiceOrder[]> {
    const rows = await this.orderDataSource.getAll(this.convertFilters(filters));
    return rows.map(ServiceOrderMapper.toDomain);
  }

  async getById(id: string): Promise<ServiceOrder | null> {
    const row = await this.orderDataSource.getById(id);
    return row ? ServiceOrderMapper.toDomain(row) : null;
  }

  async getByIdWithDetails(id: string): Promise<ServiceOrderWithDetails | null> {
    const row = await this.orderDataSource.getById(id);
    if (!row) return null;

    const order = ServiceOrderMapper.toDomain(row);
    const [laborRows, partRows, paymentRows, photoRows] = await Promise.all([
      this.orderDataSource.getLaborItems(id),
      this.orderDataSource.getSpareParts(id),
      this.paymentDataSource.getByServiceOrderId(id),
      this.photoDataSource.getByServiceOrderId(id),
    ]);

    const laborItems = laborRows.map(LaborItemMapper.toDomain);
    const spareParts = partRows.map(SparePartMapper.toDomain);
    const payments = paymentRows.map(PaymentMapper.toDomain);
    const photos = photoRows.map(PhotoMapper.toDomain);

    const orderWithItems = { ...order, laborItems, spareParts, payments, photos };
    const totals = calculateOrderTotals(orderWithItems);

    return {
      ...orderWithItems,
      ...totals,
    };
  }

  async create(data: CreateServiceOrderInput): Promise<ServiceOrder> {
    const userId = await this.getCurrentUserId();
    const insert = ServiceOrderMapper.toInsert(data, userId);
    const row = await this.orderDataSource.create(insert);
    return ServiceOrderMapper.toDomain(row);
  }

  async update(id: string, data: UpdateServiceOrderInput): Promise<ServiceOrder> {
    const update = ServiceOrderMapper.toUpdate(data);
    const row = await this.orderDataSource.update(id, update);
    return ServiceOrderMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.orderDataSource.delete(id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<ServiceOrder> {
    const row = await this.orderDataSource.updateStatus(id, status);
    return ServiceOrderMapper.toDomain(row);
  }

  async completeOrder(id: string): Promise<ServiceOrder> {
    return this.updateStatus(id, 'completed');
  }

  async cancelOrder(id: string): Promise<ServiceOrder> {
    return this.updateStatus(id, 'cancelled');
  }

  // Labor items
  async addLaborItem(data: CreateLaborItemInput): Promise<LaborItem> {
    const insert = LaborItemMapper.toInsert(data);
    const row = await this.orderDataSource.addLaborItem(insert);
    return LaborItemMapper.toDomain(row);
  }

  async updateLaborItem(id: string, data: UpdateLaborItemInput): Promise<LaborItem> {
    // Get current item to calculate total properly
    const laborItems = await this.orderDataSource.getLaborItems(id);
    const current = laborItems.find((item) => item.id === id);
    const currentDomain = current ? LaborItemMapper.toDomain(current) : undefined;

    const update = LaborItemMapper.toUpdate(data, currentDomain);
    const row = await this.orderDataSource.updateLaborItem(id, update);
    return LaborItemMapper.toDomain(row);
  }

  async deleteLaborItem(id: string): Promise<void> {
    await this.orderDataSource.deleteLaborItem(id);
  }

  async getLaborItems(orderId: string): Promise<LaborItem[]> {
    const rows = await this.orderDataSource.getLaborItems(orderId);
    return rows.map(LaborItemMapper.toDomain);
  }

  // Spare parts
  async addSparePart(data: CreateSparePartInput): Promise<SparePart> {
    const insert = SparePartMapper.toInsert(data);
    const row = await this.orderDataSource.addSparePart(insert);
    return SparePartMapper.toDomain(row);
  }

  async updateSparePart(id: string, data: UpdateSparePartInput): Promise<SparePart> {
    // Get current item to calculate total properly
    const parts = await this.orderDataSource.getSpareParts(id);
    const current = parts.find((part) => part.id === id);
    const currentDomain = current ? SparePartMapper.toDomain(current) : undefined;

    const update = SparePartMapper.toUpdate(data, currentDomain);
    const row = await this.orderDataSource.updateSparePart(id, update);
    return SparePartMapper.toDomain(row);
  }

  async deleteSparePart(id: string): Promise<void> {
    await this.orderDataSource.deleteSparePart(id);
  }

  async getSpareParts(orderId: string): Promise<SparePart[]> {
    const rows = await this.orderDataSource.getSpareParts(orderId);
    return rows.map(SparePartMapper.toDomain);
  }

  // Relationships
  async getByVehicleId(vehicleId: string): Promise<ServiceOrder[]> {
    const rows = await this.orderDataSource.getAll({ vehicleId });
    return rows.map(ServiceOrderMapper.toDomain);
  }

  async getByCustomerId(customerId: string): Promise<ServiceOrder[]> {
    const rows = await this.orderDataSource.getAll({ customerId });
    return rows.map(ServiceOrderMapper.toDomain);
  }

  // Search
  async search(query: string): Promise<ServiceOrder[]> {
    // For now, search by filtering all orders (could be optimized with full-text search)
    const rows = await this.orderDataSource.getAll();
    const lowerQuery = query.toLowerCase();
    return rows
      .filter((row) =>
        row.description?.toLowerCase().includes(lowerQuery) ||
        row.notes?.toLowerCase().includes(lowerQuery)
      )
      .map(ServiceOrderMapper.toDomain);
  }

  // Pagination
  async getPaginated(page: number, limit: number, filters?: OrderFilters): Promise<{
    data: ServiceOrder[];
    total: number;
    hasMore: boolean;
  }> {
    const result = await this.orderDataSource.getPaginated(page, limit, this.convertFilters(filters));
    return {
      data: result.data.map(ServiceOrderMapper.toDomain),
      total: result.count,
      hasMore: page * limit < result.count,
    };
  }

  // Statistics
  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    return this.orderDataSource.getOrderStats();
  }
}
