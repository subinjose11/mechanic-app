import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput
} from '@domain/entities/Appointment';
import { AppointmentStatus } from '@core/constants';

export interface AppointmentFilters {
  status?: AppointmentStatus;
  customerId?: string;
  vehicleId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IAppointmentRepository {
  // CRUD operations
  getAll(filters?: AppointmentFilters): Promise<Appointment[]>;
  getById(id: string): Promise<Appointment | null>;
  create(data: CreateAppointmentInput): Promise<Appointment>;
  update(id: string, data: UpdateAppointmentInput): Promise<Appointment>;
  delete(id: string): Promise<void>;

  // Status management
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
  confirmAppointment(id: string): Promise<Appointment>;
  cancelAppointment(id: string): Promise<Appointment>;
  completeAppointment(id: string): Promise<Appointment>;

  // Queries
  getUpcoming(): Promise<Appointment[]>;
  getByDate(date: Date): Promise<Appointment[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
  getByCustomerId(customerId: string): Promise<Appointment[]>;
  getByVehicleId(vehicleId: string): Promise<Appointment[]>;

  // Calendar
  getAppointmentsForMonth(year: number, month: number): Promise<Appointment[]>;
  getAvailableTimeSlots(date: Date): Promise<string[]>;

  // Statistics
  getAppointmentStats(): Promise<{
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    todayCount: number;
    weekCount: number;
  }>;
}
