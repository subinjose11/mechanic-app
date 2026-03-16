// Firestore converter for ServiceOrder documents (native SDK)
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { ServiceOrder } from '@models/ServiceOrder';
import { NativeFirestoreConverter } from '../FirestoreService';

export const orderConverter: NativeFirestoreConverter<ServiceOrder> = {
  toFirestore(order: Omit<ServiceOrder, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      userId: order.userId,
      vehicleId: order.vehicleId,
      customerId: order.customerId,
      status: order.status,
      kmReading: order.kmReading,
      description: order.description,
      notes: order.notes,
      createdAt: firestore.Timestamp.fromDate(order.createdAt),
      completedAt: order.completedAt ? firestore.Timestamp.fromDate(order.completedAt) : null,
      // Denormalized fields
      customerName: order.customerName || null,
      vehicleMake: order.vehicleMake || null,
      vehicleModel: order.vehicleModel || null,
      vehicleLicensePlate: order.vehicleLicensePlate || null,
      // Computed totals
      totalLabor: order.totalLabor,
      totalParts: order.totalParts,
      totalAmount: order.totalAmount,
      totalPaid: order.totalPaid,
      balanceDue: order.balanceDue,
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): ServiceOrder {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data?.userId || '',
      vehicleId: data?.vehicleId || '',
      customerId: data?.customerId || '',
      status: data?.status || 'pending',
      kmReading: data?.kmReading || null,
      description: data?.description || null,
      notes: data?.notes || null,
      createdAt: data?.createdAt?.toDate() || new Date(),
      completedAt: data?.completedAt?.toDate() || null,
      // Denormalized fields
      customerName: data?.customerName || undefined,
      vehicleMake: data?.vehicleMake || undefined,
      vehicleModel: data?.vehicleModel || undefined,
      vehicleLicensePlate: data?.vehicleLicensePlate || undefined,
      // Computed totals
      totalLabor: data?.totalLabor || 0,
      totalParts: data?.totalParts || 0,
      totalAmount: data?.totalAmount || 0,
      totalPaid: data?.totalPaid || 0,
      balanceDue: data?.balanceDue || 0,
    };
  },
};
