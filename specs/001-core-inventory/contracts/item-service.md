# Item Service Contract

**Service**: ItemService  
**Version**: 1.0.0  
**Date**: 2025-11-24  
**Type**: Internal Service (SQLite-backed)

## Overview

The Item Service provides complete CRUD (Create, Read, Update, Delete) operations for managing inventory items in FindMyStuff. All operations are synchronous and use SQLite as the backing store.

## Operations

### createItem

**Purpose**: Add a new item to inventory

**Input**:
```typescript
interface CreateItemRequest {
  name: string;              // Required: 1-100 chars
  description?: string;      // Optional: user notes
  photo?: string;            // Optional: base64 image (≤ 2MB)
  locationId?: string;       // Optional: UUID reference to Location
}
```

**Output**:
```typescript
interface Item {
  id: string;                // Generated UUID
  name: string;
  description?: string;
  photo?: string;
  locationId?: string;
  createdAt: number;         // Timestamp in ms
  updatedAt: number;         // Timestamp in ms
}
```

**Errors**:
- `ValidationError`: name is empty or > 100 chars
- `ValidationError`: photo is > 2MB
- `DatabaseError`: database write failed

**Tests**:
```typescript
describe('createItem', () => {
  it('should create item with required name', async () => {
    const item = await createItem({ name: 'Camera' });
    expect(item).toMatchObject({
      id: expect.any(String),
      name: 'Camera',
      createdAt: expect.any(Number),
    });
  });

  it('should throw ValidationError if name is empty', async () => {
    await expect(createItem({ name: '' })).rejects.toThrow(ValidationError);
  });

  it('should trim whitespace from name', async () => {
    const item = await createItem({ name: '  Camera  ' });
    expect(item.name).toBe('Camera');
  });

  it('should accept optional description and photo', async () => {
    const item = await createItem({
      name: 'Camera',
      description: 'Canon EOS',
      photo: 'base64...',
    });
    expect(item.description).toBe('Canon EOS');
    expect(item.photo).toBe('base64...');
  });
});
```

---

### getItem

**Purpose**: Retrieve a specific item by ID

**Input**: `id: string` (UUID)

**Output**: `Item` object

**Errors**:
- `NotFoundError`: Item with given ID does not exist

**Tests**:
```typescript
describe('getItem', () => {
  it('should return item by ID', async () => {
    const created = await createItem({ name: 'Camera' });
    const fetched = await getItem(created.id);
    expect(fetched).toEqual(created);
  });

  it('should throw NotFoundError for non-existent ID', async () => {
    await expect(getItem('invalid-id')).rejects.toThrow(NotFoundError);
  });
});
```

---

### getAllItems

**Purpose**: Retrieve paginated list of all items

**Input**:
```typescript
{
  page: number;              // Default: 1
  pageSize: number;          // Default: 20, max: 100
}
```

**Output**:
```typescript
{
  items: Item[];
  total: number;             // Total items in database
  page: number;
  pageSize: number;
}
```

**Errors**:
- None (returns empty list if no items)

**Tests**:
```typescript
describe('getAllItems', () => {
  it('should return paginated items ordered by creation date DESC', async () => {
    await createItem({ name: 'Item 1' });
    await createItem({ name: 'Item 2' });
    await createItem({ name: 'Item 3' });

    const { items, total } = await getAllItems(1, 20);

    expect(items).toHaveLength(3);
    expect(total).toBe(3);
    expect(items[0].name).toBe('Item 3'); // Most recent first
  });

  it('should respect pagination limits', async () => {
    for (let i = 0; i < 50; i++) {
      await createItem({ name: `Item ${i}` });
    }

    const page1 = await getAllItems(1, 20);
    const page2 = await getAllItems(2, 20);
    const page3 = await getAllItems(3, 20);

    expect(page1.items).toHaveLength(20);
    expect(page2.items).toHaveLength(20);
    expect(page3.items).toHaveLength(10);
    expect(page1.total).toBe(50);
  });

  it('should return empty list when no items exist', async () => {
    const { items, total } = await getAllItems();
    expect(items).toHaveLength(0);
    expect(total).toBe(0);
  });
});
```

---

### searchItems

**Purpose**: Full-text search items by name and description

**Input**:
```typescript
{
  query: string;             // Search term (case-insensitive)
  page: number;              // Default: 1
  pageSize: number;          // Default: 20
}
```

**Output**:
```typescript
{
  items: Item[];
  total: number;             // Total matching items
  page: number;
  pageSize: number;
}
```

**Search Behavior**:
- Case-insensitive matching
- Partial word matching (e.g., "cam" matches "Camera", "webcam")
- Searches both name and description fields
- Ordered by creation date DESC

