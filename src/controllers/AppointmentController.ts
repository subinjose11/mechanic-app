// Appointment controller - handles appointment operations
import { BaseController } from './base/BaseController';
import { appointmentStore } from '@stores/AppointmentStore';
import { customerStore } from '@stores/CustomerStore';
import { vehicleStore } from '@stores/VehicleStore';
import { authStore } from '@stores/AuthStore';
import { Appointment, CreateAppointmentInput, UpdateAppointmentInput } from '@models/Appointment';
import { AppointmentStatus } from '@core/constants';

class AppointmentController extends BaseController<Appointment> {
  private static instance: AppointmentController;

  private constructor() {
    super('appointment');
  }

  static getInstance(): AppointmentController {
    if (!AppointmentController.instance) {
      AppointmentController.instance = new AppointmentController();
    }
    return AppointmentController.instance;
  }

  // Get all appointments
  get appointments(): Appointment[] {
    return appointmentStore.appointments;
  }

  // Get upcoming appointments
  get upcomingAppointments(): Appointment[] {
    return appointmentStore.upcomingAppointments;
  }

  // Get today's appointments
  get todayAppointments(): Appointment[] {
    return appointmentStore.todayAppointments;
  }

  // Get current appointment
  get currentAppointment(): Appointment | null {
    return appointmentStore.currentAppointment;
  }

  // Get appointment count
  get appointmentCount(): number {
    return appointmentStore.appointmentCount;
  }

  // Check if loading
  get isLoading(): boolean {
    return appointmentStore.isLoading;
  }

  // Get error
  get error(): string | null {
    return appointmentStore.error;
  }

  // Get appointment by ID
  getById(id: string): Appointment | undefined {
    return appointmentStore.getById(id);
  }

  // Get appointments by date
  getByDate(date: Date): Appointment[] {
    return appointmentStore.getByDate(date);
  }

  // Get appointments by customer
  getByCustomerId(customerId: string): Appointment[] {
    return appointmentStore.getByCustomerId(customerId);
  }

  // Fetch all appointments
  async fetchAll(userId?: string): Promise<void> {
    const uid = userId || authStore.userId;
    if (!uid) throw new Error('User not authenticated');

    await this.withLoading(
      () => appointmentStore.fetchAll(uid),
      'Loading appointments...'
    );
  }

  // Fetch appointments by date range
  async fetchByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    return this.withLoading(
      () => appointmentStore.fetchByDateRange(userId, startDate, endDate)
    );
  }

  // Fetch single appointment
  async fetchById(id: string): Promise<Appointment | null> {
    return this.withLoading(
      () => appointmentStore.fetchById(id)
    );
  }

  // Create appointment
  async create(input: {
    customerId: string;
    vehicleId: string;
    scheduledDate: Date;
    scheduledTime: string;
    durationMinutes?: number;
    serviceType: string;
    notes?: string;
  }): Promise<Appointment> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    // Get denormalized data
    const customer = customerStore.getById(input.customerId);
    const vehicle = vehicleStore.getById(input.vehicleId);

    const appointmentInput: CreateAppointmentInput = {
      ...input,
      customerName: customer?.name,
      vehicleMake: vehicle?.make,
      vehicleModel: vehicle?.model,
      vehicleLicensePlate: vehicle?.licensePlate,
    };

    return this.withLoading(
      () => appointmentStore.create(userId, appointmentInput),
      'Creating appointment...',
      'Appointment scheduled!'
    );
  }

  // Update appointment
  async update(id: string, input: UpdateAppointmentInput): Promise<void> {
    await this.withLoading(
      () => appointmentStore.update(id, input),
      'Updating appointment...',
      'Appointment updated!'
    );
  }

  // Update appointment status
  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    const statusMessages: Record<AppointmentStatus, string> = {
      scheduled: 'Appointment scheduled',
      confirmed: 'Appointment confirmed',
      completed: 'Appointment completed',
      cancelled: 'Appointment cancelled',
    };

    await this.withLoading(
      () => appointmentStore.updateStatus(id, status),
      'Updating status...',
      statusMessages[status]
    );
  }

  // Confirm appointment
  async confirm(id: string): Promise<void> {
    await this.updateStatus(id, 'confirmed');
  }

  // Complete appointment
  async complete(id: string): Promise<void> {
    await this.updateStatus(id, 'completed');
  }

  // Cancel appointment
  async cancel(id: string): Promise<void> {
    await this.updateStatus(id, 'cancelled');
  }

  // Delete appointment
  async delete(id: string): Promise<void> {
    await this.withLoading(
      () => appointmentStore.delete(id),
      'Deleting appointment...',
      'Appointment deleted!'
    );
  }

  // Set current appointment
  setCurrentAppointment(appointment: Appointment | null): void {
    appointmentStore.setCurrentAppointment(appointment);
  }

  // Clear error
  clearError(): void {
    appointmentStore.clearError();
  }

  // Subscribe to real-time updates
  subscribe(): void {
    const userId = authStore.userId;
    if (userId) {
      appointmentStore.subscribeToAppointments(userId);
    }
  }

  // Unsubscribe from updates
  unsubscribe(): void {
    appointmentStore.dispose();
  }
}

// Export singleton instance
export const appointmentController = AppointmentController.getInstance();
export { AppointmentController };
