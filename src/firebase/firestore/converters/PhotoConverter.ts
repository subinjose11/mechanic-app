// Firestore converter for Photo documents (native SDK)
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Photo } from '@models/Photo';
import { NativeFirestoreConverter } from '../FirestoreService';

export const photoConverter: NativeFirestoreConverter<Photo> = {
  toFirestore(photo: Omit<Photo, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      serviceOrderId: photo.serviceOrderId,
      photoUrl: photo.photoUrl,
      storagePath: photo.storagePath,
      photoType: photo.photoType,
      description: photo.description,
      capturedAt: firestore.Timestamp.fromDate(photo.capturedAt),
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): Photo {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      serviceOrderId: data?.serviceOrderId || '',
      photoUrl: data?.photoUrl || '',
      storagePath: data?.storagePath || '',
      photoType: data?.photoType || 'before',
      description: data?.description || null,
      capturedAt: data?.capturedAt?.toDate() || new Date(),
    };
  },
};
