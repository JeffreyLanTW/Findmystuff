import SQLite from 'react-native-sqlite-storage';
import { DatabaseError } from '@utils/errors';

/**
 * SQLite database manager for FindMyStuff app
 * Handles database initialization and schema creation
 */

let db: SQLite.Database | null = null;

/**
 * Initialize the SQLite database
 */
export const initDatabase = async (): Promise<void> => {
  try {
    if (db) return; // Already initialized

    // Enable promise mode
    SQLite.enablePromise(true);

    // Open or create database
    db = await SQLite.openDatabase({
      name: 'findmystuff.db',
      location: 'default',
    });

    console.log('Database connection successful');

    // Create tables
    await createTables();
  } catch (error) {
    console.error('Failed to initialize database', error);
    throw new DatabaseError('Failed to initialize database');
  }
};

/**
 * Get database instance (must be initialized first)
 */
export const getDatabase = (): SQLite.Database => {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }
  return db;
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    try {
      await db.close();
      db = null;
      console.log('Database closed successfully');
    } catch (error) {
      console.error('Error closing database', error);
    }
  }
};

/**
 * Create database tables
 */
const createTables = async (): Promise<void> => {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  // Create Locations table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      photo TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Create Items table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      photo TEXT,
      location_id TEXT REFERENCES locations(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Create indexes for performance
  await db.executeSql('CREATE INDEX IF NOT EXISTS idx_items_name ON items(name)');
  await db.executeSql('CREATE INDEX IF NOT EXISTS idx_items_location ON items(location_id)');
  await db.executeSql('CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at)');

  console.log('Database tables created successfully');
};

/**
 * Execute a SQL query with parameters (returns results)
 */
export const executeQuery = async (
  sql: string,
  params: unknown[] = []
): Promise<SQLite.ResultSet> => {
  const database = getDatabase();
  try {
    const result = await database.executeSql(sql, params);
    return result[0]; // executeSql returns array of ResultSet
  } catch (error) {
    console.error('Query execution error:', error);
    throw new DatabaseError(`Query failed: ${error}`);
  }
};

/**
 * Execute a SQL command (INSERT, UPDATE, DELETE)
 */
export const executeCommand = async (
  sql: string,
  params: unknown[] = []
): Promise<number> => {
  const result = await executeQuery(sql, params);
  return result.rowsAffected;
};

/**
 * Clear all data (for testing purposes)
 */
export const clearDatabase = async (): Promise<void> => {
  const database = getDatabase();
  try {
    await database.executeSql('DELETE FROM items');
    await database.executeSql('DELETE FROM locations');
    console.log('Database cleared');
  } catch (error) {
    throw new DatabaseError('Failed to clear database');
  }
};
