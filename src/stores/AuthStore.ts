// Auth state store - manages user authentication state
import { makeAutoObservable, runInAction } from 'mobx';
import { User, isShopProfileComplete } from '@models/User';
import { authService } from '@firebaseServices/auth/AuthService';
import { googleAuthService } from '@firebaseServices/auth/GoogleAuthService';
// NOTE: Do NOT import from 'firebase/auth' here - it causes initialization issues

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

class AuthStore {
  user: User | null = null;
  status: AuthStatus = 'idle';
  error: string | null = null;
  isInitialized: boolean = false;

  private unsubscribeAuth: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed properties
  get isAuthenticated(): boolean {
    return this.status === 'authenticated' && this.user !== null;
  }

  get isLoading(): boolean {
    return this.status === 'loading';
  }

  get needsShopSetup(): boolean {
    return this.user !== null && !isShopProfileComplete(this.user);
  }

  get userId(): string | null {
    return this.user?.id || null;
  }

  // Initialize auth listener
  async initialize() {
    if (this.isInitialized) return;

    runInAction(() => {
      this.status = 'loading';
    });

    try {
      // Subscribe to auth state changes
      this.unsubscribeAuth = authService.onAuthStateChanged(this.handleAuthStateChange);
      runInAction(() => {
        this.isInitialized = true;
      });
      console.log('Auth listener initialized successfully');
    } catch (error) {
      console.error('Auth initialization failed:', error);
      runInAction(() => {
        this.status = 'unauthenticated';
        this.isInitialized = true;
      });
    }
  }

  // Handle Firebase auth state changes (firebaseUser is any to avoid importing firebase/auth types)
  private handleAuthStateChange = async (firebaseUser: any | null) => {
    if (firebaseUser) {
      try {
        const user = await authService.getUserById(firebaseUser.uid);
        runInAction(() => {
          this.user = user;
          this.status = 'authenticated';
          this.error = null;
        });
      } catch (err) {
        runInAction(() => {
          this.user = null;
          this.status = 'unauthenticated';
          this.error = 'Failed to load user data';
        });
      }
    } else {
      runInAction(() => {
        this.user = null;
        this.status = 'unauthenticated';
        this.error = null;
      });
    }
  };

  // Login
  async login(email: string, password: string): Promise<void> {
    this.status = 'loading';
    this.error = null;

    try {
      const user = await authService.login({ email, password });
      runInAction(() => {
        this.user = user;
        this.status = 'authenticated';
      });
    } catch (err) {
      runInAction(() => {
        this.status = 'unauthenticated';
        this.error = err instanceof Error ? err.message : 'Login failed';
      });
      throw err;
    }
  }

  // Register
  async register(email: string, password: string, name: string): Promise<void> {
    this.status = 'loading';
    this.error = null;

    try {
      const user = await authService.register({ email, password, name });
      runInAction(() => {
        this.user = user;
        this.status = 'authenticated';
      });
    } catch (err) {
      runInAction(() => {
        this.status = 'unauthenticated';
        this.error = err instanceof Error ? err.message : 'Registration failed';
      });
      throw err;
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<void> {
    this.status = 'loading';
    this.error = null;

    try {
      const user = await googleAuthService.signIn();
      runInAction(() => {
        this.user = user;
        this.status = 'authenticated';
      });
    } catch (err) {
      runInAction(() => {
        this.status = 'unauthenticated';
        this.error = err instanceof Error ? err.message : 'Google Sign-In failed';
      });
      throw err;
    }
  }

  // Logout
  async logout(): Promise<void> {
    this.status = 'loading';

    try {
      // Sign out from both Firebase and Google
      await Promise.all([
        authService.logout(),
        googleAuthService.signOut(),
      ]);
      runInAction(() => {
        this.user = null;
        this.status = 'unauthenticated';
        this.error = null;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Logout failed';
        this.status = 'authenticated'; // Revert to authenticated if logout fails
      });
      throw err;
    }
  }

  // Delete account and all user data
  async deleteAccount(): Promise<void> {
    if (!this.user) throw new Error('No user logged in');

    this.status = 'loading';

    try {
      // Delete all user data and Firebase Auth account
      await authService.deleteAccount(this.user.id);

      // Also sign out from Google if needed
      await googleAuthService.signOut();

      runInAction(() => {
        this.user = null;
        this.status = 'unauthenticated';
        this.error = null;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Account deletion failed';
        this.status = 'authenticated'; // Revert to authenticated if deletion fails
      });
      throw err;
    }
  }

  // Update shop profile
  async updateShopProfile(shopName: string, shopPhone: string, shopAddress: string): Promise<void> {
    if (!this.user) throw new Error('No user logged in');

    try {
      await authService.updateShopProfile(this.user.id, {
        shopName,
        shopPhone,
        shopAddress,
      });

      runInAction(() => {
        if (this.user) {
          this.user = {
            ...this.user,
            shopName,
            shopPhone,
            shopAddress,
            updatedAt: new Date(),
          };
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update shop profile';
      runInAction(() => {
        this.error = errorMessage;
      });
      throw err;
    }
  }

  // Update user profile
  async updateProfile(updates: { name?: string; phone?: string }): Promise<void> {
    if (!this.user) throw new Error('No user logged in');

    try {
      await authService.updateUserProfile(this.user.id, updates);

      runInAction(() => {
        if (this.user) {
          this.user = {
            ...this.user,
            ...updates,
            updatedAt: new Date(),
          };
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      runInAction(() => {
        this.error = errorMessage;
      });
      throw err;
    }
  }

  // Clear error
  clearError() {
    this.error = null;
  }

  // Cleanup
  dispose() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    this.isInitialized = false;
  }

  // Reset store
  reset() {
    this.user = null;
    this.status = 'idle';
    this.error = null;
  }
}

export const authStore = new AuthStore();
export { AuthStore };