**Errors**:
- None (returns empty list if no matches)

**Tests**:
```typescript
describe('searchItems', () => {
  it('should find items by name (case-insensitive)', async () => {
    await createItem({ name: 'Camera' });
    await createItem({ name: 'Lens' });

    const { items } = await searchItems('CAMERA');

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Camera');
  });

  it('should search partial names', async () => {
    await createItem({ name: 'Camera' });
    await createItem({ name: 'Webcam' });

    const { items } = await searchItems('cam');

    expect(items).toHaveLength(2);
  });

  it('should search description field', async () => {
    await createItem({
      name: 'Device',
      description: 'Canon EOS Camera',
    });

    const { items } = await searchItems('Canon');

    expect(items).toHaveLength(1);
  });

  it('should return empty list for no matches', async () => {
    await createItem({ name: 'Camera' });

    const { items } = await searchItems('xyz');

    expect(items).toHaveLength(0);
  });
});
```

---

### getItemsByLocation

**Purpose**: Retrieve all items assigned to a specific location

**Input**:
```typescript
{
  locationId: string;        // UUID
  page: number;              // Default: 1
  pageSize: number;          // Default: 20
}
```

**Output**:
```typescript
{
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Errors**:
- None (returns empty list if location has no items)

**Tests**:
```typescript
describe('getItemsByLocation', () => {
  it('should return items for a specific location', async () => {
    const location = await createLocation({ name: 'Garage' });
    await createItem({ name: 'Camera', locationId: location.id });
    await createItem({ name: 'Lens', locationId: location.id });
    await createItem({ name: 'Other' }); // No location

    const { items, total } = await getItemsByLocation(location.id);

    expect(items).toHaveLength(2);
    expect(total).toBe(2);
    expect(items.map(i => i.name)).toEqual(['Lens', 'Camera']); // DESC order
  });

  it('should return empty list if location has no items', async () => {
    const location = await createLocation({ name: 'Empty' });

    const { items } = await getItemsByLocation(location.id);

    expect(items).toHaveLength(0);
  });
});
```

---

### updateItem

**Purpose**: Update an existing item

**Input**:
```typescript
{
  id: string;                // Item UUID
  ...partial CreateItemRequest  // Fields to update
}
```

**Output**: Updated `Item` object

**Errors**:
- `NotFoundError`: Item does not exist
- `ValidationError`: Invalid field values

**Tests**:
```typescript
describe('updateItem', () => {
  it('should update item fields', async () => {
    const item = await createItem({ name: 'Camera' });

    const updated = await updateItem(item.id, {
      name: 'Canon Camera',
      description: 'Professional',
    });

    expect(updated.name).toBe('Canon Camera');
    expect(updated.description).toBe('Professional');
    expect(updated.updatedAt).toBeGreaterThan(item.updatedAt);
  });

  it('should throw NotFoundError for non-existent item', async () => {
    await expect(updateItem('invalid', { name: 'new' })).rejects.toThrow(NotFoundError);
  });
});
```

---

### deleteItem

**Purpose**: Delete an item

**Input**: `id: string` (UUID)

**Output**: `void`

**Errors**:
- `NotFoundError`: Item does not exist

**Tests**:
```typescript
describe('deleteItem', () => {
  it('should delete item by ID', async () => {
    const item = await createItem({ name: 'Camera' });

    await deleteItem(item.id);

    await expect(getItem(item.id)).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError if deleting non-existent item', async () => {
    await expect(deleteItem('invalid')).rejects.toThrow(NotFoundError);
  });
});
```

---

## Integration Tests

### Add Item to List Workflow

```typescript
describe('Add Item Workflow', () => {
  it('should add item and appear in inventory list', async () => {
    // 1. Add item
    const newItem = await createItem({ name: 'Camera' });

    // 2. Fetch list
    const { items } = await getAllItems();

    // 3. Verify item in list
    expect(items).toContainEqual(expect.objectContaining({
      id: newItem.id,
      name: 'Camera',
    }));
  });
});
```

### Search After Add Workflow

```typescript
describe('Search Workflow', () => {
  it('should find newly added item via search', async () => {
    await createItem({ name: 'Canon Camera' });

    const { items } = await searchItems('canon');

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Canon Camera');
  });
});
```

---

## Performance Targets

- `createItem`: < 100ms
- `getItem`: < 50ms
- `getAllItems` (20 items): < 300ms
- `searchItems` (10,000 items): < 500ms
- `getItemsByLocation`: < 100ms
- `updateItem`: < 100ms
- `deleteItem`: < 50ms

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-24 | Initial contract, all operations defined |

