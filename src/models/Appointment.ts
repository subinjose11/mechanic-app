// Appointment model
import { AppointmentStatus } from '@core/constants';

export interface Appointment {
  id: string;
  userId: string;
  customerId: string;
  vehicleId: string;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes: number;
  serviceType: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  // Denormalized fields for display
  customerName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
}

export interface CreateAppointmentInput {
  customerId: string;
  vehicleId: string;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes?: number;
  serviceType: string;
  notes?: string;
  // Denormalized fields
  customerName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
}

export interface UpdateAppointmentInput {
  scheduledDate?: Date;
  scheduledTime?: string;
  durationMinutes?: number;
  serviceType?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export function isUpcoming(appointment: Appointment): boolean {
  const now = new Date();
  const appointmentDateTime = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  return appointmentDateTime > now;
}

export function isPast(appointment: Appointment): boolean {
  return !isUpcoming(appointment);
}

export function canModifyAppointment(appointment: Appointment): boolean {
  return appointment.status !== 'completed' && appointment.status !== 'cancelled';
}

export function getAppointmentDateTime(appointment: Appointment): Date {
  const dateTime = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.split(':').map(Number);
  dateTime.setHours(hours, minutes, 0, 0);
  return dateTime;
}

export function getAppointmentEndTime(appointment: Appointment): Date {
  const startTime = getAppointmentDateTime(appointment);
  return new Date(startTime.getTime() + appointment.durationMinutes * 60000);
}
