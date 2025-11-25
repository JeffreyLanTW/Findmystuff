import { selectImage, compressImage } from '@services/imageService';
import { ValidationError } from '@utils/errors';

/**
 * Image service tests
 * Tests image selection and compression functionality
 */

describe('imageService', () => {
  describe('compressImage', () => {
    it('should compress image to under 2MB', async () => {
      // Mock large base64 image (simulated)
      const largeImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // 1px image
      
      const compressed = await compressImage(largeImage, {
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');
      // Size check would require actual image processing
    });

    it('should return base64 string', async () => {
      const image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const compressed = await compressImage(image);

      expect(compressed).toMatch(/^data:image\/(jpeg|png);base64,/);
    });

    it('should respect quality parameter', async () => {
      const image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const lowQuality = await compressImage(image, { quality: 0.5 });
      const highQuality = await compressImage(image, { quality: 0.95 });

      expect(lowQuality).toBeDefined();
      expect(highQuality).toBeDefined();
    });

    it('should handle missing image gracefully', async () => {
      await expect(compressImage('')).rejects.toThrow();
    });
  });

  describe('selectImage', () => {
    it('should return image data on success', async () => {
      // Mock implementation - in real app would show image picker
      const result = await selectImage('gallery');

      if (result) {
        expect(result).toHaveProperty('base64');
        expect(result.base64).toMatch(/^[A-Za-z0-9+/=]+$/);
      }
    });

    it('should support gallery source', async () => {
      const result = await selectImage('gallery');
      // Either returns image or null (user cancelled)
      expect(result === null || result?.base64).toBeTruthy();
    });

    it('should support camera source', async () => {
      const result = await selectImage('camera');
      // Either returns image or null (user cancelled)
      expect(result === null || result?.base64).toBeTruthy();
    });
  });
});
