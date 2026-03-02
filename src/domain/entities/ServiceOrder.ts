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
  kmReading: number | null; // Odometer reading when vehicle came in
  description: string | null;
  notes: string | null;
  createdAt: Date;
  completedAt: Date | null;
  // Nested items (populated from separate queries)
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
  // Calculated fields
  totalLabor: number;
  totalParts: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
}

export interface CreateServiceOrderInput {
  vehicleId: string;
  customerId: string;
  kmReading?: number;
  description?: string;
  notes?: string;
}

export interface UpdateServiceOrderInput {
  status?: OrderStatus;
  kmReading?: number;
  description?: string;
  notes?: string;
}

export function calculateOrderTotals(order: ServiceOrder): {
  totalLabor: number;
  totalParts: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
} {
  const laborItems = order.laborItems || [];
  const spareParts = order.spareParts || [];
  const payments = order.payments || [];

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
