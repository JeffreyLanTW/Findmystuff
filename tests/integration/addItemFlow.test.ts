import { createItem, getAllItems } from '../../src/services/itemService';
import { initDatabase } from '../../src/services/database';
import { ValidationError } from '../../src/utils/errors';
import { Item } from '../../src/types/Item';

/**
 * Integration test for Add Item to List workflow
 * Tests the complete flow from creating an item to viewing it in the list
 */

describe('Add Item to List Workflow', () => {
  beforeAll(async () => {
    // Initialize database for testing
    await initDatabase();
  });

  it('should create an item and appear in inventory list', async () => {
    // 1. Create item
    const itemData = {
      name: 'Integration Test Camera',
      description: 'Test camera for integration test',
    };

    const item = await createItem(itemData);

    expect(item).toBeDefined();
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Integration Test Camera');
    expect(item.description).toBe('Test camera for integration test');
    expect(item.createdAt).toBeDefined();

    // 2. Get all items
    const { items, total } = await getAllItems(1, 20);

    // 3. Verify item in list
    const foundItem = items.find(
      (i: Item) => i.name === 'Integration Test Camera'
    );

    expect(foundItem).toBeDefined();
    expect(foundItem?.id).toBe(item.id);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  it('should not create item with empty name', async () => {
    await expect(
      createItem({ name: '' })
    ).rejects.toThrow(ValidationError);
  });

  it('should not create item with very long name', async () => {
    const longName = 'a'.repeat(1001); // Over 100 chars limit

    await expect(
      createItem({ name: longName })
    ).rejects.toThrow(ValidationError);
  });

  it('should create multiple items and maintain order', async () => {
    // Create 3 items
    const item1 = await createItem({ name: 'First Item' });
    const item2 = await createItem({ name: 'Second Item' });
    const item3 = await createItem({ name: 'Third Item' });

    // Get all items
    const { items } = await getAllItems(1, 20);

    // Most recent item should appear first (DESC order by created_at)
    const recentItems = items.slice(0, 3);
    expect(recentItems[0].id).toBe(item3.id);
    expect(recentItems[1].id).toBe(item2.id);
    expect(recentItems[2].id).toBe(item1.id);
  });

  it('should create item with optional description', async () => {
    const item = await createItem({
      name: 'Item with Description',
      description: 'This is a longer description of the item',
    });

    expect(item.description).toBe('This is a longer description of the item');
  });
});
