// Appointment state store
import { makeAutoObservable, runInAction } from 'mobx';
import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  isUpcoming,
} from '@models/Appointment';
import { AppointmentStatus, DEFAULT_APPOINTMENT_DURATION } from '@core/constants';
import { firestoreService, FilterCondition } from '@firebaseServices/firestore/FirestoreService';
import { COLLECTIONS } from '@firebaseServices/firestore/collections';
import { appointmentConverter } from '@firebaseServices/firestore/converters';

class AppointmentStore {
  appointments: Appointment[] = [];
  currentAppointment: Appointment | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private unsubscribe: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed properties
  get appointmentCount(): number {
    return this.appointments.length;
  }

  get upcomingAppointments(): Appointment[] {
    return this.appointments
      .filter((a) => isUpcoming(a) && a.status !== 'cancelled')
      .sort((a, b) => {
        const dateA = new Date(a.scheduledDate);
        const dateB = new Date(b.scheduledDate);
        return dateA.getTime() - dateB.getTime();
      });
  }

  get todayAppointments(): Appointment[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.appointments.filter((a) => {
      const appointmentDate = new Date(a.scheduledDate);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() === today.getTime() && a.status !== 'cancelled';
    });
  }

  // Get appointments by date
  getByDate(date: Date): Appointment[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return this.appointments.filter((a) => {
      const appointmentDate = new Date(a.scheduledDate);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() === targetDate.getTime();
    });
  }

  // Get appointments by customer
  getByCustomerId(customerId: string): Appointment[] {
    return this.appointments.filter((a) => a.customerId === customerId);
  }

  // Get appointment by ID
  getById(id: string): Appointment | undefined {
    return this.appointments.find((a) => a.id === id);
  }

  // Subscribe to appointments for a user (real-time updates)
  subscribeToAppointments(userId: string): void {
    this.isLoading = true;

    const filters: FilterCondition[] = [
      { field: 'userId', operator: '==', value: userId },
    ];

    this.unsubscribe = firestoreService.subscribeToCollection<Appointment>(
      COLLECTIONS.APPOINTMENTS,
      (appointments) => {
        runInAction(() => {
          this.appointments = appointments;
          this.isLoading = false;
        });
      },
      filters,
      { orderByField: 'scheduledDate', orderDirection: 'asc' },
      appointmentConverter
    );
  }

  // Fetch all appointments (one-time)
  async fetchAll(userId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: FilterCondition[] = [
        { field: 'userId', operator: '==', value: userId },
      ];

      const appointments = await firestoreService.getAll<Appointment>(
        COLLECTIONS.APPOINTMENTS,
        filters,
        { orderByField: 'scheduledDate', orderDirection: 'asc' },
        appointmentConverter
      );

      runInAction(() => {
        this.appointments = appointments;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch appointments';
        this.isLoading = false;
      });
    }
  }

  // Fetch appointments by date range
  async fetchByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Appointment[]> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: FilterCondition[] = [
        { field: 'userId', operator: '==', value: userId },
        { field: 'scheduledDate', operator: '>=', value: startDate },
        { field: 'scheduledDate', operator: '<=', value: endDate },
      ];

      const appointments = await firestoreService.getAll<Appointment>(
        COLLECTIONS.APPOINTMENTS,
        filters,
        { orderByField: 'scheduledDate', orderDirection: 'asc' },
        appointmentConverter
      );

      runInAction(() => {
        // Merge with existing appointments
        appointments.forEach((appointment) => {
          const index = this.appointments.findIndex((a) => a.id === appointment.id);
          if (index === -1) {
            this.appointments.push(appointment);
          } else {
            this.appointments[index] = appointment;
          }
        });
        this.isLoading = false;
      });

      return appointments;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch appointments';
        this.isLoading = false;
      });
      return [];
    }
  }

  // Fetch single appointment
  async fetchById(id: string): Promise<Appointment | null> {
    this.isLoading = true;
    this.error = null;

    try {
      const appointment = await firestoreService.getById<Appointment>(
        COLLECTIONS.APPOINTMENTS,
        id,
        appointmentConverter
      );

      runInAction(() => {
        this.currentAppointment = appointment;
        this.isLoading = false;
      });

      return appointment;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch appointment';
        this.isLoading = false;
      });
      return null;
    }
  }

  // Create appointment
  async create(userId: string, input: CreateAppointmentInput): Promise<Appointment> {
    this.isLoading = true;
    this.error = null;

    try {
      const appointmentData: Omit<Appointment, 'id'> = {
        userId,
        customerId: input.customerId,
        vehicleId: input.vehicleId,
        scheduledDate: input.scheduledDate,
        scheduledTime: input.scheduledTime,
        durationMinutes: input.durationMinutes || DEFAULT_APPOINTMENT_DURATION,
        serviceType: input.serviceType,
        status: 'scheduled',
        notes: input.notes || null,
        createdAt: new Date(),
        customerName: input.customerName,
        vehicleMake: input.vehicleMake,
        vehicleModel: input.vehicleModel,
        vehicleLicensePlate: input.vehicleLicensePlate,
      };

      const appointment = await firestoreService.create<Appointment>(
        COLLECTIONS.APPOINTMENTS,
        appointmentData,
        appointmentConverter
      );

      runInAction(() => {
        this.appointments.push(appointment);
        this.isLoading = false;
      });

      return appointment;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to create appointment';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Update appointment
  async update(id: string, input: UpdateAppointmentInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await firestoreService.update<Appointment>(COLLECTIONS.APPOINTMENTS, id, input);

      runInAction(() => {
        const index = this.appointments.findIndex((a) => a.id === id);
        if (index !== -1) {
          this.appointments[index] = { ...this.appointments[index], ...input };
        }
        if (this.currentAppointment?.id === id) {
          this.currentAppointment = { ...this.currentAppointment, ...input };
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to update appointment';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Update appointment status
  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    await this.update(id, { status });
  }

  // Delete appointment
  async delete(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await firestoreService.delete(COLLECTIONS.APPOINTMENTS, id);

      runInAction(() => {
        this.appointments = this.appointments.filter((a) => a.id !== id);
        if (this.currentAppointment?.id === id) {
          this.currentAppointment = null;
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to delete appointment';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Set current appointment
  setCurrentAppointment(appointment: Appointment | null) {
    this.currentAppointment = appointment;
  }

  // Clear error
  clearError() {
    this.error = null;
  }

  // Cleanup subscription
  dispose() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Reset store
  reset() {
    this.dispose();
    this.appointments = [];
    this.currentAppointment = null;
    this.isLoading = false;
    this.error = null;
  }
}

export const appointmentStore = new AppointmentStore();
export { AppointmentStore };
