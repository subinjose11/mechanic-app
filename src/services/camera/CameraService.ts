import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export interface CameraPermissionStatus {
  camera: boolean;
  mediaLibrary: boolean;
}

class CameraService {
  private static instance: CameraService;

  private constructor() {}

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Check camera and media library permissions
   */
  async checkPermissions(): Promise<CameraPermissionStatus> {
    const [cameraStatus, mediaStatus] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      MediaLibrary.getPermissionsAsync(),
    ]);

    return {
      camera: cameraStatus.granted,
      mediaLibrary: mediaStatus.granted,
    };
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request media library permission
   */
  async requestMediaLibraryPermission(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request all required permissions
   */
  async requestAllPermissions(): Promise<CameraPermissionStatus> {
    const [camera, mediaLibrary] = await Promise.all([
      this.requestCameraPermission(),
      this.requestMediaLibraryPermission(),
    ]);

    return { camera, mediaLibrary };
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(options?: {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
  }): Promise<ImagePickerResult | null> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? false,
      aspect: options?.aspect,
      quality: options?.quality ?? 0.8,
      exif: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: asset.type ?? undefined,
      fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
    };
  }

  /**
   * Pick an image from the gallery
   */
  async pickImage(options?: {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
    allowsMultipleSelection?: boolean;
  }): Promise<ImagePickerResult[] | null> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? false,
      aspect: options?.aspect,
      quality: options?.quality ?? 0.8,
      allowsMultipleSelection: options?.allowsMultipleSelection ?? false,
      exif: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets.map((asset) => ({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: asset.type ?? undefined,
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
    }));
  }

  /**
   * Pick a single image from the gallery
   */
  async pickSingleImage(options?: {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
  }): Promise<ImagePickerResult | null> {
    const results = await this.pickImage({
      ...options,
      allowsMultipleSelection: false,
    });

    return results ? results[0] : null;
  }

  /**
   * Show action sheet to choose between camera and gallery
   */
  async pickImageWithOptions(options?: {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
  }): Promise<{ source: 'camera' | 'gallery'; image: ImagePickerResult } | null> {
    // This should be called from a component that shows an action sheet
    // For now, we just provide the methods to be called separately
    throw new Error('Use takePhoto() or pickSingleImage() directly with a UI action sheet');
  }

  /**
   * Save an image to the device's media library
   */
  async saveToMediaLibrary(uri: string): Promise<string> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    const asset = await MediaLibrary.createAssetAsync(uri);
    return asset.uri;
  }
}

export const cameraService = CameraService.getInstance();
export default cameraService;
