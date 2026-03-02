import { Photo, CreatePhotoInput } from '@domain/entities/Photo';
import { Database } from '@data/datasources/remote/SupabaseClient';
import { PhotoType } from '@core/constants';

type PhotoRow = Database['public']['Tables']['photos']['Row'];
type PhotoInsert = Database['public']['Tables']['photos']['Insert'];
type PhotoUpdate = Database['public']['Tables']['photos']['Update'];

export class PhotoMapper {
  static toDomain(row: PhotoRow): Photo {
    return {
      id: row.id,
      serviceOrderId: row.service_order_id,
      photoUrl: row.photo_url,
      photoType: row.photo_type as PhotoType,
      description: row.description,
      capturedAt: new Date(row.captured_at),
    };
  }

  static toInsert(input: CreatePhotoInput): PhotoInsert {
    return {
      service_order_id: input.serviceOrderId,
      photo_url: input.photoUrl,
      photo_type: input.photoType,
      description: input.description || null,
      captured_at: new Date().toISOString(),
    };
  }

  static toUpdate(input: Partial<CreatePhotoInput>): PhotoUpdate {
    const update: PhotoUpdate = {};
    if (input.photoType !== undefined) update.photo_type = input.photoType;
    if (input.description !== undefined) update.description = input.description || null;
    return update;
  }
}
