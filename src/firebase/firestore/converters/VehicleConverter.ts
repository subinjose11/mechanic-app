// Firestore converter for Vehicle documents (native SDK)
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Vehicle } from '@models/Vehicle';
import { NativeFirestoreConverter } from '../FirestoreService';

export const vehicleConverter: NativeFirestoreConverter<Vehicle> = {
  toFirestore(vehicle: Omit<Vehicle, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      userId: vehicle.userId,
      customerId: vehicle.customerId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      color: vehicle.color,
      notes: vehicle.notes,
      customerName: vehicle.customerName || null,
      createdAt: firestore.Timestamp.fromDate(vehicle.createdAt),
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): Vehicle {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data?.userId || '',
      customerId: data?.customerId || '',
      make: data?.make || '',
      model: data?.model || '',
      year: data?.year || null,
      licensePlate: data?.licensePlate || '',
      vin: data?.vin || null,
      color: data?.color || null,
      notes: data?.notes || null,
      customerName: data?.customerName || undefined,
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  },
};
