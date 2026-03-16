// Order state store - handles orders and all subcollections
import { makeAutoObservable, runInAction } from 'mobx';
import {
  ServiceOrder,
  ServiceOrderWithDetails,
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
  calculateOrderTotals,
  createEmptyOrderTotals,
} from '@models/ServiceOrder';
import { LaborItem, CreateLaborItemInput, createLaborItemWithTotal } from '@models/LaborItem';
import { SparePart, CreateSparePartInput, createSparePartWithTotal } from '@models/SparePart';
import { Payment, CreatePaymentInput } from '@models/Payment';
import { PaymentMethod } from '@core/constants';
import { Photo, CreatePhotoInput } from '@models/Photo';
import { OrderStatus } from '@core/constants';
import { firestoreService, FilterCondition } from '@firebaseServices/firestore/FirestoreService';
import { COLLECTIONS, getLaborItemsPath, getSparePartsPath, getPaymentsPath, getPhotosPath } from '@firebaseServices/firestore/collections';
import { orderConverter, laborItemConverter, sparePartConverter, paymentConverter, photoConverter } from '@firebaseServices/firestore/converters';
import { storageService } from '@firebaseServices/storage/StorageService';

class OrderStore {
  orders: ServiceOrder[] = [];
  currentOrder: ServiceOrderWithDetails | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private unsubscribe: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed properties
  get orderCount(): number {
    return this.orders.length;
  }

  get pendingOrders(): ServiceOrder[] {
    return this.orders.filter((o) => o.status === 'pending');
  }

  get inProgressOrders(): ServiceOrder[] {
    return this.orders.filter((o) => o.status === 'in_progress');
  }

  get completedOrders(): ServiceOrder[] {
    return this.orders.filter((o) => o.status === 'completed');
  }

  get activeOrders(): ServiceOrder[] {
    return this.orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  }

  // Get order by ID from local state
  getById(id: string): ServiceOrder | undefined {
    return this.orders.find((o) => o.id === id);
  }

  // Filter orders by status
  getByStatus(status: OrderStatus): ServiceOrder[] {
    return this.orders.filter((o) => o.status === status);
  }

  // Get orders by customer
  getByCustomerId(customerId: string): ServiceOrder[] {
    return this.orders.filter((o) => o.customerId === customerId);
  }

  // Get orders by vehicle
  getByVehicleId(vehicleId: string): ServiceOrder[] {
    return this.orders.filter((o) => o.vehicleId === vehicleId);
  }

  // Subscribe to orders for a user (real-time updates)
  subscribeToOrders(userId: string): void {
    this.isLoading = true;

    const filters: FilterCondition[] = [
      { field: 'userId', operator: '==', value: userId },
    ];

    this.unsubscribe = firestoreService.subscribeToCollection<ServiceOrder>(
      COLLECTIONS.ORDERS,
      (orders) => {
        runInAction(() => {
          this.orders = orders;
          this.isLoading = false;
        });
      },
      filters,
      { orderByField: 'createdAt', orderDirection: 'desc' },
      orderConverter
    );
  }

