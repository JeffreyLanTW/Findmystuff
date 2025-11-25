import { initDatabase, getDatabase, executeQuery, executeCommand, clearDatabase, closeDatabase } from '../services/database';

describe('Database Service', () => {
  beforeAll(async () => {
    // Initialize database before tests
    await initDatabase();
  });

  afterAll(async () => {
    // Close database after tests
    await closeDatabase();
  });

  afterEach(async () => {
    // Clear database between tests
    await clearDatabase();
  });

  describe('initDatabase', () => {
    it('should initialize database successfully', async () => {
      const db = getDatabase();
      expect(db).toBeDefined();
    });

    it('should create locations table', async () => {
      const result = await executeQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='locations'"
      );
      expect(result.rows.length).toBe(1);
    });

    it('should create items table', async () => {
      const result = await executeQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='items'"
      );
      expect(result.rows.length).toBe(1);
    });

    it('should create indexes on items table', async () => {
      const nameIndexResult = await executeQuery(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_items_name'"
      );
      const locationIndexResult = await executeQuery(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_items_location'"
      );
      const dateIndexResult = await executeQuery(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_items_created_at'"
      );

      expect(nameIndexResult.rows.length).toBe(1);
      expect(locationIndexResult.rows.length).toBe(1);
      expect(dateIndexResult.rows.length).toBe(1);
    });
  });

  describe('executeCommand', () => {
    it('should insert data into locations table', async () => {
      const affectedRows = await executeCommand(
        `INSERT INTO locations (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        ['test-id-1', 'Test Location', Date.now(), Date.now()]
      );
      expect(affectedRows).toBe(1);

      const result = await executeQuery('SELECT * FROM locations WHERE id = ?', ['test-id-1']);
      expect(result.rows.length).toBe(1);
      expect(result.rows.item(0).name).toBe('Test Location');
    });

    it('should update data in locations table', async () => {
      await executeCommand(
        `INSERT INTO locations (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        ['test-id-2', 'Old Name', Date.now(), Date.now()]
      );

      const affectedRows = await executeCommand(
        'UPDATE locations SET name = ? WHERE id = ?',
        ['New Name', 'test-id-2']
      );
      expect(affectedRows).toBe(1);

      const result = await executeQuery('SELECT * FROM locations WHERE id = ?', ['test-id-2']);
      expect(result.rows.item(0).name).toBe('New Name');
    });

    it('should delete data from locations table', async () => {
      await executeCommand(
        `INSERT INTO locations (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        ['test-id-3', 'To Delete', Date.now(), Date.now()]
      );

      const affectedRows = await executeCommand('DELETE FROM locations WHERE id = ?', [
        'test-id-3',
      ]);
      expect(affectedRows).toBe(1);

      const result = await executeQuery('SELECT * FROM locations WHERE id = ?', ['test-id-3']);
      expect(result.rows.length).toBe(0);
    });
  });

  describe('executeQuery', () => {
    it('should retrieve data with parameters', async () => {
      const now = Date.now();
      await executeCommand(
        `INSERT INTO items (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        ['item-1', 'Camera', now, now]
      );

      const result = await executeQuery('SELECT * FROM items WHERE name = ?', ['Camera']);
      expect(result.rows.length).toBe(1);
      expect(result.rows.item(0).id).toBe('item-1');
    });

    it('should handle empty result set', async () => {
      const result = await executeQuery('SELECT * FROM items WHERE name = ?', ['NonExistent']);
      expect(result.rows.length).toBe(0);
    });

    it('should return correct row count', async () => {
      const now = Date.now();
      await executeCommand(
        `INSERT INTO items (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        ['item-2', 'Laptop', now, now]
      );
      await executeCommand(
        `INSERT INTO items (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        ['item-3', 'Phone', now, now]
      );

      const result = await executeQuery('SELECT * FROM items');
      expect(result.rows.length).toBe(2);
    });
  });

  describe('clearDatabase', () => {
    it('should clear all data from tables', async () => {
      const now = Date.now();
      await executeCommand(
        `INSERT INTO items (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        ['item-4', 'Test Item', now, now]
      );

      let result = await executeQuery('SELECT * FROM items');
      expect(result.rows.length).toBe(1);

      await clearDatabase();

      result = await executeQuery('SELECT * FROM items');
      expect(result.rows.length).toBe(0);
    });
  });
});
