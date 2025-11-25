/**
 * Item entity representing a physical object in inventory
 */
export interface Item {
  id: string; // UUID
  name: string; // Required: user-provided item name
  description?: string; // Optional: user notes about the item
  photo?: string; // Optional: base64 or file path to image
  locationId?: string; // Optional: foreign key to Location
  createdAt: number; // Timestamp (milliseconds)
  updatedAt: number; // Timestamp (milliseconds)
}

/**
 * API request payload for creating/updating an item
 */
export interface CreateItemRequest {
  name: string;
  description?: string;
  photo?: string;
  locationId?: string;
}

/**
 * Paginated list response
 */
export interface ItemListResponse {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}
