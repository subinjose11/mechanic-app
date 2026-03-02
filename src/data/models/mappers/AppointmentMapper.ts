import { Appointment, CreateAppointmentInput } from '@domain/entities/Appointment';
import { Database } from '@data/datasources/remote/SupabaseClient';
import { AppointmentStatus } from '@core/constants';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export class AppointmentMapper {
  static toDomain(row: AppointmentRow): Appointment {
    return {
      id: row.id,
      userId: row.user_id,
      customerId: row.customer_id,
      vehicleId: row.vehicle_id,
      scheduledDate: new Date(row.scheduled_date),
      scheduledTime: row.scheduled_time,
      durationMinutes: row.duration_minutes,
      serviceType: row.service_type,
      status: row.status as AppointmentStatus,
      notes: row.notes,
      createdAt: new Date(row.created_at),
    };
  }

  static toInsert(input: CreateAppointmentInput, userId: string): AppointmentInsert {
    return {
      user_id: userId,
      customer_id: input.customerId,
      vehicle_id: input.vehicleId,
      scheduled_date: input.scheduledDate.toISOString().split('T')[0],
      scheduled_time: input.scheduledTime,
      duration_minutes: input.durationMinutes || 60,
      service_type: input.serviceType,
      status: 'scheduled',
      notes: input.notes || null,
    };
  }

  static toUpdate(input: Partial<CreateAppointmentInput> & { status?: AppointmentStatus }): AppointmentUpdate {
    const update: AppointmentUpdate = {};
    if (input.scheduledDate !== undefined) {
      update.scheduled_date = input.scheduledDate.toISOString().split('T')[0];
    }
    if (input.scheduledTime !== undefined) update.scheduled_time = input.scheduledTime;
    if (input.durationMinutes !== undefined) update.duration_minutes = input.durationMinutes;
    if (input.serviceType !== undefined) update.service_type = input.serviceType;
    if (input.status !== undefined) update.status = input.status;
    if (input.notes !== undefined) update.notes = input.notes || null;
    return update;
  }
}
