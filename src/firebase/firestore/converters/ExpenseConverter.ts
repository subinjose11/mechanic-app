// Firestore converter for Expense documents (native SDK)
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Expense } from '@models/Expense';
import { NativeFirestoreConverter } from '../FirestoreService';

export const expenseConverter: NativeFirestoreConverter<Expense> = {
  toFirestore(expense: Omit<Expense, 'id'>): FirebaseFirestoreTypes.DocumentData {
    return {
      userId: expense.userId,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: firestore.Timestamp.fromDate(expense.date),
      receiptUrl: expense.receiptUrl,
      receiptStoragePath: expense.receiptStoragePath,
      createdAt: firestore.Timestamp.fromDate(expense.createdAt),
    };
  },

  fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot): Expense {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data?.userId || '',
      category: data?.category || 'other',
      amount: data?.amount || 0,
      description: data?.description || null,
      date: data?.date?.toDate() || new Date(),
      receiptUrl: data?.receiptUrl || null,
      receiptStoragePath: data?.receiptStoragePath || null,
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  },
};
