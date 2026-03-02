import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { User, UserLogin, UserRegistration, ShopProfile } from '@domain/entities/User';
import { AuthRemoteDataSource, ProfileRow } from '@data/datasources/remote/AuthRemoteDataSource';

export class AuthRepositoryImpl implements IAuthRepository {
  constructor(private dataSource: AuthRemoteDataSource) {}

  private mapProfileToUser(profile: ProfileRow): User {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      shopName: profile.shop_name,
      shopPhone: profile.shop_phone,
      shopAddress: profile.shop_address,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    };
  }

  async login(credentials: UserLogin): Promise<User> {
    const authData = await this.dataSource.signIn(credentials.email, credentials.password);
    if (!authData.user) throw new Error('Login failed');

    const profile = await this.dataSource.getProfile(authData.user.id);
    if (!profile) throw new Error('Profile not found');

    return this.mapProfileToUser(profile);
  }

  async register(data: UserRegistration): Promise<User> {
    const authData = await this.dataSource.signUp(data.email, data.password, data.name);
    if (!authData.user) throw new Error('Registration failed');

    // Wait a moment for the profile to be created
    await new Promise((resolve) => setTimeout(resolve, 500));

    const profile = await this.dataSource.getProfile(authData.user.id);
    if (!profile) {
      // Profile might not be created yet, return minimal user
      return {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        phone: null,
        shopName: null,
        shopPhone: null,
        shopAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return this.mapProfileToUser(profile);
  }

  async logout(): Promise<void> {
    await this.dataSource.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.dataSource.getSession();
    if (!session?.user) return null;

    const profile = await this.dataSource.getProfile(session.user.id);
    if (!profile) return null;

    return this.mapProfileToUser(profile);
  }

  async refreshSession(): Promise<User | null> {
    return this.getCurrentUser();
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const session = await this.dataSource.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const updates: Partial<ProfileRow> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.shopName !== undefined) updates.shop_name = data.shopName;
    if (data.shopPhone !== undefined) updates.shop_phone = data.shopPhone;
    if (data.shopAddress !== undefined) updates.shop_address = data.shopAddress;

    const profile = await this.dataSource.updateProfile(session.user.id, updates);
    return this.mapProfileToUser(profile);
  }

  async updateShopProfile(shopProfile: ShopProfile): Promise<User> {
    const session = await this.dataSource.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const profile = await this.dataSource.updateProfile(session.user.id, {
      shop_name: shopProfile.shopName,
      shop_phone: shopProfile.shopPhone,
      shop_address: shopProfile.shopAddress,
    });

    return this.mapProfileToUser(profile);
  }

  async resetPassword(email: string): Promise<void> {
    await this.dataSource.resetPassword(email);
  }

  async updatePassword(newPassword: string): Promise<void> {
    await this.dataSource.updatePassword(newPassword);
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return this.dataSource.onAuthStateChange(async (session) => {
      if (!session?.user) {
        callback(null);
        return;
      }

      try {
        const profile = await this.dataSource.getProfile(session.user.id);
        if (profile) {
          callback(this.mapProfileToUser(profile));
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error fetching profile on auth state change:', error);
        callback(null);
      }
    });
  }
}
