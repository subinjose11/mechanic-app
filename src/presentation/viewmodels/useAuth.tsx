import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, UserLogin, UserRegistration, ShopProfile } from '@domain/entities/User';
import { supabase } from '@data/datasources/remote/SupabaseClient';
import { Session } from '@supabase/supabase-js';

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  shop_name: string | null;
  shop_phone: string | null;
  shop_address: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (data: UserRegistration) => Promise<void>;
  logout: () => Promise<void>;
  updateShopProfile: (profile: ShopProfile) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapSessionToUser = useCallback(async (session: Session | null): Promise<User | null> => {
    if (!session?.user) return null;

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const profile = data as ProfileData | null;

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: profile?.name || null,
      phone: profile?.phone || null,
      shopName: profile?.shop_name || null,
      shopPhone: profile?.shop_phone || null,
      shopAddress: profile?.shop_address || null,
      createdAt: new Date(profile?.created_at || session.user.created_at),
      updatedAt: new Date(profile?.updated_at || session.user.created_at),
    };
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const mappedUser = await mapSessionToUser(session);
      setUser(mappedUser);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const mappedUser = await mapSessionToUser(session);
      setUser(mappedUser);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [mapSessionToUser]);

  const login = useCallback(async (credentials: UserLogin) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) throw authError;

      const mappedUser = await mapSessionToUser(data.session);
      setUser(mappedUser);
      setSession(data.session);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mapSessionToUser]);

  const register = useCallback(async (data: UserRegistration) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (authError) throw authError;

      // Create profile record
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
          } as any);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      const mappedUser = await mapSessionToUser(authData.session);
      setUser(mappedUser);
      setSession(authData.session);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mapSessionToUser]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      setUser(null);
      setSession(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateShopProfile = useCallback(async (profile: ShopProfile) => {
    if (!user) throw new Error('No user logged in');
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          shop_name: profile.shopName,
          shop_phone: profile.shopPhone,
          shop_address: profile.shopAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({
        ...user,
        shopName: profile.shopName,
        shopPhone: profile.shopPhone,
        shopAddress: profile.shopAddress,
        updatedAt: new Date(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update shop profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    setIsLoading(true);
    setError(null);
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.shopName !== undefined) updateData.shop_name = data.shopName;
      if (data.shopPhone !== undefined) updateData.shop_phone = data.shopPhone;
      if (data.shopAddress !== undefined) updateData.shop_address = data.shopAddress;

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({
        ...user,
        ...data,
        updatedAt: new Date(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    updateShopProfile,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
