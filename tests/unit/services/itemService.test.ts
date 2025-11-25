import * as itemService from '@services/itemService';
import { ValidationError, NotFoundError, DatabaseError } from '@utils/errors';
import type { Item, CreateItemRequest } from '../../../src/types';

describe('itemService', () => {
  beforeAll(async () => {
    // Initialize database
    const { initDatabase } = await import('@services/database');
    await initDatabase();
  });

  afterEach(async () => {
    // Clear database between tests
    const { clearDatabase } = await import('@services/database');
    await clearDatabase();
  });

  describe('createItem', () => {
    it('should create an item with required name', async () => {
      const request: CreateItemRequest = {
        name: 'Camera',
      };

      const item = await itemService.createItem(request);

      expect(item.id).toBeDefined();
      expect(item.name).toBe('Camera');
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBeDefined();
    });

    it('should create an item with name, description, and locationId', async () => {
      const request: CreateItemRequest = {
        name: 'Laptop',
        description: 'Dell XPS 13',
        locationId: 'loc-1',
      };

      const item = await itemService.createItem(request);

      expect(item.name).toBe('Laptop');
      expect(item.description).toBe('Dell XPS 13');
      expect(item.locationId).toBe('loc-1');
    });

    it('should trim whitespace from name', async () => {
      const request: CreateItemRequest = {
        name: '  Camera  ',
      };

      const item = await itemService.createItem(request);

      expect(item.name).toBe('Camera');
    });

    it('should throw ValidationError for empty name', async () => {
      const request: CreateItemRequest = {
        name: '',
      };

      await expect(itemService.createItem(request)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for name longer than 100 characters', async () => {
      const request: CreateItemRequest = {
        name: 'A'.repeat(101),
      };

      await expect(itemService.createItem(request)).rejects.toThrow(ValidationError);
    });

    it('should allow duplicate item names', async () => {
      await itemService.createItem({ name: 'Camera' });
      const item2 = await itemService.createItem({ name: 'Camera' });

      expect(item2.name).toBe('Camera');
      expect(item2.id).not.toBeDefined();
    });
  });

  describe('getItem', () => {
    it('should retrieve an item by ID', async () => {
      const created = await itemService.createItem({ name: 'Laptop' });
      const retrieved = await itemService.getItem(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Laptop');
    });

    it('should throw NotFoundError for non-existent item', async () => {
      await expect(itemService.getItem('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllItems', () => {
    it('should return empty list when no items exist', async () => {
      const result = await itemService.getAllItems(1, 20);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return paginated items', async () => {
      // Create 25 items
      for (let i = 1; i <= 25; i++) {
        await itemService.createItem({ name: `Item ${i}` });
      }

      const page1 = await itemService.getAllItems(1, 20);

      expect(page1.items.length).toBe(20);
      expect(page1.total).toBe(25);
    });

    it('should return items ordered by created_at DESC', async () => {
      const item1 = await itemService.createItem({ name: 'First' });
      const item2 = await itemService.createItem({ name: 'Second' });
      const item3 = await itemService.createItem({ name: 'Third' });

      const result = await itemService.getAllItems(1, 20);

      expect(result.items[0].id).toBe(item3.id);
      expect(result.items[1].id).toBe(item2.id);
      expect(result.items[2].id).toBe(item1.id);
    });

    it('should support pagination', async () => {
      for (let i = 1; i <= 25; i++) {
        await itemService.createItem({ name: `Item ${i}` });
      }

      const page1 = await itemService.getAllItems(1, 10);
      const page2 = await itemService.getAllItems(2, 10);
      const page3 = await itemService.getAllItems(3, 10);

      expect(page1.items.length).toBe(10);
      expect(page2.items.length).toBe(10);
      expect(page3.items.length).toBe(5);
      expect(page1.total).toBe(25);
    });

    it('should complete in less than 300ms for 20 items', async () => {
      for (let i = 1; i <= 20; i++) {
        await itemService.createItem({ name: `Item ${i}` });
      }

      const start = performance.now();
      await itemService.getAllItems(1, 20);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(300);
    });
  });

  describe('searchItems', () => {
    beforeEach(async () => {
      await itemService.createItem({
        name: 'Canon Camera',
        description: 'DSLR camera',
      });
      await itemService.createItem({
        name: 'Sony Camera',
        description: 'Mirrorless',
      });
      await itemService.createItem({
        name: 'Laptop',
        description: 'Dell computer',
      });
    });

    it('should search items by name (case-insensitive)', async () => {
      const result = await itemService.searchItems('camera', 1, 20);

      expect(result.items.length).toBe(2);
      expect(result.items.every((item) => item.name.toLowerCase().includes('camera'))).toBe(true);
    });

    it('should search items by description (case-insensitive)', async () => {
      const result = await itemService.searchItems('mirrorless', 1, 20);

      expect(result.items.length).toBe(1);
      expect(result.items[0].description?.toLowerCase()).toContain('mirrorless');
    });

    it('should support partial matching', async () => {
      const result = await itemService.searchItems('cam', 1, 20);

      expect(result.items.length).toBe(2);
    });

    it('should return empty results for no matches', async () => {
      const result = await itemService.searchItems('nonexistent', 1, 20);

      expect(result.items.length).toBe(0);
    });

    it('should support pagination on search results', async () => {
      for (let i = 1; i <= 15; i++) {
        await itemService.createItem({
          name: `Camera ${i}`,
          description: 'Test camera',
        });
      }

      const page1 = await itemService.searchItems('camera', 1, 10);
      const page2 = await itemService.searchItems('camera', 2, 10);

      expect(page1.items.length).toBe(10);
      expect(page2.items.length).toBe(7);
    });

    it('should complete search in less than 500ms with many items', async () => {
      // Create 50 items
      for (let i = 1; i <= 50; i++) {
        await itemService.createItem({
          name: `Item ${i}`,
          description: `Test item ${i}`,
        });
      }

      const start = performance.now();
      await itemService.searchItems('test', 1, 20);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('getItemsByLocation', () => {
    beforeEach(async () => {
      await itemService.createItem({
        name: 'Item 1',
        locationId: 'garage',
      });
      await itemService.createItem({
        name: 'Item 2',
        locationId: 'garage',
      });
      await itemService.createItem({
        name: 'Item 3',
        locationId: 'basement',
      });
    });

    it('should retrieve all items for a location', async () => {
      const result = await itemService.getItemsByLocation('garage', 1, 20);

      expect(result.items.length).toBe(2);
      expect(result.items.every((item) => item.locationId === 'garage')).toBe(true);
    });

    it('should return empty list for location with no items', async () => {
      const result = await itemService.getItemsByLocation('attic', 1, 20);

      expect(result.items.length).toBe(0);
    });

    it('should support pagination', async () => {
      for (let i = 1; i <= 15; i++) {
        await itemService.createItem({
          name: `Garage Item ${i}`,
          locationId: 'garage',
        });
      }

      const page1 = await itemService.getItemsByLocation('garage', 1, 10);
      const page2 = await itemService.getItemsByLocation('garage', 2, 10);

      expect(page1.items.length).toBe(10);
      expect(page2.items.length).toBe(7);
    });
  });

  describe('updateItem', () => {
    it('should update item name', async () => {
      const created = await itemService.createItem({ name: 'Old Name' });
      const updated = await itemService.updateItem(created.id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(created.id);
    });

    it('should update multiple fields', async () => {
      const created = await itemService.createItem({
        name: 'Item',
        description: 'Old description',
      });

      const updated = await itemService.updateItem(created.id, {
        name: 'New Item',
        description: 'New description',
        locationId: 'loc-1',
      });

      expect(updated.name).toBe('New Item');
      expect(updated.description).toBe('New description');
      expect(updated.locationId).toBe('loc-1');
    });

    it('should throw NotFoundError for non-existent item', async () => {
      await expect(
        itemService.updateItem('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should update updatedAt timestamp', async () => {
      const created = await itemService.createItem({ name: 'Item' });
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(10);

      const updated = await itemService.updateItem(created.id, { name: 'Updated' });

      expect(updated.updatedAt).toBeGreaterThan(created.updatedAt);
    });

    it('should validate name if provided', async () => {
      const created = await itemService.createItem({ name: 'Item' });

      await expect(itemService.updateItem(created.id, { name: '' })).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete an item', async () => {
      const created = await itemService.createItem({ name: 'To Delete' });

      await itemService.deleteItem(created.id);

      await expect(itemService.getItem(created.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when deleting non-existent item', async () => {
      await expect(itemService.deleteItem('non-existent-id')).rejects.toThrow(NotFoundError);
    });

    it('should not affect other items', async () => {
      const item1 = await itemService.createItem({ name: 'Item 1' });
      const item2 = await itemService.createItem({ name: 'Item 2' });

      await itemService.deleteItem(item1.id);

      const result = await itemService.getAllItems(1, 20);
      expect(result.items.length).toBe(1);
      expect(result.items[0].id).toBe(item2.id);
    });
  });
});
