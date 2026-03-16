// Service order model
import { OrderStatus } from '@core/constants';
import { LaborItem } from './LaborItem';
import { SparePart } from './SparePart';
import { Payment } from './Payment';
import { Photo } from './Photo';

export interface ServiceOrder {
  id: string;
  userId: string;
  vehicleId: string;
  customerId: string;
  status: OrderStatus;
  kmReading: number | null;
  description: string | null;
  notes: string | null;
  createdAt: Date;
  completedAt: Date | null;
  // Denormalized fields for display without joins
  customerName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
  // Computed totals (stored on document, recalculated on item changes)
  totalLabor: number;
  totalParts: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
  // Nested items (populated from subcollections)
  laborItems?: LaborItem[];
  spareParts?: SparePart[];
  payments?: Payment[];
  photos?: Photo[];
}

export interface ServiceOrderWithDetails extends ServiceOrder {
  laborItems: LaborItem[];
  spareParts: SparePart[];
  payments: Payment[];
  photos: Photo[];
}

export interface CreateServiceOrderInput {
  vehicleId: string;
  customerId: string;
  kmReading?: number;
  description?: string;
  notes?: string;
  // Denormalized fields
  customerName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
}

export interface UpdateServiceOrderInput {
  status?: OrderStatus;
  kmReading?: number;
  description?: string;
  notes?: string;
}

export function calculateOrderTotals(
  laborItems: LaborItem[],
  spareParts: SparePart[],
  payments: Payment[]
): {
  totalLabor: number;
  totalParts: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
} {
  const totalLabor = laborItems.reduce((sum, item) => sum + item.total, 0);
  const totalParts = spareParts.reduce((sum, part) => sum + part.total, 0);
  const totalAmount = totalLabor + totalParts;
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balanceDue = totalAmount - totalPaid;

  return {
    totalLabor,
    totalParts,
    totalAmount,
    totalPaid,
    balanceDue,
  };
}

export function canEditOrder(order: ServiceOrder): boolean {
  return order.status !== 'completed' && order.status !== 'cancelled';
}

export function canCompleteOrder(order: ServiceOrder): boolean {
  return order.status === 'in_progress';
}

export function canCancelOrder(order: ServiceOrder): boolean {
  return order.status !== 'completed' && order.status !== 'cancelled';
}

export function createEmptyOrderTotals() {
  return {
    totalLabor: 0,
    totalParts: 0,
    totalAmount: 0,
    totalPaid: 0,
    balanceDue: 0,
  };
}
