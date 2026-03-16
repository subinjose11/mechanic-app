// Generic Firestore CRUD operations using native Firebase SDK
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

// Generic document type with id
export interface FirestoreDocument {
  id: string;
}

// Query filter options
export interface QueryOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
  startAfterDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot;
}

// Filter condition
export interface FilterCondition {
  field: string;
  operator: '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
  value: unknown;
}

// Converter interface for native Firestore
export interface NativeFirestoreConverter<T> {
  toFirestore: (data: Omit<T, 'id'>) => FirebaseFirestoreTypes.DocumentData;
  fromFirestore: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => T;
}

class FirestoreService {
  private static instance: FirestoreService;

  private constructor() {}

  static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  // Get a collection reference
  getCollection(path: string): FirebaseFirestoreTypes.CollectionReference {
    return firestore().collection(path);
  }

  // Get a document reference
  getDocRef(collectionPath: string, docId: string): FirebaseFirestoreTypes.DocumentReference {
    return firestore().collection(collectionPath).doc(docId);
  }

  // Get a single document by ID
  async getById<T extends FirestoreDocument>(
    collectionPath: string,
    id: string,
    converter?: NativeFirestoreConverter<T>
  ): Promise<T | null> {
    const docRef = firestore().collection(collectionPath).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
      if (converter) {
        return converter.fromFirestore(docSnap);
      }
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  // Get all documents from a collection with optional filters
  async getAll<T extends FirestoreDocument>(
    collectionPath: string,
    filters: FilterCondition[] = [],
    options: QueryOptions = {},
    converter?: NativeFirestoreConverter<T>
  ): Promise<T[]> {
    let query: FirebaseFirestoreTypes.Query = firestore().collection(collectionPath);

    // Add filter conditions
    for (const filter of filters) {
      query = query.where(
        filter.field,
        filter.operator as FirebaseFirestoreTypes.WhereFilterOp,
        filter.value
      );
    }

    // Add ordering
    if (options.orderByField) {
      query = query.orderBy(options.orderByField, options.orderDirection || 'asc');
    }

    // Add pagination
    if (options.startAfterDoc) {
      query = query.startAfter(options.startAfterDoc);
    }

    // Add limit
    if (options.limitCount) {
      query = query.limit(options.limitCount);
    }

    const querySnapshot = await query.get();

    return querySnapshot.docs.map((docSnap) => {
      if (converter) {
        return converter.fromFirestore(docSnap);
      }
      return { id: docSnap.id, ...docSnap.data() } as T;
    });
  }

  // Create a new document (auto-generated ID)
  async create<T extends FirestoreDocument>(
    collectionPath: string,
    data: Omit<T, 'id'>,
    converter?: NativeFirestoreConverter<T>
  ): Promise<T> {
    const collectionRef = firestore().collection(collectionPath);
    const dataToSave = converter ? converter.toFirestore(data) : data;
    const docRef = await collectionRef.add(dataToSave);
    return { ...data, id: docRef.id } as T;
  }

  // Create a document with a specific ID
  async createWithId<T extends FirestoreDocument>(
    collectionPath: string,
    id: string,
    data: Omit<T, 'id'>,
    converter?: NativeFirestoreConverter<T>
  ): Promise<T> {
    const docRef = firestore().collection(collectionPath).doc(id);
    const dataToSave = converter ? converter.toFirestore(data) : data;
    await docRef.set(dataToSave);
    return { ...data, id } as T;
  }

  // Update an existing document
  async update<T extends FirestoreDocument>(
    collectionPath: string,
    id: string,
    data: Partial<Omit<T, 'id'>>
  ): Promise<void> {
    const docRef = firestore().collection(collectionPath).doc(id);
    await docRef.update(data as FirebaseFirestoreTypes.DocumentData);
  }

  // Delete a document
  async delete(collectionPath: string, id: string): Promise<void> {
    const docRef = firestore().collection(collectionPath).doc(id);
    await docRef.delete();
  }

  // Subscribe to a single document
  subscribeToDocument<T extends FirestoreDocument>(
    collectionPath: string,
    id: string,
    callback: (data: T | null) => void,
    converter?: NativeFirestoreConverter<T>
  ): () => void {
    const docRef = firestore().collection(collectionPath).doc(id);

    return docRef.onSnapshot(
      (docSnap) => {
        if (docSnap && docSnap.exists()) {
          if (converter) {
            callback(converter.fromFirestore(docSnap));
          } else {
            callback({ id: docSnap.id, ...docSnap.data() } as T);
          }
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Firestore document subscription error:', error);
        callback(null);
      }
    );
  }

  // Subscribe to a collection with optional filters
  subscribeToCollection<T extends FirestoreDocument>(
    collectionPath: string,
    callback: (data: T[]) => void,
    filters: FilterCondition[] = [],
    options: QueryOptions = {},
    converter?: NativeFirestoreConverter<T>
  ): () => void {
    let query: FirebaseFirestoreTypes.Query = firestore().collection(collectionPath);

    for (const filter of filters) {
      query = query.where(
        filter.field,
        filter.operator as FirebaseFirestoreTypes.WhereFilterOp,
        filter.value
      );
    }

    if (options.orderByField) {
      query = query.orderBy(options.orderByField, options.orderDirection || 'asc');
    }

    if (options.limitCount) {
      query = query.limit(options.limitCount);
    }

    return query.onSnapshot(
      (querySnapshot) => {
        if (!querySnapshot) {
          callback([]);
          return;
        }
        const data = querySnapshot.docs.map((docSnap) => {
          if (converter) {
            return converter.fromFirestore(docSnap);
          }
          return { id: docSnap.id, ...docSnap.data() } as T;
        });
        callback(data);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        callback([]);
      }
    );
  }

  // Batch operations
  createBatch(): FirebaseFirestoreTypes.WriteBatch {
    return firestore().batch();
  }

  // Utility: Convert Date to Firestore Timestamp
  dateToTimestamp(date: Date): FirebaseFirestoreTypes.Timestamp {
    return firestore.Timestamp.fromDate(date);
  }

  // Utility: Convert Firestore Timestamp to Date
  timestampToDate(timestamp: FirebaseFirestoreTypes.Timestamp): Date {
    return timestamp.toDate();
  }

  // Utility: Get server timestamp
  serverTimestamp(): FirebaseFirestoreTypes.FieldValue {
    return firestore.FieldValue.serverTimestamp();
  }

  // Delete all documents in a subcollection
  async deleteSubcollection(
    parentPath: string,
    subcollectionName: string
  ): Promise<void> {
    const subcollectionRef = firestore().collection(`${parentPath}/${subcollectionName}`);
    const snapshot = await subcollectionRef.get();

    const batch = firestore().batch();
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }
}

// Export singleton instance
export const firestoreService = FirestoreService.getInstance();

// Export class for testing/extension
export { FirestoreService };

// Re-export Timestamp for convenience
export const Timestamp = firestore.Timestamp;
export const FieldValue = firestore.FieldValue;
