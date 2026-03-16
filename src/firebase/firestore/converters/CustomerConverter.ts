// Firestore converter for Customer documents (native SDK)
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Customer } from '@models/Customer';
import { NativeFirestoreConverter } from '../FirestoreService';

export const customerConverter: NativeFirestoreConverter<Customer> = {
  toFirestore(customer: Omit<Customer, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      userId: customer.userId,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      createdAt: firestore.Timestamp.fromDate(customer.createdAt),
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): Customer {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data?.userId || '',
      name: data?.name || '',
      phone: data?.phone || null,
      email: data?.email || null,
      address: data?.address || null,
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  },
};
