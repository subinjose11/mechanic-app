import { IAppointmentRepository, AppointmentFilters } from '@domain/repositories/IAppointmentRepository';
import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@domain/entities/Appointment';
import { AppointmentRemoteDataSource } from '@data/datasources/remote/AppointmentRemoteDataSource';
import { AppointmentMapper } from '@data/models/mappers';
import { supabase } from '@data/datasources/remote/SupabaseClient';
import { AppointmentStatus } from '@core/constants';

export class AppointmentRepositoryImpl implements IAppointmentRepository {
  constructor(private dataSource: AppointmentRemoteDataSource) {}

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  private convertFilters(filters?: AppointmentFilters) {
    if (!filters) return undefined;
    return {
      status: filters.status,
      customerId: filters.customerId,
      vehicleId: filters.vehicleId,
      startDate: filters.startDate?.toISOString().split('T')[0],
      endDate: filters.endDate?.toISOString().split('T')[0],
    };
  }

  async getAll(filters?: AppointmentFilters): Promise<Appointment[]> {
    const rows = await this.dataSource.getAll(this.convertFilters(filters));
    return rows.map(AppointmentMapper.toDomain);
  }

  async getById(id: string): Promise<Appointment | null> {
    const row = await this.dataSource.getById(id);
    return row ? AppointmentMapper.toDomain(row) : null;
  }

  async create(data: CreateAppointmentInput): Promise<Appointment> {
    const userId = await this.getCurrentUserId();
    const insert = AppointmentMapper.toInsert(data, userId);
    const row = await this.dataSource.create(insert);
    return AppointmentMapper.toDomain(row);
  }

  async update(id: string, data: UpdateAppointmentInput): Promise<Appointment> {
    const update = AppointmentMapper.toUpdate(data);
    const row = await this.dataSource.update(id, update);
    return AppointmentMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(id);
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const row = await this.dataSource.updateStatus(id, status);
    return AppointmentMapper.toDomain(row);
  }

  async confirmAppointment(id: string): Promise<Appointment> {
    return this.updateStatus(id, 'confirmed');
  }

  async cancelAppointment(id: string): Promise<Appointment> {
    return this.updateStatus(id, 'cancelled');
  }

  async completeAppointment(id: string): Promise<Appointment> {
    return this.updateStatus(id, 'completed');
  }

  async getUpcoming(): Promise<Appointment[]> {
    const rows = await this.dataSource.getUpcoming();
    return rows.map(AppointmentMapper.toDomain);
  }

  async getByDate(date: Date): Promise<Appointment[]> {
    const dateStr = date.toISOString().split('T')[0];
    const rows = await this.dataSource.getByDate(dateStr);
    return rows.map(AppointmentMapper.toDomain);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const rows = await this.dataSource.getAll({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
    return rows.map(AppointmentMapper.toDomain);
  }

  async getByCustomerId(customerId: string): Promise<Appointment[]> {
    const rows = await this.dataSource.getAll({ customerId });
    return rows.map(AppointmentMapper.toDomain);
  }

  async getByVehicleId(vehicleId: string): Promise<Appointment[]> {
    const rows = await this.dataSource.getAll({ vehicleId });
    return rows.map(AppointmentMapper.toDomain);
  }

  async getAppointmentsForMonth(year: number, month: number): Promise<Appointment[]> {
    const rows = await this.dataSource.getAppointmentsForMonth(year, month);
    return rows.map(AppointmentMapper.toDomain);
  }

  async getAvailableTimeSlots(date: Date): Promise<string[]> {
    const dateStr = date.toISOString().split('T')[0];
    return this.dataSource.getAvailableTimeSlots(dateStr);
  }

  async getAppointmentStats(): Promise<{
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    todayCount: number;
    weekCount: number;
  }> {
    return this.dataSource.getAppointmentStats();
  }
}
