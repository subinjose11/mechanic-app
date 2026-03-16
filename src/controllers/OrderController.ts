// Order controller - handles orders and all subcollection operations
import { BaseController } from './base/BaseController';
import { orderStore } from '@stores/OrderStore';
import { customerStore } from '@stores/CustomerStore';
import { vehicleStore } from '@stores/VehicleStore';
import { authStore } from '@stores/AuthStore';
import {
  ServiceOrder,
  ServiceOrderWithDetails,
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
} from '@models/ServiceOrder';
import { CreateLaborItemInput, LaborItem } from '@models/LaborItem';
import { CreateSparePartInput, SparePart } from '@models/SparePart';
import { CreatePaymentInput, Payment } from '@models/Payment';
import { CreatePhotoInput, Photo } from '@models/Photo';
import { OrderStatus, PhotoType, PaymentMethod } from '@core/constants';

class OrderController extends BaseController<ServiceOrder> {
  private static instance: OrderController;

  private constructor() {
    super('order');
  }

  static getInstance(): OrderController {
    if (!OrderController.instance) {
      OrderController.instance = new OrderController();
    }
    return OrderController.instance;
  }

  // Get all orders
  get orders(): ServiceOrder[] {
    return orderStore.orders;
  }

  // Get current order with details
  get currentOrder(): ServiceOrderWithDetails | null {
    return orderStore.currentOrder;
  }

  // Get order counts by status
  get pendingOrders(): ServiceOrder[] {
    return orderStore.pendingOrders;
  }

  get inProgressOrders(): ServiceOrder[] {
    return orderStore.inProgressOrders;
  }

  get completedOrders(): ServiceOrder[] {
    return orderStore.completedOrders;
  }

  get activeOrders(): ServiceOrder[] {
    return orderStore.activeOrders;
  }

  get orderCount(): number {
    return orderStore.orderCount;
  }

  // Check if loading
  get isLoading(): boolean {
    return orderStore.isLoading;
  }

  // Get error
  get error(): string | null {
    return orderStore.error;
  }

  // Get order by ID
  getById(id: string): ServiceOrder | undefined {
    return orderStore.getById(id);
  }

  // Get orders by status
  getByStatus(status: OrderStatus): ServiceOrder[] {
    return orderStore.getByStatus(status);
  }

  // Get orders by customer
  getByCustomerId(customerId: string): ServiceOrder[] {
    return orderStore.getByCustomerId(customerId);
  }

  // Get orders by vehicle
  getByVehicleId(vehicleId: string): ServiceOrder[] {
    return orderStore.getByVehicleId(vehicleId);
  }

  // Fetch all orders
  async fetchAll(userId?: string): Promise<void> {
    const uid = userId || authStore.userId;
    if (!uid) throw new Error('User not authenticated');

    await this.withLoading(
      () => orderStore.fetchAll(uid),
      'Loading orders...'
    );
  }

  // Fetch order with all details
  async fetchWithDetails(id: string): Promise<ServiceOrderWithDetails | null> {
    return this.withLoading(
      () => orderStore.fetchWithDetails(id),
      'Loading order details...'
    );
  }

  // Create order with all items in one batch (for new comprehensive flow)
  async createWithItems(input: {
    vehicleId: string;
    customerId: string;
    description?: string;
    kmReading?: number;
    notes?: string;
    laborItems: Array<{ description: string; hours: number; ratePerHour: number }>;
    spareParts: Array<{ partName: string; quantity: number; unitPrice: number; partNumber?: string }>;
    advancePayment?: { amount: number; paymentMethod: PaymentMethod; notes?: string };
  }): Promise<ServiceOrder> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    // Get denormalized data
    const customer = customerStore.getById(input.customerId);
    const vehicle = vehicleStore.getById(input.vehicleId);

