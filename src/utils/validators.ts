/**
 * Input validation utilities
 */

/**
 * Validates that item name is not empty
 */
export const validateItemName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Item name is required' };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'Item name must be less than 100 characters' };
  }
  return { valid: true };
};

/**
 * Validates that location name is not empty
 */
export const validateLocationName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Location name is required' };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'Location name must be less than 100 characters' };
  }
  return { valid: true };
};

/**
 * Validates search query
 */
export const validateSearchQuery = (query: string): { valid: boolean; error?: string } => {
  if (query.length > 200) {
    return { valid: false, error: 'Search query too long' };
  }
  return { valid: true };
};

/**
 * Validates image file size (max 10MB before compression)
 */
export const validateImageSize = (
  fileSizeInBytes: number,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (fileSizeInBytes > maxBytes) {
    return { valid: false, error: `Image must be less than ${maxSizeMB}MB` };
  }
  return { valid: true };
};
