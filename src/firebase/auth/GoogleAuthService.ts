// Google Authentication Service
// Using @react-native-firebase for all Firebase operations (native SDK)
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../firestore/collections';
import { User } from '@models/User';

// Web client ID from google-services.json (client_type: 3)
const WEB_CLIENT_ID = '952319453783-6eq2kp5kldii9i5r48vkacncqj6v05b5.apps.googleusercontent.com';

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isConfigured = false;

  private constructor() {}

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  // Configure Google Sign-In (call this once at app startup)
  configure() {
    if (this.isConfigured) return;

    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
    });

    this.isConfigured = true;
  }

  // Sign in with Google
  async signIn(): Promise<User> {
    try {
      // Ensure configured
      this.configure();

      // Check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in with Google
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        throw new Error('Google Sign-In was cancelled');
      }

      const { data } = response;
      const idToken = data.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Create Firebase credential (native)
      const credential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase (native)
      const userCredential = await auth().signInWithCredential(credential);
      const firebaseUser = userCredential.user;

      // Check if user exists in Firestore (native SDK)
      const userDoc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(firebaseUser.uid)
        .get();

      if (userDoc.exists()) {
        // User exists, return existing data
        const existingData = userDoc.data();
        if (existingData) {
          return {
            id: userDoc.id,
            email: existingData.email,
            name: existingData.name,
            phone: existingData.phone,
            shopName: existingData.shopName,
            shopPhone: existingData.shopPhone,
            shopAddress: existingData.shopAddress,
            createdAt: existingData.createdAt?.toDate() || new Date(),
            updatedAt: existingData.updatedAt?.toDate() || new Date(),
          };
        }
      }

      // New user - create Firestore document
      const now = firestore.Timestamp.now();
      const userData: Omit<User, 'id'> = {
        email: firebaseUser.email || data.user.email,
        name: firebaseUser.displayName || data.user.name || 'User',
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
    } catch (error: any) {
      console.log('Google Sign-In error:', error?.code, error?.message);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            throw new Error('Sign-in was cancelled');
          case statusCodes.IN_PROGRESS:
            throw new Error('Sign-in is already in progress');
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            throw new Error('Google Play Services not available');
          default:
            // Check for common permission errors
            if (error.message?.includes('permission') || error.message?.includes('PERMISSION')) {
              throw new Error('Please add a Google account to this device and ensure it is added as a test user in Firebase Console');
            }
            throw new Error(`Google Sign-In failed: ${error.message}`);
        }
      }

      // Handle Firebase auth errors
      if (error?.code?.startsWith('auth/')) {
        throw new Error(`Authentication failed: ${error.message}`);
      }

      throw error;
    }
  }

  // Sign out from Google
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.warn('Google sign out error:', error);
    }
  }

  // Check if user is signed in with Google
  async isSignedIn(): Promise<boolean> {
    return GoogleSignin.hasPreviousSignIn();
  }

  // Get current Google user
  async getCurrentUser() {
    return GoogleSignin.getCurrentUser();
  }
}

export const googleAuthService = GoogleAuthService.getInstance();
export { GoogleAuthService };
