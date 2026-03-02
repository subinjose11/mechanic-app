import { Photo, CreatePhotoInput, UpdatePhotoInput } from '@domain/entities/Photo';
import { PhotoType } from '@core/constants';

export interface IPhotoRepository {
  // CRUD operations
  getAll(): Promise<Photo[]>;
  getById(id: string): Promise<Photo | null>;
  create(data: CreatePhotoInput): Promise<Photo>;
  update(id: string, data: UpdatePhotoInput): Promise<Photo>;
  delete(id: string): Promise<void>;

  // Relationships
  getByServiceOrderId(serviceOrderId: string): Promise<Photo[]>;
  getByServiceOrderIdAndType(serviceOrderId: string, type: PhotoType): Promise<Photo[]>;

  // Upload
  uploadPhoto(
    serviceOrderId: string,
    imageUri: string,
    type: PhotoType,
    description?: string
  ): Promise<Photo>;

  // Delete from storage
  deleteWithStorage(id: string): Promise<void>;
}
