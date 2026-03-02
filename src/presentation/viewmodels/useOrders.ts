import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@core/di/container';
import {
  ServiceOrder,
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
} from '@domain/entities/ServiceOrder';
import { CreateLaborItemInput, UpdateLaborItemInput } from '@domain/entities/LaborItem';
import { CreateSparePartInput, UpdateSparePartInput } from '@domain/entities/SparePart';
import { OrderFilters } from '@domain/repositories/IServiceOrderRepository';
import { OrderStatus } from '@core/constants';

const orderRepository = container.orderRepository;

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  detailWithItems: (id: string) => [...orderKeys.details(), id, 'withItems'] as const,
  byVehicle: (vehicleId: string) => [...orderKeys.all, 'vehicle', vehicleId] as const,
  byCustomer: (customerId: string) => [...orderKeys.all, 'customer', customerId] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
  paginated: (page: number, limit: number, filters?: OrderFilters) =>
    [...orderKeys.all, 'paginated', { page, limit, filters }] as const,
  laborItems: (orderId: string) => [...orderKeys.all, orderId, 'labor'] as const,
  spareParts: (orderId: string) => [...orderKeys.all, orderId, 'parts'] as const,
};

// Fetch all orders
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => orderRepository.getAll(filters),
  });
}

// Fetch a single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderRepository.getById(id),
    enabled: !!id,
  });
}

// Fetch order with all details (labor, parts, payments, photos)
export function useOrderWithDetails(id: string) {
  return useQuery({
    queryKey: orderKeys.detailWithItems(id),
    queryFn: () => orderRepository.getByIdWithDetails(id),
    enabled: !!id,
  });
}

// Fetch orders by vehicle
export function useOrdersByVehicle(vehicleId: string) {
  return useQuery({
    queryKey: orderKeys.byVehicle(vehicleId),
    queryFn: () => orderRepository.getByVehicleId(vehicleId),
    enabled: !!vehicleId,
  });
}

// Fetch orders by customer
export function useOrdersByCustomer(customerId: string) {
  return useQuery({
    queryKey: orderKeys.byCustomer(customerId),
    queryFn: () => orderRepository.getByCustomerId(customerId),
    enabled: !!customerId,
  });
}

// Order statistics
export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => orderRepository.getOrderStats(),
  });
}

// Paginated orders
export function usePaginatedOrders(page: number, limit: number = 20, filters?: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.paginated(page, limit, filters),
    queryFn: () => orderRepository.getPaginated(page, limit, filters),
  });
}

// Create order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceOrderInput) => orderRepository.create(data),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Update order
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceOrderInput }) =>
      orderRepository.update(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderRepository.updateStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
    },
  });
}

// Complete order
export function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderRepository.completeOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderRepository.cancelOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Delete order
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Labor items
export function useLaborItems(orderId: string) {
  return useQuery({
    queryKey: orderKeys.laborItems(orderId),
    queryFn: () => orderRepository.getLaborItems(orderId),
    enabled: !!orderId,
  });
}

export function useAddLaborItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLaborItemInput) => orderRepository.addLaborItem(data),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.laborItems(newItem.serviceOrderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detailWithItems(newItem.serviceOrderId) });
    },
  });
}

export function useUpdateLaborItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, orderId }: { id: string; data: UpdateLaborItemInput; orderId: string }) =>
      orderRepository.updateLaborItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.laborItems(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detailWithItems(variables.orderId) });
    },
  });
}

export function useDeleteLaborItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orderId }: { id: string; orderId: string }) =>
      orderRepository.deleteLaborItem(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.laborItems(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detailWithItems(variables.orderId) });
    },
  });
}

// Spare parts
export function useSpareParts(orderId: string) {
  return useQuery({
    queryKey: orderKeys.spareParts(orderId),
    queryFn: () => orderRepository.getSpareParts(orderId),
    enabled: !!orderId,
  });
}

export function useAddSparePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSparePartInput) => orderRepository.addSparePart(data),
    onSuccess: (newPart) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.spareParts(newPart.serviceOrderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detailWithItems(newPart.serviceOrderId) });
    },
  });
}

export function useUpdateSparePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, orderId }: { id: string; data: UpdateSparePartInput; orderId: string }) =>
      orderRepository.updateSparePart(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.spareParts(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detailWithItems(variables.orderId) });
    },
  });
}

export function useDeleteSparePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orderId }: { id: string; orderId: string }) =>
      orderRepository.deleteSparePart(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.spareParts(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detailWithItems(variables.orderId) });
    },
  });
}