    return this.withLoading(
      () => orderStore.createWithItems(userId, {
        ...input,
        customerName: customer?.name,
        vehicleMake: vehicle?.make,
        vehicleModel: vehicle?.model,
        vehicleLicensePlate: vehicle?.licensePlate,
      }),
      'Creating order...',
      'Order created!'
    );
  }

  // Create order
  async create(input: {
    vehicleId: string;
    customerId: string;
    kmReading?: number;
    description?: string;
    notes?: string;
  }): Promise<ServiceOrder> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    // Get denormalized data
    const customer = customerStore.getById(input.customerId);
    const vehicle = vehicleStore.getById(input.vehicleId);

    const orderInput: CreateServiceOrderInput = {
      ...input,
      customerName: customer?.name,
      vehicleMake: vehicle?.make,
      vehicleModel: vehicle?.model,
      vehicleLicensePlate: vehicle?.licensePlate,
    };

    return this.withLoading(
      () => orderStore.create(userId, orderInput),
      'Creating order...',
      'Order created!'
    );
  }

  // Update order
  async update(id: string, input: UpdateServiceOrderInput): Promise<void> {
    await this.withLoading(
      () => orderStore.update(id, input),
      'Updating order...',
      'Order updated!'
    );
  }

  // Update order status
  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const statusLabels: Record<OrderStatus, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    await this.withLoading(
      () => orderStore.update(id, { status }),
      'Updating status...',
      `Order marked as ${statusLabels[status]}`
    );
  }

  // Start order (change to in_progress)
  async startOrder(id: string): Promise<void> {
    await this.updateStatus(id, 'in_progress');
  }

  // Complete order
  async completeOrder(id: string): Promise<void> {
    await this.updateStatus(id, 'completed');
  }

  // Cancel order
  async cancelOrder(id: string): Promise<void> {
    await this.updateStatus(id, 'cancelled');
  }

  // Delete order
  async delete(id: string): Promise<void> {
    await this.withLoading(
      () => orderStore.delete(id),
      'Deleting order...',
      'Order deleted!'
    );
  }

  // === Labor Items ===
  async addLaborItem(orderId: string, input: Omit<CreateLaborItemInput, 'serviceOrderId'>): Promise<LaborItem> {
    return this.withLoading(
      () => orderStore.addLaborItem(orderId, input),
      'Adding labor...',
      'Labor added!'
    );
  }

  async updateLaborItem(orderId: string, itemId: string, updates: Partial<LaborItem>): Promise<void> {
    await this.withLoading(
      () => orderStore.updateLaborItem(orderId, itemId, updates),
      'Updating labor...',
      'Labor updated!'
    );
  }

  async deleteLaborItem(orderId: string, itemId: string): Promise<void> {
    await this.withLoading(
      () => orderStore.deleteLaborItem(orderId, itemId),
      'Removing labor...',
      'Labor removed!'
    );
  }

  // === Spare Parts ===
  async addSparePart(orderId: string, input: Omit<CreateSparePartInput, 'serviceOrderId'>): Promise<SparePart> {
    return this.withLoading(
      () => orderStore.addSparePart(orderId, input),
      'Adding part...',
      'Part added!'
    );
  }

  async updateSparePart(orderId: string, partId: string, updates: Partial<SparePart>): Promise<void> {
    await this.withLoading(
      () => orderStore.updateSparePart(orderId, partId, updates),
      'Updating part...',
      'Part updated!'
    );
  }

  async deleteSparePart(orderId: string, partId: string): Promise<void> {
    await this.withLoading(
      () => orderStore.deleteSparePart(orderId, partId),
      'Removing part...',
      'Part removed!'
    );
  }

  // === Payments ===
  async addPayment(orderId: string, input: Omit<CreatePaymentInput, 'serviceOrderId'>): Promise<Payment> {
    return this.withLoading(
      () => orderStore.addPayment(orderId, input),
      'Recording payment...',
      'Payment recorded!'
    );
  }

  async deletePayment(orderId: string, paymentId: string): Promise<void> {
    await this.withLoading(
      () => orderStore.deletePayment(orderId, paymentId),
      'Removing payment...',
      'Payment removed!'
    );
  }

  // === Photos ===
  async addPhoto(
    orderId: string,
    photoType: PhotoType,
    localUri: string,
    description?: string
  ): Promise<Photo> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    return this.withLoading(
      () => orderStore.addPhoto(userId, orderId, { photoType, description }, localUri),
      'Uploading photo...',
      'Photo uploaded!'
    );
  }

  async deletePhoto(orderId: string, photoId: string): Promise<void> {
    await this.withLoading(
      () => orderStore.deletePhoto(orderId, photoId),
      'Deleting photo...',
      'Photo deleted!'
    );
  }

  // Set current order
  setCurrentOrder(order: ServiceOrderWithDetails | null): void {
    orderStore.setCurrentOrder(order);
  }

  // Clear error
  clearError(): void {
    orderStore.clearError();
  }

  // Subscribe to real-time updates
  subscribe(): void {
    const userId = authStore.userId;
    if (userId) {
      orderStore.subscribeToOrders(userId);
    }
  }

  // Unsubscribe from updates
  unsubscribe(): void {
    orderStore.dispose();
  }
}

// Export singleton instance
export const orderController = OrderController.getInstance();
export { OrderController };
