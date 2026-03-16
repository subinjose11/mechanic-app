// Auth controller - handles authentication operations
import { authStore } from '@stores/AuthStore';
import { uiStore } from '@stores/UIStore';
import { rootStore } from '@stores/RootStore';
import { User, ShopProfile } from '@models/User';

class AuthController {
  private static instance: AuthController;

  private constructor() {}

  static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  // Get current user
  get currentUser(): User | null {
    return authStore.user;
  }

  // Get user ID
  get userId(): string | null {
    return authStore.userId;
  }

  // Check if authenticated
  get isAuthenticated(): boolean {
    return authStore.isAuthenticated;
  }

  // Check if loading
  get isLoading(): boolean {
    return authStore.isLoading;
  }

  // Check if shop setup is needed
  get needsShopSetup(): boolean {
    return authStore.needsShopSetup;
  }

  // Initialize auth (call on app start)
  initialize(): void {
    authStore.initialize();
  }

  // Login
  async login(email: string, password: string): Promise<void> {
    uiStore.startOperation('auth-login');
    try {
      await authStore.login(email, password);

      // Subscribe to user data after login
      if (authStore.userId) {
        rootStore.subscribeToUserData(authStore.userId);
      }

      uiStore.showToast('success', 'Welcome back!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      uiStore.showToast('error', message);
      throw error;
    } finally {
      uiStore.endOperation('auth-login');
    }
  }

  // Register
  async register(email: string, password: string, name: string): Promise<void> {
    uiStore.startOperation('auth-register');
    try {
      await authStore.register(email, password, name);
      uiStore.showToast('success', 'Account created successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      uiStore.showToast('error', message);
      throw error;
    } finally {
      uiStore.endOperation('auth-register');
    }
  }

  // Logout
  async logout(): Promise<void> {
    uiStore.startOperation('auth-logout');
    try {
      // Reset all stores before logout
      rootStore.resetAll();
      await authStore.logout();
      uiStore.showToast('info', 'Logged out successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      uiStore.showToast('error', message);
      throw error;
    } finally {
      uiStore.endOperation('auth-logout');
    }
  }

  // Delete account and all user data
  async deleteAccount(): Promise<void> {
    uiStore.startOperation('auth-delete');
    try {
      // Reset all stores before deletion
      rootStore.resetAll();
      await authStore.deleteAccount();
      uiStore.showToast('info', 'Account deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account deletion failed';
      uiStore.showToast('error', message);
      throw error;
    } finally {
      uiStore.endOperation('auth-delete');
    }
  }

  // Update shop profile
  async updateShopProfile(profile: ShopProfile): Promise<void> {
    uiStore.startOperation('auth-shop-profile');
    try {
      await authStore.updateShopProfile(
        profile.shopName,
        profile.shopPhone,
        profile.shopAddress
      );

      // Subscribe to user data after shop setup
      if (authStore.userId) {
        rootStore.subscribeToUserData(authStore.userId);
      }

      uiStore.showToast('success', 'Shop profile saved!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save shop profile';
      uiStore.showToast('error', message);
      throw error;
    } finally {
      uiStore.endOperation('auth-shop-profile');
    }
  }

  // Update user profile
  async updateProfile(updates: { name?: string; phone?: string }): Promise<void> {
    uiStore.startOperation('auth-profile');
    try {
      await authStore.updateProfile(updates);
      uiStore.showToast('success', 'Profile updated!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      uiStore.showToast('error', message);
      throw error;
    } finally {
      uiStore.endOperation('auth-profile');
    }
  }

  // Clear error
  clearError(): void {
    authStore.clearError();
  }
}

// Export singleton instance
export const authController = AuthController.getInstance();
export { AuthController };
