// Firestore converter for LaborItem documents (native SDK)
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { LaborItem } from '@models/LaborItem';
import { NativeFirestoreConverter } from '../FirestoreService';

export const laborItemConverter: NativeFirestoreConverter<LaborItem> = {
  toFirestore(item: Omit<LaborItem, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      serviceOrderId: item.serviceOrderId,
      description: item.description,
      hours: item.hours,
      ratePerHour: item.ratePerHour,
      total: item.total,
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): LaborItem {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      serviceOrderId: data?.serviceOrderId || '',
      description: data?.description || '',
      hours: data?.hours || 0,
      ratePerHour: data?.ratePerHour || 0,
      total: data?.total || 0,
    };
  },
};
