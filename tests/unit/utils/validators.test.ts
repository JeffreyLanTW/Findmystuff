import {
  validateItemName,
  validateLocationName,
  validateImageSize,
} from '@utils/validators';

describe('validators', () => {
  describe('validateItemName', () => {
    it('should accept valid item names', () => {
      const result = validateItemName('Camera');
      expect(result.valid).toBe(true);
    });

    it('should accept names with spaces', () => {
      const result = validateItemName('Canon EOS Camera');
      expect(result.valid).toBe(true);
    });

    it('should accept names with special characters', () => {
      const result = validateItemName("Dad's Old Laptop");
      expect(result.valid).toBe(true);
    });

    it('should reject empty names', () => {
      const result = validateItemName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names longer than 100 characters', () => {
      const result = validateItemName('A'.repeat(101));
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should trim whitespace and validate', () => {
      const result = validateItemName('  Camera  ');
      expect(result.valid).toBe(true);
    });

    it('should reject only whitespace', () => {
      const result = validateItemName('   ');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateLocationName', () => {
    it('should accept valid location names', () => {
      const result = validateLocationName('Garage');
      expect(result.valid).toBe(true);
    });

    it('should accept names with hyphens', () => {
      const result = validateLocationName('Garage - Shelf A');
      expect(result.valid).toBe(true);
    });

    it('should reject empty names', () => {
      const result = validateLocationName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject names longer than 100 characters', () => {
      const result = validateLocationName('A'.repeat(101));
      expect(result.valid).toBe(false);
    });

    it('should accept exactly 100 characters', () => {
      const result = validateLocationName('A'.repeat(100));
      expect(result.valid).toBe(true);
    });
  });

  describe('validateImageSize', () => {
    it('should accept images under 10MB', () => {
      const result = validateImageSize(1024 * 1024 * 5); // 5MB
      expect(result.valid).toBe(true);
    });

    it('should accept exactly 10MB', () => {
      const result = validateImageSize(1024 * 1024 * 10); // 10MB
      expect(result.valid).toBe(true);
    });

    it('should reject images over 10MB', () => {
      const result = validateImageSize(1024 * 1024 * 11); // 11MB
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept 0 byte images (placeholder)', () => {
      const result = validateImageSize(0);
      expect(result.valid).toBe(true);
    });
  });
});
