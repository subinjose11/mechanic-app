import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@core/di/container';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@domain/entities/Vehicle';

const vehicleRepository = container.vehicleRepository;

// Query keys
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...vehicleKeys.lists(), filters] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
  search: (query: string) => [...vehicleKeys.all, 'search', query] as const,
  byCustomer: (customerId: string) => [...vehicleKeys.all, 'customer', customerId] as const,
  byLicensePlate: (plate: string) => [...vehicleKeys.all, 'plate', plate] as const,
  paginated: (page: number, limit: number) => [...vehicleKeys.all, 'paginated', { page, limit }] as const,
};

// Fetch all vehicles
export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.lists(),
    queryFn: () => vehicleRepository.getAll(),
  });
}

// Fetch a single vehicle
export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehicleRepository.getById(id),
    enabled: !!id,
  });
}

// Fetch vehicles by customer
export function useVehiclesByCustomer(customerId: string) {
  return useQuery({
    queryKey: vehicleKeys.byCustomer(customerId),
    queryFn: () => vehicleRepository.getByCustomerId(customerId),
    enabled: !!customerId,
  });
}

// Search vehicles
export function useSearchVehicles(query: string) {
  return useQuery({
    queryKey: vehicleKeys.search(query),
    queryFn: () => vehicleRepository.search(query),
    enabled: query.length >= 2,
  });
}

// Get vehicle by license plate
export function useVehicleByLicensePlate(licensePlate: string) {
  return useQuery({
    queryKey: vehicleKeys.byLicensePlate(licensePlate),
    queryFn: () => vehicleRepository.getByLicensePlate(licensePlate),
    enabled: !!licensePlate,
  });
}

// Paginated vehicles
export function usePaginatedVehicles(page: number, limit: number = 20) {
  return useQuery({
    queryKey: vehicleKeys.paginated(page, limit),
    queryFn: () => vehicleRepository.getPaginated(page, limit),
  });
}

// Create vehicle
export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleInput) => vehicleRepository.create(data),
    onSuccess: (newVehicle) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      // Also invalidate customer's vehicles
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.byCustomer(newVehicle.customerId),
      });
    },
  });
}

// Update vehicle
export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleInput }) =>
      vehicleRepository.update(id, data),
    onSuccess: (updatedVehicle) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.setQueryData(vehicleKeys.detail(updatedVehicle.id), updatedVehicle);
    },
  });
}

// Delete vehicle
export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
