import { User, UserLogin, UserRegistration, ShopProfile } from '@domain/entities/User';

export interface IAuthRepository {
  // Authentication
  login(credentials: UserLogin): Promise<User>;
  register(data: UserRegistration): Promise<User>;
  logout(): Promise<void>;

  // Session management
  getCurrentUser(): Promise<User | null>;
  refreshSession(): Promise<User | null>;

  // Profile management
  updateProfile(data: Partial<User>): Promise<User>;
  updateShopProfile(shopProfile: ShopProfile): Promise<User>;

  // Password management
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;

  // Session state listener
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
