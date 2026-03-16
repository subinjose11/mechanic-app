// Firestore converter for User documents (native SDK)
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { User } from '@models/User';
import { NativeFirestoreConverter } from '../FirestoreService';

export const userConverter: NativeFirestoreConverter<User> = {
  toFirestore(user: Omit<User, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      email: user.email,
      name: user.name,
      phone: user.phone,
      shopName: user.shopName,
      shopPhone: user.shopPhone,
      shopAddress: user.shopAddress,
      createdAt: firestore.Timestamp.fromDate(user.createdAt),
      updatedAt: firestore.Timestamp.fromDate(user.updatedAt),
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): User {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data?.email || '',
      name: data?.name || null,
      phone: data?.phone || null,
      shopName: data?.shopName || null,
      shopPhone: data?.shopPhone || null,
      shopAddress: data?.shopAddress || null,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  },
};
