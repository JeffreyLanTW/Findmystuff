import ImageResizer from 'react-native-image-resizer';
import { ValidationError } from '@utils/errors';

/**
 * Image service - handles image selection and compression
 */

export interface CompressOptions {
  quality?: number; // 0-1, default 0.8
  maxWidth?: number; // default 1200
  maxHeight?: number; // default 1200
  format?: 'JPEG' | 'PNG'; // default JPEG
}

export interface ImageData {
  base64: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

/**
 * Select image from gallery or camera
 */
export const selectImage = async (source: 'gallery' | 'camera'): Promise<ImageData | null> => {
  try {
    let image: unknown;

    // Dynamic import to avoid issues in test environment
    const { default: ImagePicker } = await import('react-native-image-crop-picker');

    if (source === 'gallery') {
      image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
      });
    } else {
      image = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
      });
    }

    // Convert to base64
    const imageData = image as Record<string, unknown>;
    const base64 = imageData.data as string || '';

    if (!base64) {
      throw new ValidationError('Failed to load image data');
    }

    return {
      base64,
      width: (imageData.width as number) || 0,
      height: (imageData.height as number) || 0,
      size: (imageData.size as number) || 0,
      mimeType: (imageData.mime as string) || 'image/jpeg',
    };
  } catch (error) {
    // User cancelled picker or error occurred
    if ((error as Error).message?.includes('User cancelled')) {
      return null;
    }
    throw error;
  }
};

/**
 * Compress image to reduce file size
 * Target: < 2MB, default 80% JPEG quality
 */
export const compressImage = async (
  base64: string,
  options: CompressOptions = {}
): Promise<string> => {
  if (!base64) {
    throw new ValidationError('Image data is required');
  }

  const {
    quality = 0.8,
    maxWidth = 1200,
    maxHeight = 1200,
    format = 'JPEG',
  } = options;

  try {
    // Create temporary file from base64
    const tempPath = `file:///tmp/image_${Date.now()}.jpg`;

    // Use ImageResizer to compress (format must be JPEG or PNG in uppercase)
    const resizeFormat = (format === 'PNG' ? 'PNG' : 'JPEG') as 'JPEG' | 'PNG';
    const compressedPath = await ImageResizer.createResizedImage(
      tempPath,
      maxWidth,
      maxHeight,
      resizeFormat,
      Math.round(quality * 100),
      0,
      undefined,
      false,
      { mode: 'contain' }
    );

    // Read compressed image and convert to base64
    const { default: RNFS } = await import('react-native-fs');
    const compressedBase64 = await RNFS.readFile(compressedPath.path, 'base64');

    // Validate size (< 2MB = 2097152 bytes)
    const sizeInBytes = (compressedBase64.length * 3) / 4;
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB

    if (sizeInBytes > maxSizeBytes) {
      // Retry with lower quality if still too large
      if (quality > 0.5) {
        return compressImage(base64, {
          ...options,
          quality: quality - 0.1,
        });
      }
      throw new ValidationError(`Image too large: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB (max 2MB)`);
    }

    return `data:image/${format};base64,${compressedBase64}`;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Failed to compress image: ${(error as Error).message}`);
  }
};

/**
 * Validate image size
 */
export const validateImageSize = (base64: string, maxSizeMB: number = 2): boolean => {
  if (!base64) return false;
  const sizeInBytes = (base64.length * 3) / 4;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
};
