import { IPhotoRepository } from '@domain/repositories/IPhotoRepository';
import { Photo, CreatePhotoInput, UpdatePhotoInput } from '@domain/entities/Photo';
import { PhotoRemoteDataSource } from '@data/datasources/remote/PhotoRemoteDataSource';
import { PhotoMapper } from '@data/models/mappers';
import { PhotoType } from '@core/constants';

export class PhotoRepositoryImpl implements IPhotoRepository {
  constructor(private dataSource: PhotoRemoteDataSource) {}

  async getAll(): Promise<Photo[]> {
    const rows = await this.dataSource.getAll();
    return rows.map(PhotoMapper.toDomain);
  }

  async getById(id: string): Promise<Photo | null> {
    const row = await this.dataSource.getById(id);
    return row ? PhotoMapper.toDomain(row) : null;
  }

  async create(data: CreatePhotoInput): Promise<Photo> {
    const insert = PhotoMapper.toInsert(data);
    const row = await this.dataSource.create(insert);
    return PhotoMapper.toDomain(row);
  }

  async update(id: string, data: UpdatePhotoInput): Promise<Photo> {
    const update = PhotoMapper.toUpdate(data);
    const row = await this.dataSource.update(id, update);
    return PhotoMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.delete(id);
  }

  async getByServiceOrderId(serviceOrderId: string): Promise<Photo[]> {
    const rows = await this.dataSource.getByServiceOrderId(serviceOrderId);
    return rows.map(PhotoMapper.toDomain);
  }

  async getByServiceOrderIdAndType(serviceOrderId: string, type: PhotoType): Promise<Photo[]> {
    const rows = await this.dataSource.getByServiceOrderIdAndType(serviceOrderId, type);
    return rows.map(PhotoMapper.toDomain);
  }

  async uploadPhoto(
    serviceOrderId: string,
    imageUri: string,
    type: PhotoType,
    description?: string
  ): Promise<Photo> {
    // Use the data source's uploadAndCreate method which handles both storage and DB
    const row = await this.dataSource.uploadAndCreate(serviceOrderId, imageUri, type, description);
    return PhotoMapper.toDomain(row);
  }

  async deleteWithStorage(id: string): Promise<void> {
    await this.dataSource.deleteWithStorage(id);
  }
}
