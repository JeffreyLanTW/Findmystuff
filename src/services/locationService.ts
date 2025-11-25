import { v4 as uuidv4 } from 'uuid';
import type { Location, CreateLocationRequest } from '@types/Location';
import { executeQuery, executeCommand } from './database';
import { ValidationError, NotFoundError, DatabaseError } from '@utils/errors';

/**
 * Create a new location
 */
export const createLocation = async (request: CreateLocationRequest): Promise<Location> => {
  // Validate location name
  if (!request.name || request.name.trim().length === 0) {
    throw new ValidationError('Location name is required');
  }

  if (request.name.length > 100) {
    throw new ValidationError('Location name must be 100 characters or less');
  }

  // Check if location with same name already exists
  const existingResult = await executeQuery('SELECT id FROM locations WHERE name = ?', [
    request.name.trim(),
  ]);

  if (existingResult.rows.length > 0) {
    throw new ValidationError('Location with this name already exists');
  }

  const now = Date.now();
  const location: Location = {
    id: uuidv4(),
    name: request.name.trim(),
    photo: request.photo,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await executeCommand(
      `INSERT INTO locations (id, name, photo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [location.id, location.name, location.photo || null, location.createdAt, location.updatedAt]
    );
    return location;
  } catch (error) {
    throw new DatabaseError(`Failed to create location: ${error}`);
  }
};

/**
 * Get a specific location by ID
 */
export const getLocation = async (id: string): Promise<Location> => {
  try {
    const result = await executeQuery('SELECT * FROM locations WHERE id = ?', [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Location with ID ${id} not found`);
    }

    const row = result.rows.item(0);
    return {
      id: row.id,
      name: row.name,
      photo: row.photo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError(`Failed to fetch location: ${error}`);
  }
};

/**
 * Get all locations
 */
export const getAllLocations = async (): Promise<Location[]> => {
  try {
    const result = await executeQuery(
      'SELECT * FROM locations ORDER BY created_at DESC'
    );

    const locations: Location[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      locations.push({
        id: row.id,
        name: row.name,
        photo: row.photo,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }
    return locations;
  } catch (error) {
    throw new DatabaseError(`Failed to fetch locations: ${error}`);
  }
};

/**
 * Update a location
 */
export const updateLocation = async (
  id: string,
  updates: Partial<Location>
): Promise<Location> => {
  // Verify location exists
  await getLocation(id);

  const now = Date.now();
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  if (updates.name !== undefined) {
    // Check for duplicate name
    const existingResult = await executeQuery(
      'SELECT id FROM locations WHERE name = ? AND id != ?',
      [updates.name, id]
    );
    if (existingResult.rows.length > 0) {
      throw new ValidationError('Location with this name already exists');
    }
    updateFields.push('name = ?');
    updateValues.push(updates.name);
  }

  if (updates.photo !== undefined) {
    updateFields.push('photo = ?');
    updateValues.push(updates.photo);
  }

  updateFields.push('updated_at = ?');
  updateValues.push(now);
  updateValues.push(id);

  try {
    await executeCommand(
      `UPDATE locations SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    return getLocation(id);
  } catch (error) {
    throw new DatabaseError(`Failed to update location: ${error}`);
  }
};

/**
 * Delete a location (items keep their location reference)
 */
export const deleteLocation = async (id: string): Promise<void> => {
  // Verify location exists
  await getLocation(id);

  try {
    await executeCommand('DELETE FROM locations WHERE id = ?', [id]);
  } catch (error) {
    throw new DatabaseError(`Failed to delete location: ${error}`);
  }
};
