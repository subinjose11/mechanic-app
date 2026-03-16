// Firestore converter for Appointment documents (native SDK)
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Appointment } from '@models/Appointment';
import { DEFAULT_APPOINTMENT_DURATION } from '@core/constants';
import { NativeFirestoreConverter } from '../FirestoreService';

export const appointmentConverter: NativeFirestoreConverter<Appointment> = {
  toFirestore(appointment: Omit<Appointment, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      userId: appointment.userId,
      customerId: appointment.customerId,
      vehicleId: appointment.vehicleId,
      scheduledDate: firestore.Timestamp.fromDate(appointment.scheduledDate),
      scheduledTime: appointment.scheduledTime,
      durationMinutes: appointment.durationMinutes,
      serviceType: appointment.serviceType,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: firestore.Timestamp.fromDate(appointment.createdAt),
      // Denormalized fields
      customerName: appointment.customerName || null,
      vehicleMake: appointment.vehicleMake || null,
      vehicleModel: appointment.vehicleModel || null,
      vehicleLicensePlate: appointment.vehicleLicensePlate || null,
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): Appointment {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data?.userId || '',
      customerId: data?.customerId || '',
      vehicleId: data?.vehicleId || '',
      scheduledDate: data?.scheduledDate?.toDate() || new Date(),
      scheduledTime: data?.scheduledTime || '09:00',
      durationMinutes: data?.durationMinutes || DEFAULT_APPOINTMENT_DURATION,
      serviceType: data?.serviceType || '',
      status: data?.status || 'scheduled',
      notes: data?.notes || null,
      createdAt: data?.createdAt?.toDate() || new Date(),
      // Denormalized fields
      customerName: data?.customerName || undefined,
      vehicleMake: data?.vehicleMake || undefined,
      vehicleModel: data?.vehicleModel || undefined,
      vehicleLicensePlate: data?.vehicleLicensePlate || undefined,
    };
  },
};
