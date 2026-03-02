import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@core/di/container';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@domain/entities/Customer';

const customerRepository = container.customerRepository;

// Query keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  search: (query: string) => [...customerKeys.all, 'search', query] as const,
  paginated: (page: number, limit: number) => [...customerKeys.all, 'paginated', { page, limit }] as const,
};

// Fetch all customers
export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: () => customerRepository.getAll(),
  });
}

// Fetch a single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerRepository.getById(id),
    enabled: !!id,
  });
}

// Search customers
export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: () => customerRepository.search(query),
    enabled: query.length >= 2,
  });
}

// Paginated customers
export function usePaginatedCustomers(page: number, limit: number = 20) {
  return useQuery({
    queryKey: customerKeys.paginated(page, limit),
    queryFn: () => customerRepository.getPaginated(page, limit),
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerInput) => customerRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) =>
      customerRepository.update(id, data),
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.setQueryData(customerKeys.detail(updatedCustomer.id), updatedCustomer);
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

// Get customer by phone
export function useCustomerByPhone(phone: string) {
  return useQuery({
    queryKey: [...customerKeys.all, 'phone', phone],
    queryFn: () => customerRepository.getByPhone(phone),
    enabled: !!phone,
  });
}
