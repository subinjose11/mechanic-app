import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@core/di/container';
import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@domain/entities/Appointment';
import { AppointmentFilters } from '@domain/repositories/IAppointmentRepository';
import { AppointmentStatus } from '@core/constants';

const appointmentRepository = container.appointmentRepository;

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters?: AppointmentFilters) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  upcoming: () => [...appointmentKeys.all, 'upcoming'] as const,
  byDate: (date: Date) => [...appointmentKeys.all, 'date', date.toISOString()] as const,
  byMonth: (year: number, month: number) => [...appointmentKeys.all, 'month', year, month] as const,
  byCustomer: (customerId: string) => [...appointmentKeys.all, 'customer', customerId] as const,
  byVehicle: (vehicleId: string) => [...appointmentKeys.all, 'vehicle', vehicleId] as const,
  availableSlots: (date: Date) => [...appointmentKeys.all, 'slots', date.toISOString()] as const,
  stats: () => [...appointmentKeys.all, 'stats'] as const,
};

// Fetch all appointments
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentRepository.getAll(filters),
  });
}

// Fetch a single appointment
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentRepository.getById(id),
    enabled: !!id,
  });
}

// Fetch upcoming appointments
export function useUpcomingAppointments() {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: () => appointmentRepository.getUpcoming(),
  });
}

// Fetch appointments by date
export function useAppointmentsByDate(date: Date) {
  return useQuery({
    queryKey: appointmentKeys.byDate(date),
    queryFn: () => appointmentRepository.getByDate(date),
    enabled: !!date,
  });
}

// Fetch appointments for a month (for calendar view)
export function useAppointmentsForMonth(year: number, month: number) {
  return useQuery({
    queryKey: appointmentKeys.byMonth(year, month),
    queryFn: () => appointmentRepository.getAppointmentsForMonth(year, month),
    enabled: !!year && !!month,
  });
}

// Fetch appointments by customer
export function useAppointmentsByCustomer(customerId: string) {
  return useQuery({
    queryKey: appointmentKeys.byCustomer(customerId),
    queryFn: () => appointmentRepository.getByCustomerId(customerId),
    enabled: !!customerId,
  });
}

// Fetch appointments by vehicle
export function useAppointmentsByVehicle(vehicleId: string) {
  return useQuery({
    queryKey: appointmentKeys.byVehicle(vehicleId),
    queryFn: () => appointmentRepository.getByVehicleId(vehicleId),
    enabled: !!vehicleId,
  });
}

// Get available time slots for a date
export function useAvailableTimeSlots(date: Date) {
  return useQuery({
    queryKey: appointmentKeys.availableSlots(date),
    queryFn: () => appointmentRepository.getAvailableTimeSlots(date),
    enabled: !!date,
  });
}

// Appointment statistics
export function useAppointmentStats() {
  return useQuery({
    queryKey: appointmentKeys.stats(),
    queryFn: () => appointmentRepository.getAppointmentStats(),
  });
}

// Create appointment
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentInput) => appointmentRepository.create(data),
    onSuccess: (newAppointment) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

// Update appointment
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentInput }) =>
      appointmentRepository.update(id, data),
    onSuccess: (updatedAppointment) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.setQueryData(appointmentKeys.detail(updatedAppointment.id), updatedAppointment);
    },
  });
}

// Update appointment status
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentRepository.updateStatus(id, status),
    onSuccess: (updatedAppointment) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.setQueryData(appointmentKeys.detail(updatedAppointment.id), updatedAppointment);
    },
  });
}

// Confirm appointment
export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentRepository.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

// Cancel appointment
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentRepository.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

// Complete appointment
export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentRepository.completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

// Delete appointment
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
