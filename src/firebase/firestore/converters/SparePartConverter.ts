// Firestore converter for SparePart documents (native SDK)
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { SparePart } from '@models/SparePart';
import { NativeFirestoreConverter } from '../FirestoreService';

export const sparePartConverter: NativeFirestoreConverter<SparePart> = {
  toFirestore(part: Omit<SparePart, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      serviceOrderId: part.serviceOrderId,
      partName: part.partName,
      partNumber: part.partNumber,
      quantity: part.quantity,
      unitPrice: part.unitPrice,
      total: part.total,
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): SparePart {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      serviceOrderId: data?.serviceOrderId || '',
      partName: data?.partName || '',
      partNumber: data?.partNumber || null,
      quantity: data?.quantity || 0,
      unitPrice: data?.unitPrice || 0,
      total: data?.total || 0,
    };
  },
};
