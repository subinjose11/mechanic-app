import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@core/config/env';

// Database types for type safety
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          shop_name: string | null;
          shop_phone: string | null;
          shop_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          shop_name?: string | null;
          shop_phone?: string | null;
          shop_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          shop_name?: string | null;
          shop_phone?: string | null;
          shop_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          make: string;
          model: string;
          year: number | null;
          license_plate: string;
          vin: string | null;
          color: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id: string;
          make: string;
          model: string;
          year?: number | null;
          license_plate: string;
          vin?: string | null;
          color?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string;
          make?: string;
          model?: string;
          year?: number | null;
          license_plate?: string;
          vin?: string | null;
          color?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      service_orders: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          customer_id: string;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          description: string | null;
          notes: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_id: string;
          customer_id: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          description?: string | null;
          notes?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          vehicle_id?: string;
          customer_id?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          description?: string | null;
          notes?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      labor_items: {
        Row: {
          id: string;
          service_order_id: string;
          description: string;
          hours: number;
          rate_per_hour: number;
          total: number;
        };
        Insert: {
          id?: string;
          service_order_id: string;
          description: string;
          hours: number;
          rate_per_hour: number;
          // total is a generated column, don't include in insert
        };
        Update: {
          id?: string;
          service_order_id?: string;
          description?: string;
          hours?: number;
          rate_per_hour?: number;
          // total is a generated column, don't include in update
        };
      };
      spare_parts: {
        Row: {
          id: string;
          service_order_id: string;
          part_name: string;
          part_number: string | null;
          quantity: number;
          unit_price: number;
          total: number;
        };
        Insert: {
          id?: string;
          service_order_id: string;
          part_name: string;
          part_number?: string | null;
          quantity: number;
          unit_price: number;
          // total is a generated column, don't include in insert
        };
        Update: {
          id?: string;
          service_order_id?: string;
          part_name?: string;
          part_number?: string | null;
          quantity?: number;
          unit_price?: number;
          // total is a generated column, don't include in update
        };
      };
      payments: {
        Row: {
          id: string;
          service_order_id: string;
          amount: number;
          payment_type: 'advance' | 'final';
          payment_method: 'cash' | 'card' | 'upi';
          date: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          service_order_id: string;
          amount: number;
          payment_type: 'advance' | 'final';
          payment_method: 'cash' | 'card' | 'upi';
          date?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          service_order_id?: string;
          amount?: number;
          payment_type?: 'advance' | 'final';
          payment_method?: 'cash' | 'card' | 'upi';
          date?: string;
          notes?: string | null;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          vehicle_id: string;
          scheduled_date: string;
          scheduled_time: string;
          duration_minutes: number;
          service_type: string;
          status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id: string;
          vehicle_id: string;
          scheduled_date: string;
          scheduled_time: string;
          duration_minutes?: number;
          service_type: string;
          status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string;
          vehicle_id?: string;
          scheduled_date?: string;
          scheduled_time?: string;
          duration_minutes?: number;
          service_type?: string;
          status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
          notes?: string | null;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          service_order_id: string;
          photo_url: string;
          photo_type: 'before' | 'after' | 'damage';
          description: string | null;
          captured_at: string;
        };
        Insert: {
          id?: string;
          service_order_id: string;
          photo_url: string;
          photo_type: 'before' | 'after' | 'damage';
          description?: string | null;
          captured_at?: string;
        };
        Update: {
          id?: string;
          service_order_id?: string;
          photo_url?: string;
          photo_type?: 'before' | 'after' | 'damage';
          description?: string | null;
          captured_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category: 'rent' | 'utilities' | 'supplies' | 'salaries' | 'maintenance' | 'other';
          amount: number;
          description: string | null;
          date: string;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: 'rent' | 'utilities' | 'supplies' | 'salaries' | 'maintenance' | 'other';
          amount: number;
          description?: string | null;
          date: string;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: 'rent' | 'utilities' | 'supplies' | 'salaries' | 'maintenance' | 'other';
          amount?: number;
          description?: string | null;
          date?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      parts_inventory: {
        Row: {
          id: string;
          user_id: string;
          part_name: string;
          part_number: string | null;
          barcode: string | null;
          quantity_in_stock: number;
          unit_price: number;
          reorder_level: number;
          supplier: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          part_name: string;
          part_number?: string | null;
          barcode?: string | null;
          quantity_in_stock: number;
          unit_price: number;
          reorder_level?: number;
          supplier?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          part_name?: string;
          part_number?: string | null;
          barcode?: string | null;
          quantity_in_stock?: number;
          unit_price?: number;
          reorder_level?: number;
          supplier?: string | null;
        };
      };
      vehicle_qr_codes: {
        Row: {
          id: string;
          vehicle_id: string;
          qr_code_data: string;
          generated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          qr_code_data: string;
          generated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          qr_code_data?: string;
          generated_at?: string;
        };
      };
    };
  };
}

class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;

  private constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }
}

export const supabase = SupabaseService.getInstance().getClient();
export default supabase;
