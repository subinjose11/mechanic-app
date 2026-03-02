import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './SupabaseClient';
import { PhotoType } from '@core/constants';
import { storageService } from '@services/storage/SupabaseStorageService';

type PhotoRow = Database['public']['Tables']['photos']['Row'];
type PhotoInsert = Database['public']['Tables']['photos']['Insert'];
type PhotoUpdate = Database['public']['Tables']['photos']['Update'];

export class PhotoRemoteDataSource {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<PhotoRow[]> {
    const { data, error } = await this.supabase
      .from('photos')
      .select('*')
      .order('captured_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<PhotoRow | null> {
    const { data, error } = await this.supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(photo: PhotoInsert): Promise<PhotoRow> {
    const { data, error } = await this.supabase
      .from('photos')
      .insert(photo as any)
      .select()
      .single();

    if (error) throw error;
    return data as PhotoRow;
  }

  async update(id: string, updates: PhotoUpdate): Promise<PhotoRow> {
    const { data, error } = await this.supabase
      .from('photos')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PhotoRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('photos').delete().eq('id', id);
    if (error) throw error;
  }

  async getByServiceOrderId(serviceOrderId: string): Promise<PhotoRow[]> {
    const { data, error } = await this.supabase
      .from('photos')
      .select('*')
      .eq('service_order_id', serviceOrderId)
      .order('captured_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getByServiceOrderIdAndType(serviceOrderId: string, type: PhotoType): Promise<PhotoRow[]> {
    const { data, error } = await this.supabase
      .from('photos')
      .select('*')
      .eq('service_order_id', serviceOrderId)
      .eq('photo_type', type)
      .order('captured_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async uploadAndCreate(
    serviceOrderId: string,
    localUri: string,
    type: PhotoType,
    description?: string
  ): Promise<PhotoRow> {
    // Upload to storage
    const { url, path } = await storageService.uploadOrderPhoto(localUri, serviceOrderId, type);

    // Create database record
    const photo = await this.create({
      service_order_id: serviceOrderId,
      photo_url: url,
      photo_type: type,
      description: description || null,
      captured_at: new Date().toISOString(),
    });

    return photo;
  }

  async deleteWithStorage(id: string): Promise<void> {
    // Get the photo to find the storage path
    const photo = await this.getById(id);
    if (!photo) return;

    // Extract path from URL and delete from storage
    try {
      const url = new URL(photo.photo_url);
      const pathParts = url.pathname.split('/');
      const storagePath = pathParts.slice(pathParts.indexOf('service-photos') + 1).join('/');
      await storageService.deleteOrderPhoto(storagePath);
    } catch (err) {
      console.error('Error deleting photo from storage:', err);
    }

    // Delete database record
    await this.delete(id);
  }
}
