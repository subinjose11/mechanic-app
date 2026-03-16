// Firebase Storage Service for photo and file uploads
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadResult as FirebaseUploadResult,
  UploadTask,
  StorageReference,
} from 'firebase/storage';
import { getFirebaseStorage } from '../config';
import { getServicePhotoPath, getExpenseReceiptPath } from '../firestore/collections';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  path: string;
}

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Get a storage reference
  private getRef(path: string): StorageReference {
    const storage = getFirebaseStorage();
    return ref(storage, path);
  }

  // Upload a file and return the download URL
  async uploadFile(path: string, file: Blob | Uint8Array): Promise<UploadResult> {
    const storageRef = this.getRef(path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return { url, path };
  }

  // Upload with progress tracking
  uploadFileWithProgress(
    path: string,
    file: Blob | Uint8Array,
    onProgress?: (progress: UploadProgress) => void
  ): {
    task: UploadTask;
    promise: Promise<UploadResult>;
  } {
    const storageRef = this.getRef(path);
    const task = uploadBytesResumable(storageRef, file);

    const promise = new Promise<UploadResult>((resolve, reject) => {
      task.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            };
            onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path });
        }
      );
    });

    return { task, promise };
  }

  // Upload a service photo
  async uploadServicePhoto(
    userId: string,
    orderId: string,
    photoUri: string,
    fileName?: string
  ): Promise<UploadResult> {
    const file = await this.uriToBlob(photoUri);
    const name = fileName || `${Date.now()}.jpg`;
    const path = getServicePhotoPath(userId, orderId, name);

    return this.uploadFile(path, file);
  }

  // Upload an expense receipt
  async uploadExpenseReceipt(
    userId: string,
    expenseId: string,
    photoUri: string,
    fileName?: string
  ): Promise<UploadResult> {
    const file = await this.uriToBlob(photoUri);
    const name = fileName || `receipt_${Date.now()}.jpg`;
    const path = getExpenseReceiptPath(userId, expenseId, name);

    return this.uploadFile(path, file);
  }

  // Delete a file
  async deleteFile(path: string): Promise<void> {
    const storageRef = this.getRef(path);
    await deleteObject(storageRef);
  }

  // Delete a file by URL
  async deleteFileByUrl(url: string): Promise<void> {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  }

  // Get download URL for a path
  async getUrl(path: string): Promise<string> {
    const storageRef = this.getRef(path);
    return getDownloadURL(storageRef);
  }

  // List all files in a directory
  async listFiles(path: string): Promise<string[]> {
    const storageRef = this.getRef(path);
    const result = await listAll(storageRef);
    return result.items.map((item) => item.fullPath);
  }

  // Delete all files in a directory
  async deleteDirectory(path: string): Promise<void> {
    const files = await this.listFiles(path);
    await Promise.all(files.map((filePath) => this.deleteFile(filePath)));
  }

  // Convert a local URI to a Blob (for React Native)
  private async uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return response.blob();
  }

  // Generate a unique filename
  generateFileName(prefix: string, extension: string = 'jpg'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.${extension}`;
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();

// Export class for testing
export { StorageService };