  // Fetch all orders (one-time)
  async fetchAll(userId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: FilterCondition[] = [
        { field: 'userId', operator: '==', value: userId },
      ];

      const orders = await firestoreService.getAll<ServiceOrder>(
        COLLECTIONS.ORDERS,
        filters,
        { orderByField: 'createdAt', orderDirection: 'desc' },
        orderConverter
      );

      runInAction(() => {
        this.orders = orders;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch orders';
        this.isLoading = false;
      });
    }
  }

  // Fetch single order with all details
  async fetchWithDetails(id: string): Promise<ServiceOrderWithDetails | null> {
    this.isLoading = true;
    this.error = null;

    try {
      // Fetch order
      const order = await firestoreService.getById<ServiceOrder>(
        COLLECTIONS.ORDERS,
        id,
        orderConverter
      );

      if (!order) {
        runInAction(() => {
          this.currentOrder = null;
          this.isLoading = false;
        });
        return null;
      }

      // Fetch all subcollections in parallel
      const [laborItems, spareParts, payments, photos] = await Promise.all([
        firestoreService.getAll<LaborItem>(getLaborItemsPath(id), [], {}, laborItemConverter),
        firestoreService.getAll<SparePart>(getSparePartsPath(id), [], {}, sparePartConverter),
        firestoreService.getAll<Payment>(getPaymentsPath(id), [], {}, paymentConverter),
        firestoreService.getAll<Photo>(getPhotosPath(id), [], {}, photoConverter),
      ]);

      const orderWithDetails: ServiceOrderWithDetails = {
        ...order,
        laborItems,
        spareParts,
        payments,
        photos,
      };

      runInAction(() => {
        this.currentOrder = orderWithDetails;
        this.isLoading = false;
      });

      return orderWithDetails;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch order details';
        this.isLoading = false;
      });
      return null;
    }
  }

  // Create order with all items in one batch (for new order flow)
  async createWithItems(userId: string, input: {
    vehicleId: string;
    customerId: string;
    description?: string;
    kmReading?: number;
    notes?: string;
    customerName?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleLicensePlate?: string;
    laborItems: Array<{ description: string; hours: number; ratePerHour: number }>;
    spareParts: Array<{ partName: string; quantity: number; unitPrice: number; partNumber?: string }>;
    advancePayment?: { amount: number; paymentMethod: PaymentMethod; notes?: string };
  }): Promise<ServiceOrder> {
    this.isLoading = true;
    this.error = null;

    try {
      // Calculate totals upfront
      const totalLabor = input.laborItems.reduce((sum, item) => sum + (item.hours * item.ratePerHour), 0);
      const totalParts = input.spareParts.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalAmount = totalLabor + totalParts;
      const totalPaid = input.advancePayment?.amount || 0;
      const balanceDue = totalAmount - totalPaid;

      // Create order with pre-calculated totals
      const orderData: Omit<ServiceOrder, 'id'> = {
        userId,
        vehicleId: input.vehicleId,
        customerId: input.customerId,
        status: 'pending',
        kmReading: input.kmReading || null,
        description: input.description || null,
        notes: input.notes || null,
        createdAt: new Date(),
        completedAt: null,
        customerName: input.customerName,
        vehicleMake: input.vehicleMake,
        vehicleModel: input.vehicleModel,
        vehicleLicensePlate: input.vehicleLicensePlate,
        totalLabor,
        totalParts,
        totalAmount,
        totalPaid,
        balanceDue,
      };

      const order = await firestoreService.create<ServiceOrder>(
        COLLECTIONS.ORDERS,
        orderData,
        orderConverter
      );

      // Add labor items in parallel
      const laborPromises = input.laborItems.map((item) =>
        firestoreService.create<LaborItem>(
          getLaborItemsPath(order.id),
          createLaborItemWithTotal({
            serviceOrderId: order.id,
            description: item.description,
            hours: item.hours,
            ratePerHour: item.ratePerHour,
          }),
          laborItemConverter
        )
      );

      // Add spare parts in parallel
      const partPromises = input.spareParts.map((item) =>
        firestoreService.create<SparePart>(
          getSparePartsPath(order.id),
          createSparePartWithTotal({
            serviceOrderId: order.id,
            partName: item.partName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            partNumber: item.partNumber,
          }),
          sparePartConverter
        )
      );

      // Add advance payment if provided
      const paymentPromise = input.advancePayment
        ? firestoreService.create<Payment>(
            getPaymentsPath(order.id),
            {
              serviceOrderId: order.id,
              amount: input.advancePayment.amount,
              paymentType: 'advance' as const,
              paymentMethod: input.advancePayment.paymentMethod,
              date: new Date(),
              notes: input.advancePayment.notes || null,
            },
            paymentConverter
          )
        : Promise.resolve(null);

      // Execute all in parallel
      await Promise.all([...laborPromises, ...partPromises, paymentPromise]);

      runInAction(() => {
        this.orders.unshift(order);
        this.isLoading = false;
      });

      return order;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to create order';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Create order
  async create(userId: string, input: CreateServiceOrderInput): Promise<ServiceOrder> {
    this.isLoading = true;
    this.error = null;

    try {
      const orderData: Omit<ServiceOrder, 'id'> = {
        userId,
        vehicleId: input.vehicleId,
        customerId: input.customerId,
        status: 'pending',
        kmReading: input.kmReading || null,
        description: input.description || null,
        notes: input.notes || null,
        createdAt: new Date(),
        completedAt: null,
        customerName: input.customerName,
        vehicleMake: input.vehicleMake,
        vehicleModel: input.vehicleModel,
        vehicleLicensePlate: input.vehicleLicensePlate,
        ...createEmptyOrderTotals(),
      };

      const order = await firestoreService.create<ServiceOrder>(
        COLLECTIONS.ORDERS,
        orderData,
        orderConverter
      );

      runInAction(() => {
        this.orders.unshift(order);
        this.isLoading = false;
      });

      return order;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to create order';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Update order
  async update(id: string, input: UpdateServiceOrderInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const updates: Partial<ServiceOrder> = { ...input };

      // Set completedAt if completing order
      if (input.status === 'completed') {
        updates.completedAt = new Date();
      }

      await firestoreService.update<ServiceOrder>(COLLECTIONS.ORDERS, id, updates);

      runInAction(() => {
        const index = this.orders.findIndex((o) => o.id === id);
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], ...updates };
        }
        if (this.currentOrder?.id === id) {
          this.currentOrder = { ...this.currentOrder, ...updates };
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to update order';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Delete order (and all subcollections)
  async delete(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Delete subcollections first
      await Promise.all([
        firestoreService.deleteSubcollection(`${COLLECTIONS.ORDERS}/${id}`, COLLECTIONS.LABOR_ITEMS),
        firestoreService.deleteSubcollection(`${COLLECTIONS.ORDERS}/${id}`, COLLECTIONS.SPARE_PARTS),
        firestoreService.deleteSubcollection(`${COLLECTIONS.ORDERS}/${id}`, COLLECTIONS.PAYMENTS),
        firestoreService.deleteSubcollection(`${COLLECTIONS.ORDERS}/${id}`, COLLECTIONS.PHOTOS),
      ]);

      // Delete the order document
      await firestoreService.delete(COLLECTIONS.ORDERS, id);

      runInAction(() => {
        this.orders = this.orders.filter((o) => o.id !== id);
        if (this.currentOrder?.id === id) {
          this.currentOrder = null;
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to delete order';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Helper to recalculate and update order totals
  private async recalculateTotals(orderId: string): Promise<void> {
    if (!this.currentOrder || this.currentOrder.id !== orderId) return;

    const totals = calculateOrderTotals(
      this.currentOrder.laborItems,
      this.currentOrder.spareParts,
      this.currentOrder.payments
    );

    await firestoreService.update<ServiceOrder>(COLLECTIONS.ORDERS, orderId, totals);

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder = { ...this.currentOrder, ...totals };
      }
      const index = this.orders.findIndex((o) => o.id === orderId);
      if (index !== -1) {
        this.orders[index] = { ...this.orders[index], ...totals };
      }
    });
  }

  // === Labor Items ===
  async addLaborItem(orderId: string, input: Omit<CreateLaborItemInput, 'serviceOrderId'>): Promise<LaborItem> {
    const itemData = createLaborItemWithTotal({ ...input, serviceOrderId: orderId });

    const item = await firestoreService.create<LaborItem>(
      getLaborItemsPath(orderId),
      itemData,
      laborItemConverter
    );

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder.laborItems.push(item);
      }
    });

    await this.recalculateTotals(orderId);
    return item;
  }

  async updateLaborItem(orderId: string, itemId: string, updates: Partial<LaborItem>): Promise<void> {
    // Recalculate total if hours or rate changed
    if (updates.hours !== undefined || updates.ratePerHour !== undefined) {
      const currentItem = this.currentOrder?.laborItems.find((i) => i.id === itemId);
      if (currentItem) {
        const hours = updates.hours ?? currentItem.hours;
        const rate = updates.ratePerHour ?? currentItem.ratePerHour;
        updates.total = hours * rate;
      }
    }

    await firestoreService.update<LaborItem>(getLaborItemsPath(orderId), itemId, updates);

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        const index = this.currentOrder.laborItems.findIndex((i) => i.id === itemId);
        if (index !== -1) {
          this.currentOrder.laborItems[index] = { ...this.currentOrder.laborItems[index], ...updates };
        }
      }
    });

    await this.recalculateTotals(orderId);
  }

  async deleteLaborItem(orderId: string, itemId: string): Promise<void> {
    await firestoreService.delete(getLaborItemsPath(orderId), itemId);

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder.laborItems = this.currentOrder.laborItems.filter((i) => i.id !== itemId);
      }
    });

    await this.recalculateTotals(orderId);
  }

  // === Spare Parts ===
  async addSparePart(orderId: string, input: Omit<CreateSparePartInput, 'serviceOrderId'>): Promise<SparePart> {
    const partData = createSparePartWithTotal({ ...input, serviceOrderId: orderId });

    const part = await firestoreService.create<SparePart>(
      getSparePartsPath(orderId),
      partData,
      sparePartConverter
    );

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder.spareParts.push(part);
      }
    });

    await this.recalculateTotals(orderId);
    return part;
  }

  async updateSparePart(orderId: string, partId: string, updates: Partial<SparePart>): Promise<void> {
    // Recalculate total if quantity or price changed
    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
      const currentPart = this.currentOrder?.spareParts.find((p) => p.id === partId);
      if (currentPart) {
        const qty = updates.quantity ?? currentPart.quantity;
        const price = updates.unitPrice ?? currentPart.unitPrice;
        updates.total = qty * price;
      }
    }

    await firestoreService.update<SparePart>(getSparePartsPath(orderId), partId, updates);

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        const index = this.currentOrder.spareParts.findIndex((p) => p.id === partId);
        if (index !== -1) {
          this.currentOrder.spareParts[index] = { ...this.currentOrder.spareParts[index], ...updates };
        }
      }
    });

    await this.recalculateTotals(orderId);
  }

  async deleteSparePart(orderId: string, partId: string): Promise<void> {
    await firestoreService.delete(getSparePartsPath(orderId), partId);

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder.spareParts = this.currentOrder.spareParts.filter((p) => p.id !== partId);
      }
    });

    await this.recalculateTotals(orderId);
  }

  // === Payments ===
  async addPayment(orderId: string, input: Omit<CreatePaymentInput, 'serviceOrderId'>): Promise<Payment> {
    const paymentData: Omit<Payment, 'id'> = {
      serviceOrderId: orderId,
      amount: input.amount,
      paymentType: input.paymentType,
      paymentMethod: input.paymentMethod,
      date: input.date || new Date(),
      notes: input.notes || null,
    };

    const payment = await firestoreService.create<Payment>(
      getPaymentsPath(orderId),
      paymentData,
      paymentConverter
    );

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder.payments.push(payment);
      }
    });

    await this.recalculateTotals(orderId);
    return payment;
  }

  async deletePayment(orderId: string, paymentId: string): Promise<void> {
    await firestoreService.delete(getPaymentsPath(orderId), paymentId);

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder.payments = this.currentOrder.payments.filter((p) => p.id !== paymentId);
      }
    });

    await this.recalculateTotals(orderId);
  }

  // === Photos ===
  async addPhoto(
    userId: string,
    orderId: string,
    input: Omit<CreatePhotoInput, 'serviceOrderId' | 'photoUrl' | 'storagePath'>,
    localUri: string
  ): Promise<Photo> {
    // Upload photo to Firebase Storage
    const uploadResult = await storageService.uploadServicePhoto(
      userId,
      orderId,
      localUri
    );

    const photoData: Omit<Photo, 'id'> = {
      serviceOrderId: orderId,
      photoUrl: uploadResult.url,
      storagePath: uploadResult.path,
      photoType: input.photoType,
      description: input.description || null,
      capturedAt: new Date(),
    };

    const photo = await firestoreService.create<Photo>(
      getPhotosPath(orderId),
      photoData,
      photoConverter
    );

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder.photos.push(photo);
      }
    });

    return photo;
  }

  async deletePhoto(orderId: string, photoId: string): Promise<void> {
    // Get the photo to find its storage path
    const photo = this.currentOrder?.photos.find((p) => p.id === photoId);

    // Delete from Firestore
    await firestoreService.delete(getPhotosPath(orderId), photoId);

    // Delete from Storage if path exists
    if (photo?.storagePath) {
      try {
        await storageService.deleteFile(photo.storagePath);
      } catch (err) {
        console.warn('Failed to delete photo from storage:', err);
      }
    }

    runInAction(() => {
      if (this.currentOrder?.id === orderId) {
        this.currentOrder.photos = this.currentOrder.photos.filter((p) => p.id !== photoId);
      }
    });
  }

  // Set current order
  setCurrentOrder(order: ServiceOrderWithDetails | null) {
    this.currentOrder = order;
  }

  // Clear error
  clearError() {
    this.error = null;
  }

  // Cleanup subscription
  dispose() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Reset store
  reset() {
    this.dispose();
    this.orders = [];
    this.currentOrder = null;
    this.isLoading = false;
    this.error = null;
  }
}

export const orderStore = new OrderStore();
export { OrderStore };
