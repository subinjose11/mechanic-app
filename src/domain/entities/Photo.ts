import { PhotoType } from '@core/constants';

export interface Photo {
  id: string;
  serviceOrderId: string;
  photoUrl: string;
  photoType: PhotoType;
  description: string | null;
  capturedAt: Date;
}

export interface CreatePhotoInput {
  serviceOrderId: string;
  photoUrl: string;
  photoType: PhotoType;
  description?: string;
}

export interface UpdatePhotoInput {
  photoType?: PhotoType;
  description?: string;
}

export function getPhotosByType(photos: Photo[], type: PhotoType): Photo[] {
  return photos.filter((photo) => photo.photoType === type);
}

export function getBeforePhotos(photos: Photo[]): Photo[] {
  return getPhotosByType(photos, 'before');
}

export function getAfterPhotos(photos: Photo[]): Photo[] {
  return getPhotosByType(photos, 'after');
}

export function getDamagePhotos(photos: Photo[]): Photo[] {
  return getPhotosByType(photos, 'damage');
}

export function sortPhotosByDate(photos: Photo[], ascending: boolean = true): Photo[] {
  return [...photos].sort((a, b) => {
    const diff = a.capturedAt.getTime() - b.capturedAt.getTime();
    return ascending ? diff : -diff;
  });
}
