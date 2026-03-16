// Firestore converter for Payment documents (native SDK)
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Payment } from '@models/Payment';
import { NativeFirestoreConverter } from '../FirestoreService';

export const paymentConverter: NativeFirestoreConverter<Payment> = {
  toFirestore(payment: Omit<Payment, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      serviceOrderId: payment.serviceOrderId,
      amount: payment.amount,
      paymentType: payment.paymentType,
      paymentMethod: payment.paymentMethod,
      date: firestore.Timestamp.fromDate(payment.date),
      notes: payment.notes,
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): Payment {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      serviceOrderId: data?.serviceOrderId || '',
      amount: data?.amount || 0,
      paymentType: data?.paymentType || 'advance',
      paymentMethod: data?.paymentMethod || 'cash',
      date: data?.date?.toDate() || new Date(),
      notes: data?.notes || null,
    };
  },
};
