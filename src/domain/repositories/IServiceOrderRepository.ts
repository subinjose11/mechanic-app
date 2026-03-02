import {
  ServiceOrder,
  ServiceOrderWithDetails,
  CreateServiceOrderInput,
  UpdateServiceOrderInput
} from '@domain/entities/ServiceOrder';
import { CreateLaborItemInput, UpdateLaborItemInput, LaborItem } from '@domain/entities/LaborItem';
import { CreateSparePartInput, UpdateSparePartInput, SparePart } from '@domain/entities/SparePart';
import { OrderStatus } from '@core/constants';

export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  vehicleId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IServiceOrderRepository {
  // CRUD operations
  getAll(filters?: OrderFilters): Promise<ServiceOrder[]>;
  getById(id: string): Promise<ServiceOrder | null>;
  getByIdWithDetails(id: string): Promise<ServiceOrderWithDetails | null>;
  create(data: CreateServiceOrderInput): Promise<ServiceOrder>;
  update(id: string, data: UpdateServiceOrderInput): Promise<ServiceOrder>;
  delete(id: string): Promise<void>;

  // Status management
  updateStatus(id: string, status: OrderStatus): Promise<ServiceOrder>;
  completeOrder(id: string): Promise<ServiceOrder>;
  cancelOrder(id: string): Promise<ServiceOrder>;

  // Labor items
  addLaborItem(data: CreateLaborItemInput): Promise<LaborItem>;
  updateLaborItem(id: string, data: UpdateLaborItemInput): Promise<LaborItem>;
  deleteLaborItem(id: string): Promise<void>;
  getLaborItems(orderId: string): Promise<LaborItem[]>;

  // Spare parts
  addSparePart(data: CreateSparePartInput): Promise<SparePart>;
  updateSparePart(id: string, data: UpdateSparePartInput): Promise<SparePart>;
  deleteSparePart(id: string): Promise<void>;
  getSpareParts(orderId: string): Promise<SparePart[]>;

  // Relationships
  getByVehicleId(vehicleId: string): Promise<ServiceOrder[]>;
  getByCustomerId(customerId: string): Promise<ServiceOrder[]>;

  // Search
  search(query: string): Promise<ServiceOrder[]>;

  // Pagination
  getPaginated(page: number, limit: number, filters?: OrderFilters): Promise<{
    data: ServiceOrder[];
    total: number;
    hasMore: boolean;
  }>;

  // Statistics
  getOrderStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }>;
}
