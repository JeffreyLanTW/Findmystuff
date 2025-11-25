# Data Model: Core Inventory Management

**Phase**: Phase 1 Design  
**Date**: 2025-11-24  
**Input**: spec.md requirements, research.md technology decisions

## Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│   Locations     │         │      Items       │
├─────────────────┤         ├──────────────────┤
│ PK: id          │◀────┬───│ PK: id           │
│    name         │     │   │    name          │
│    photo        │     └───│ FK: location_id  │
│    created_at   │         │    description   │
│    updated_at   │         │    photo         │
└─────────────────┘         │    created_at    │
                            │    updated_at    │
                            └──────────────────┘

Relationship: Location (1) ──────→ (Many) Item
             Optional (item can exist without location)
```

## Database Schema

### Locations Table

```sql
CREATE TABLE locations (
  id TEXT PRIMARY KEY,                    -- UUID
  name TEXT NOT NULL UNIQUE,              -- User-provided location name
  photo TEXT,                             -- Optional: base64 or file path
  created_at INTEGER NOT NULL,            -- Unix timestamp (ms)
  updated_at INTEGER NOT NULL             -- Unix timestamp (ms)
);

CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_created_at ON locations(created_at);
```

**Constraints**:
- `id`: Unique identifier, generated as UUID v4
- `name`: Required, must be unique (prevents duplicate locations)
- `photo`: Optional, stores compressed image as base64 or reference
- Timestamps: Milliseconds since epoch (JavaScript Date.now())

### Items Table

```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY,                    -- UUID
  name TEXT NOT NULL,                     -- User-provided item name
  description TEXT,                       -- Optional: user notes
  photo TEXT,                             -- Optional: compressed image
  location_id TEXT,                       -- Optional: foreign key to locations
  created_at INTEGER NOT NULL,            -- Unix timestamp (ms)
  updated_at INTEGER NOT NULL             -- Unix timestamp (ms)
  
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_location_id ON items(location_id);
CREATE INDEX idx_items_created_at ON items(created_at);
```

**Constraints**:
- `id`: Unique identifier, generated as UUID v4
- `name`: Required, allows duplicates (you can have multiple items with same name)
- `description`: Optional
- `photo`: Optional, compressed to ≤ 2MB before storage
- `location_id`: Optional, foreign key (items can exist without location)
- Timestamps: For tracking creation and modification

**Indexes**:
- `name`: For search and filtering (improves case-insensitive search)
- `location_id`: For location-based queries (filter by location)
- `created_at`: For sorting and range queries

## TypeScript Entity Models

### Item Entity

```typescript
interface Item {
  id: string;                  // UUID v4
  name: string;                // Required: 1-100 characters
  description?: string;        // Optional: user notes
  photo?: string;              // Optional: base64 or file path
  locationId?: string;         // Optional: reference to Location.id
  createdAt: number;           // Timestamp in milliseconds
  updatedAt: number;           // Timestamp in milliseconds
}
```

### Location Entity

```typescript
interface Location {
  id: string;                  // UUID v4
  name: string;                // Required: 1-100 characters, unique
  photo?: string;              // Optional: base64 image
  createdAt: number;           // Timestamp in milliseconds
  updatedAt: number;           // Timestamp in milliseconds
}
```

## State Management (Redux)

### Redux Store Structure

```typescript
interface AppState {
  items: ItemState;
  locations: LocationState;
  ui: UIState;
}

interface ItemState {
  items: Item[];               // Current page of items
  total: number;               // Total items in database
  loading: boolean;            // Fetch operation in progress
  error: string | null;        // Last error message
  page: number;                // Current page (pagination)
  pageSize: number;            // Items per page (20)
  searchQuery: string;         // Current search filter
  selectedLocationId?: string; // Currently filtered location
}

interface LocationState {
  locations: Location[];       // All locations
  loading: boolean;
  error: string | null;
}

