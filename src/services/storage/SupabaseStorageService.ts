import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@data/datasources/remote/SupabaseClient';
import { env } from '@core/config/env';
import { StorageError } from '@core/errors/AppError';

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadOptions {
  bucket: string;
  folder?: string;
  fileName?: string;
  contentType?: string;
}

class SupabaseStorageService {
  private static instance: SupabaseStorageService;

  private constructor() {}

  public static getInstance(): SupabaseStorageService {
    if (!SupabaseStorageService.instance) {
      SupabaseStorageService.instance = new SupabaseStorageService();
    }
    return SupabaseStorageService.instance;
  }

  /**
   * Generate a unique file name
   */
  private generateFileName(originalName?: string, extension: string = 'jpg'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    if (originalName) {
      const ext = originalName.split('.').pop() || extension;
      return `${timestamp}_${random}.${ext}`;
    }

    return `${timestamp}_${random}.${extension}`;
  }

  /**
   * Get the content type from a file extension
   */
  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
    };
    return types[ext || 'jpg'] || 'application/octet-stream';
  }

  /**
   * Upload a file from a local URI
   */
  async uploadFile(localUri: string, options: UploadOptions): Promise<UploadResult> {
    try {
      // Read file as base64 using legacy FileSystem API
      const fileInfo = await LegacyFileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist: ' + localUri);
      }

      // Read file content as base64
      const base64Data = await LegacyFileSystem.readAsStringAsync(localUri, {
        encoding: LegacyFileSystem.EncodingType.Base64,
      });

      // Generate file name
      const fileName = options.fileName || this.generateFileName();
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      // Get content type
      const contentType = options.contentType || this.getContentType(fileName);

      // Convert base64 to ArrayBuffer and upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, decode(base64Data), {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new StorageError(error.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error: any) {
      console.error('Upload file error:', error);
      throw new StorageError(error.message || 'Failed to upload file');
    }
  }

  /**
   * Compress an image before uploading
   * Resizes to max 1200px width/height and compresses to 70% quality
   */
  async compressImage(uri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
      return uri;
    }
  }

  /**
   * Upload a service order photo (with compression)
   */
  async uploadOrderPhoto(
    localUri: string,
    orderId: string,
    photoType: 'before' | 'after' | 'damage'
  ): Promise<UploadResult> {
    // Compress image before uploading
    const compressedUri = await this.compressImage(localUri);

    const fileName = this.generateFileName(undefined, 'jpg');
    return this.uploadFile(compressedUri, {
      bucket: env.PHOTO_BUCKET,
      folder: `orders/${orderId}/${photoType}`,
      fileName,
      contentType: 'image/jpeg',
    });
  }

  /**
   * Upload an expense receipt
   */
  async uploadExpenseReceipt(localUri: string, expenseId?: string): Promise<UploadResult> {
    const fileName = this.generateFileName(undefined, 'jpg');
    const folder = expenseId ? `receipts/${expenseId}` : 'receipts/pending';
    return this.uploadFile(localUri, {
      bucket: env.RECEIPT_BUCKET,
      folder,
      fileName,
      contentType: 'image/jpeg',
    });
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new StorageError(error.message);
    }
  }

  /**
   * Delete an order photo
   */
  async deleteOrderPhoto(path: string): Promise<void> {
    await this.deleteFile(env.PHOTO_BUCKET, path);
  }

  /**
   * Delete an expense receipt
   */
  async deleteExpenseReceipt(path: string): Promise<void> {
    await this.deleteFile(env.RECEIPT_BUCKET, path);
  }

  /**
   * Get a signed URL for temporary access
   */
  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new StorageError(error.message);
    }

    return data.signedUrl;
  }

  /**
   * List files in a folder
   */
  async listFiles(bucket: string, folder: string): Promise<string[]> {
    const { data, error } = await supabase.storage.from(bucket).list(folder);

    if (error) {
      throw new StorageError(error.message);
    }

    return data.map((file) => `${folder}/${file.name}`);
  }
}

export const storageService = SupabaseStorageService.getInstance();
export default storageService;
