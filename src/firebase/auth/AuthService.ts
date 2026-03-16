// Firebase Authentication Service
// Using @react-native-firebase for all Firebase operations (native SDK)
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../firestore/collections';
import { User, ShopProfile } from '@models/User';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Get the native auth instance
function getAuth() {
  return auth();
}

// Export for GoogleAuthService
export { getAuth };

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Get current Firebase user
  getCurrentFirebaseUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  // Register a new user
  async register(input: RegisterInput): Promise<User> {
    // Create Firebase Auth user (native)
    const userCredential = await auth().createUserWithEmailAndPassword(
      input.email,
      input.password
    );

    const firebaseUser = userCredential.user;

    // Update display name
    await firebaseUser.updateProfile({ displayName: input.name });

    // Create user document in Firestore (native SDK)
    const now = firestore.Timestamp.now();
    const userData: Omit<User, 'id'> = {
      email: input.email,
      name: input.name,
      phone: null,
      shopName: null,
      shopPhone: null,
      shopAddress: null,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };

    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(firebaseUser.uid)
      .set({
        ...userData,
        createdAt: now,
        updatedAt: now,
      });

    return {
      id: firebaseUser.uid,
      ...userData,
    };
  }

  // Login with email and password
  async login(input: LoginInput): Promise<User> {
    const userCredential = await auth().signInWithEmailAndPassword(
      input.email,
      input.password
    );

    const firebaseUser = userCredential.user;

    // Fetch user data from Firestore
    let user = await this.getUserById(firebaseUser.uid);

    // If user document doesn't exist, create it
    if (!user) {
      const now = firestore.Timestamp.now();
      const userData: Omit<User, 'id'> = {
        email: firebaseUser.email || input.email,
        name: firebaseUser.displayName || 'User',
        phone: null,
        shopName: null,
        shopPhone: null,
        shopAddress: null,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(firebaseUser.uid)
        .set({
          ...userData,
          createdAt: now,
          updatedAt: now,
        });

      user = {
        id: firebaseUser.uid,
        ...userData,
      };
    }

    return user;
  }

  // Logout
  async logout(): Promise<void> {
    await auth().signOut();
  }

  // Get user by ID from Firestore
  async getUserById(userId: string): Promise<User | null> {
    const userDoc = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .get();

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    if (!data) {
      return null;
    }

    return {
      id: userDoc.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      shopName: data.shopName,
      shopPhone: data.shopPhone,
      shopAddress: data.shopAddress,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  // Update shop profile
  async updateShopProfile(userId: string, profile: ShopProfile): Promise<void> {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .update({
        shopName: profile.shopName,
        shopPhone: profile.shopPhone,
        shopAddress: profile.shopAddress,
        updatedAt: firestore.Timestamp.now(),
      });
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: { name?: string; phone?: string }
  ): Promise<void> {
    // Update Firestore
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .update({
        ...updates,
        updatedAt: firestore.Timestamp.now(),
      });

    // Update Firebase Auth display name if name changed
    const currentUser = auth().currentUser;
    if (updates.name && currentUser) {
      await currentUser.updateProfile({ displayName: updates.name });
    }
  }

  // Update email
  async updateUserEmail(newEmail: string): Promise<void> {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // Update Firebase Auth
    await currentUser.updateEmail(newEmail);

    // Update Firestore
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(currentUser.uid)
      .update({
        email: newEmail,
        updatedAt: firestore.Timestamp.now(),
      });
  }

  // Update password
  async updateUserPassword(newPassword: string): Promise<void> {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      throw new Error('No user logged in');
    }

    await currentUser.updatePassword(newPassword);
  }

  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    await auth().sendPasswordResetEmail(email);
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void): () => void {
    return auth().onAuthStateChanged(callback);
  }

  // Check if user has completed shop setup
  async hasCompletedShopSetup(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    return !!(user.shopName && user.shopPhone && user.shopAddress);
  }

  // Delete user account and all associated data
  async deleteAccount(userId: string): Promise<void> {
    const db = firestore();
    const batch = db.batch();

    // Helper to delete collection documents for a user
    const deleteCollectionForUser = async (collectionName: string): Promise<void> => {
      const snapshot = await db
        .collection(collectionName)
        .where('userId', '==', userId)
        .get();

      // For orders, we need to delete subcollections first
      if (collectionName === COLLECTIONS.ORDERS) {
        for (const doc of snapshot.docs) {
          // Delete labor items subcollection
          const laborItems = await db
            .collection(COLLECTIONS.ORDERS)
            .doc(doc.id)
            .collection(COLLECTIONS.LABOR_ITEMS)
            .get();
          laborItems.docs.forEach((item) => batch.delete(item.ref));

          // Delete spare parts subcollection
          const spareParts = await db
            .collection(COLLECTIONS.ORDERS)
            .doc(doc.id)
            .collection(COLLECTIONS.SPARE_PARTS)
            .get();
          spareParts.docs.forEach((item) => batch.delete(item.ref));

          // Delete payments subcollection
          const payments = await db
            .collection(COLLECTIONS.ORDERS)
            .doc(doc.id)
            .collection(COLLECTIONS.PAYMENTS)
            .get();
          payments.docs.forEach((item) => batch.delete(item.ref));

          // Delete photos subcollection
          const photos = await db
            .collection(COLLECTIONS.ORDERS)
            .doc(doc.id)
            .collection(COLLECTIONS.PHOTOS)
            .get();
          photos.docs.forEach((item) => batch.delete(item.ref));
        }
      }

      // Delete main documents
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    };

    // Delete all user data from collections
    await deleteCollectionForUser(COLLECTIONS.ORDERS);
    await deleteCollectionForUser(COLLECTIONS.CUSTOMERS);
    await deleteCollectionForUser(COLLECTIONS.VEHICLES);
    await deleteCollectionForUser(COLLECTIONS.EXPENSES);
    await deleteCollectionForUser(COLLECTIONS.APPOINTMENTS);

    // Delete user document
    batch.delete(db.collection(COLLECTIONS.USERS).doc(userId));

    // Commit all deletions
    await batch.commit();

    // Delete Firebase Auth user
    const currentUser = auth().currentUser;
    if (currentUser && currentUser.uid === userId) {
      await currentUser.delete();
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export class for testing
export { AuthService };