interface UIState {
  modal: {
    isOpen: boolean;
    type: 'add-item' | 'add-location' | 'item-detail' | null;
    data?: unknown;
  };
}
```

### Redux Slices

**itemSlice.ts**:
- Actions: addItem, updateItem, deleteItem, setSearchQuery, filterByLocation, loadItems
- Selectors: selectItemList, selectTotalItems, selectSearchQuery, selectItemsByLocation
- Thunks: loadItemsAsync, searchItemsAsync, deleteItemAsync

**locationSlice.ts**:
- Actions: addLocation, deleteLocation, loadLocations
- Selectors: selectAllLocations, selectLocationWithCount
- Thunks: loadLocationsAsync, addLocationAsync

**uiSlice.ts**:
- Actions: openModal, closeModal, setError, clearError
- Selectors: selectModalOpen, selectError

## Data Relationships

### One-to-Many: Location → Items

- **Cardinality**: 1 location : Many items
- **Optionality**: Optional (item can exist without location)
- **Cascade**: When location is deleted, items retain location_id reference (show "Location deleted")
- **Query**: Get all items for a location via `items WHERE location_id = ?`

### Example Query Scenarios

1. **Add new item without location**:
   ```sql
   INSERT INTO items (id, name, description, photo, location_id, created_at, updated_at)
   VALUES (uuid, 'Camera', 'Canon EOS', base64_image, NULL, now, now)
   ```

2. **Search items by name**:
   ```sql
   SELECT * FROM items 
   WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
   ORDER BY created_at DESC
   LIMIT 20 OFFSET 0
   ```

3. **Get all items in a location**:
   ```sql
   SELECT items.* FROM items
   WHERE location_id = ?
   ORDER BY created_at DESC
   ```

4. **Get location with item count**:
   ```sql
   SELECT locations.*, COUNT(items.id) as item_count
   FROM locations
   LEFT JOIN items ON items.location_id = locations.id
   GROUP BY locations.id
   ORDER BY locations.created_at DESC
   ```

5. **Find items added in last 7 days**:
   ```sql
   SELECT * FROM items
   WHERE created_at > (strftime('%s', 'now') - 604800) * 1000
   ORDER BY created_at DESC
   ```

## Data Validation Rules

### Item Validation

| Field | Type | Required | Rules | Error Message |
|-------|------|----------|-------|---------------|
| name | string | Yes | 1-100 chars, not empty after trim | "Item name is required" |
| description | string | No | ≤ 500 chars | "Description too long" |
| photo | base64 | No | ≤ 2MB after compression | "Image too large" |
| locationId | UUID | No | Must reference existing location | "Location does not exist" |

### Location Validation

| Field | Type | Required | Rules | Error Message |
|-------|------|----------|-------|---------------|
| name | string | Yes | 1-100 chars, unique, not empty after trim | "Location name required" |
| photo | base64 | No | ≤ 2MB after compression | "Image too large" |

## Data Lifecycle

### Item Lifecycle

```
Created → Used/Searched → Updated → Deleted
  ↓                ↓          ↓       ↓
  ├─ Set location
  ├─ Add/change photo
  ├─ Edit description
  └─ Move to different location
```

### Data Retention

- **Development**: All data persisted locally, never auto-deleted
- **Images**: Cache cleanup removes images older than 30 days (future feature)
- **Soft delete**: Not implemented for MVP (hard delete only)
- **Backups**: User can export all data as JSON (future feature)

## Performance Considerations

### Database Indexes

- **name**: Enables fast case-insensitive search across 10,000+ items
- **location_id**: Enables fast location filtering
- **created_at**: Enables efficient sorting and date range queries

**Target Performance**:
- Search: < 500ms for 10,000 items
- Location filter: < 100ms
- List view: < 300ms render time

### Query Optimization

1. **Pagination**: Always use LIMIT/OFFSET to prevent loading all items
2. **Indexes**: Queries use indexed columns (name, location_id, created_at)
3. **Lazy loading**: FlatList only renders visible items
4. **Memoization**: Redux selectors prevent unnecessary renders

### Storage Optimization

- **Image compression**: Max 2MB per image (saves ~90% space vs original)
- **SQLite WAL mode**: Better concurrency, enables background queries
- **Index size**: ~1MB for 10,000 items (minimal overhead)

## Migration Strategy

### From CSV Import (Future)

```typescript
interface CSVRow {
  name: string;
  description?: string;
  location?: string;
  photo?: string;
}

// Algorithm:
// 1. Parse CSV file
// 2. Create locations from unique location names
// 3. Create items, link to locations
// 4. Show progress dialog
// 5. Display import summary
```

### Data Export (Future)

```typescript
interface ExportData {
  version: "1.0";
  exportedAt: number;
  items: Item[];
  locations: Location[];
}

// Export as JSON file for backup/sharing
```

## Edge Cases & Handling

1. **Empty database**: Show empty state with "Add item" button
2. **Search with no results**: Show "No items found" message
3. **Location with no items**: Show location in list but with "0 items" indicator
4. **Duplicate item names**: Allowed (user might have multiple similar items)
5. **Item with deleted location**: Show "Location deleted" label, allow relocation
6. **Very large database (100k+ items)**: Pagination prevents UI lag

---

**Data model is complete and production-ready.** Ready for API contracts and development.

