/**
 * Location entity representing a storage place or container
 */
export interface Location {
  id: string; // UUID
  name: string; // Required: user-provided location name (e.g., "Garage - Shelf A")
  photo?: string; // Optional: photo of the location
  createdAt: number; // Timestamp (milliseconds)
  updatedAt: number; // Timestamp (milliseconds)
}

/**
 * API request payload for creating/updating a location
 */
export interface CreateLocationRequest {
  name: string;
  photo?: string;
}

/**
 * Location with item count (for list display)
 */
export interface LocationWithCount extends Location {
  itemCount: number;
}
