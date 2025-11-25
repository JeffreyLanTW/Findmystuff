import { v4 as uuidv4 } from 'uuid';
import { Item, CreateItemRequest } from '@types/index';
import { executeQuery, executeCommand } from './database';
import { validateItemName } from '@utils/validators';
import { ValidationError, NotFoundError } from '@utils/errors';

/**
 * Item service - handles all item CRUD operations
 * Uses SQLite database for persistence
 */

/**
 * Create a new item
 */
export const createItem = async (request: CreateItemRequest): Promise<Item> => {
  // Validate input
  const validation = validateItemName(request.name);
  if (!validation.valid) {
    throw new ValidationError(validation.error || 'Invalid item name');
  }

  const now = Date.now();
  const item: Item = {
    id: uuidv4(),
    name: request.name.trim(),
    description: request.description?.trim(),
    photo: request.photo,
    locationId: request.locationId,
    createdAt: now,
    updatedAt: now,
  };

  // Insert into database
  const sql = `
    INSERT INTO items (id, name, description, photo, location_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    item.id,
    item.name,
    item.description || null,
    item.photo || null,
    item.locationId || null,
    item.createdAt,
    item.updatedAt,
  ];

  await executeCommand(sql, params);
  return item;
};

/**
 * Get item by ID
 */
export const getItem = async (id: string): Promise<Item> => {
  const sql = 'SELECT * FROM items WHERE id = ?';
  const result = await executeQuery(sql, [id]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Item');
  }

  return mapRowToItem(result.rows.item(0));
};

/**
 * Get all items with pagination
 */
export const getAllItems = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: Item[]; total: number }> => {
  // Get total count
  const countResult = await executeQuery('SELECT COUNT(*) as count FROM items');
  const total = countResult.rows.item(0).count;

  // Get paginated items
  const offset = (page - 1) * pageSize;
  const sql = 'SELECT * FROM items ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const result = await executeQuery(sql, [pageSize, offset]);

  const items: Item[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(mapRowToItem(result.rows.item(i)));
  }

  return { items, total };
};

/**
 * Search items by name or description
 */
export const searchItems = async (
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: Item[]; total: number }> => {
  const searchTerm = `%${query.toLowerCase()}%`;

  // Get total count
  const countResult = await executeQuery(
    'SELECT COUNT(*) as count FROM items WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?',
    [searchTerm, searchTerm]
  );
  const total = countResult.rows.item(0).count;

  // Get paginated results
  const offset = (page - 1) * pageSize;
  const sql = `
    SELECT * FROM items
    WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await executeQuery(sql, [searchTerm, searchTerm, pageSize, offset]);

  const items: Item[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(mapRowToItem(result.rows.item(i)));
  }

  return { items, total };
};

/**
 * Get items by location
 */
export const getItemsByLocation = async (
  locationId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: Item[]; total: number }> => {
  const countResult = await executeQuery(
    'SELECT COUNT(*) as count FROM items WHERE location_id = ?',
    [locationId]
  );
  const total = countResult.rows.item(0).count;

  const offset = (page - 1) * pageSize;
  const sql = `
    SELECT * FROM items
    WHERE location_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await executeQuery(sql, [locationId, pageSize, offset]);

  const items: Item[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(mapRowToItem(result.rows.item(i)));
  }

  return { items, total };
};

/**
 * Update an item
 */
export const updateItem = async (id: string, request: Partial<CreateItemRequest>): Promise<Item> => {
  // Verify item exists
  await getItem(id);

  // Validate if name is being updated
  if (request.name) {
    const validation = validateItemName(request.name);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid item name');
    }
  }

  const now = Date.now();
  const sql = `
    UPDATE items
    SET name = ?, description = ?, photo = ?, location_id = ?, updated_at = ?
    WHERE id = ?
  `;
  const params = [
    request.name || null,
    request.description || null,
    request.photo || null,
    request.locationId || null,
    now,
    id,
  ];

  await executeCommand(sql, params);
  return getItem(id);
};

/**
 * Delete an item
 */
export const deleteItem = async (id: string): Promise<void> => {
  // Verify item exists
  await getItem(id);

  const sql = 'DELETE FROM items WHERE id = ?';
  await executeCommand(sql, [id]);
};

/**
 * Map database row to Item object
 */
const mapRowToItem = (row: unknown): Item => {
  const data = row as Record<string, unknown>;
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    photo: data.photo as string | undefined,
    locationId: data.location_id as string | undefined,
    createdAt: data.created_at as number,
    updatedAt: data.updated_at as number,
  };
};
