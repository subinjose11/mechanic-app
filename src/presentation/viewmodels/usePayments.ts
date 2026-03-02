import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@core/di/container';
import { Payment, CreatePaymentInput, UpdatePaymentInput } from '@domain/entities/Payment';
import { PaymentFilters } from '@domain/repositories/IPaymentRepository';
import { orderKeys } from './useOrders';

const paymentRepository = container.paymentRepository;

// Query keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters?: PaymentFilters) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  byOrder: (orderId: string) => [...paymentKeys.all, 'order', orderId] as const,
  stats: (startDate?: Date, endDate?: Date) =>
    [...paymentKeys.all, 'stats', { startDate, endDate }] as const,
  total: (orderId: string) => [...paymentKeys.all, 'total', orderId] as const,
  advances: (orderId: string) => [...paymentKeys.all, 'advances', orderId] as const,
};

// Fetch all payments
export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => paymentRepository.getAll(filters),
  });
}

// Fetch a single payment
export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentRepository.getById(id),
    enabled: !!id,
  });
}

// Fetch payments by service order
export function usePaymentsByOrder(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.byOrder(orderId),
    queryFn: () => paymentRepository.getByServiceOrderId(orderId),
    enabled: !!orderId,
  });
}

// Get total payment for an order
export function useTotalPaymentByOrder(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.total(orderId),
    queryFn: () => paymentRepository.getTotalByServiceOrder(orderId),
    enabled: !!orderId,
  });
}

// Get total advances for an order
export function useTotalAdvancesByOrder(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.advances(orderId),
    queryFn: () => paymentRepository.getTotalAdvancesByServiceOrder(orderId),
    enabled: !!orderId,
  });
}

// Payment statistics
export function usePaymentStats(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: paymentKeys.stats(startDate, endDate),
    queryFn: () => paymentRepository.getPaymentStats(startDate, endDate),
  });
}

// Create payment
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentInput) => paymentRepository.create(data),
    onSuccess: (newPayment) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.byOrder(newPayment.serviceOrderId),
      });
      // Also invalidate order details since payments affect billing
      queryClient.invalidateQueries({
        queryKey: orderKeys.detailWithItems(newPayment.serviceOrderId),
      });
    },
  });
}

// Update payment
export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentInput }) =>
      paymentRepository.update(id, data),
    onSuccess: (updatedPayment) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.setQueryData(paymentKeys.detail(updatedPayment.id), updatedPayment);
      // Also invalidate order details
      queryClient.invalidateQueries({
        queryKey: orderKeys.detailWithItems(updatedPayment.serviceOrderId),
      });
    },
  });
}

// Delete payment
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orderId }: { id: string; orderId: string }) =>
      paymentRepository.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      // Also invalidate order details
      queryClient.invalidateQueries({
        queryKey: orderKeys.detailWithItems(variables.orderId),
      });
    },
  });
}
