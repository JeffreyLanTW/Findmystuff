/**
 * Integration Test: Search Flow
 * 
 * Tests the complete workflow of:
 * 1. Adding multiple items to inventory
 * 2. Searching for items by name
 * 3. Verifying filtered results
 * 4. Clearing search to see all items
 * 
 * User Story: "As a user, I want to search items in my inventory and see filtered results"
 * 
 * Test Scenario:
 * - Create 5 items with different names
 * - Search for "camera" → See only matching items
 * - Search for "phone" → See only matching items
 * - Clear search → See all 5 items
 * - Search with no matches → See empty state
 */

import * as itemService from '../../src/services/itemService';
import type { Item, CreateItemRequest } from '../../src/types';

describe('Integration: Search Flow', () => {
  // Setup: Initialize database before tests
  beforeAll(async () => {
    try {
      const { initDatabase } = await import('../../src/services/database');
      await initDatabase();
    } catch (error) {
      // Database may already be initialized
      console.log('Database initialization', error);
    }
  });

  // Cleanup: Remove all items after each test
  afterEach(async () => {
    try {
      const { clearDatabase } = await import('../../src/services/database');
      await clearDatabase();
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  /**
   * T023.1: Create 5 items and verify all appear in unfiltered list
   */
  test('should create multiple items and retrieve all items', async () => {
    const testItems: CreateItemRequest[] = [
      { name: 'Canon Camera', description: 'DSLR camera' },
      { name: 'Sony Camera', description: 'Mirrorless camera' },
      { name: 'iPhone 15', description: 'Mobile phone' },
      { name: 'Galaxy Phone', description: 'Android phone' },
      { name: 'iPad Tablet', description: 'Tablet device' },
    ];

    const createdIds: string[] = [];

    // Create all items
    for (const itemData of testItems) {
      const created = await itemService.createItem(itemData);
      createdIds.push(created.id);
    }

    // Retrieve all items
    const { items: allItems } = await itemService.getAllItems(1, 100);

    // Verify: All 5 items are in the list
    expect(allItems.length).toBeGreaterThanOrEqual(5);

    // Verify: All created items are present
    const allNames = allItems.map((item: Item) => item.name);
    testItems.forEach(item => {
      expect(allNames).toContain(item.name);
    });
  });

  /**
   * T023.2: Search for items containing "camera" and verify only camera items appear
   */
  test('should filter items by search query "camera"', async () => {
    const testItems: CreateItemRequest[] = [
      { name: 'Canon Camera', description: 'DSLR camera' },
      { name: 'Sony Camera', description: 'Mirrorless camera' },
      { name: 'iPhone 15', description: 'Mobile phone' },
      { name: 'Galaxy Phone', description: 'Android phone' },
      { name: 'iPad Tablet', description: 'Tablet device' },
    ];

    // Create all items
    for (const itemData of testItems) {
      await itemService.createItem(itemData);
    }

    // Search for "camera"
    const { items: results } = await itemService.searchItems('camera', 1, 100);

    // Verify: Only camera items are returned
    expect(results.length).toBe(2);
    expect(results[0].name).toContain('Camera');
    expect(results[1].name).toContain('Camera');
  });

  /**
   * T023.3: Search for items containing "phone" and verify only phone items appear
   */
  test('should filter items by search query "phone"', async () => {
    const testItems: CreateItemRequest[] = [
      { name: 'Canon Camera', description: 'DSLR camera' },
      { name: 'Sony Camera', description: 'Mirrorless camera' },
      { name: 'iPhone 15', description: 'Mobile phone' },
      { name: 'Galaxy Phone', description: 'Android phone' },
      { name: 'iPad Tablet', description: 'Tablet device' },
    ];

    // Create all items
    for (const itemData of testItems) {
      await itemService.createItem(itemData);
    }

    // Search for "phone"
    const { items: results } = await itemService.searchItems('phone', 1, 100);

    // Verify: Only phone items are returned
    expect(results.length).toBe(2);
    expect(results[0].name).toContain('Phone');
    expect(results[1].name).toContain('Phone');
  });

  /**
   * T023.4: Search with empty query should return all items
   */
  test('should return all items when search query is empty', async () => {
    const testItems: CreateItemRequest[] = [
      { name: 'Canon Camera', description: 'DSLR camera' },
      { name: 'Sony Camera', description: 'Mirrorless camera' },
      { name: 'iPhone 15', description: 'Mobile phone' },
      { name: 'Galaxy Phone', description: 'Android phone' },
      { name: 'iPad Tablet', description: 'Tablet device' },
    ];

    // Create all items
    for (const itemData of testItems) {
      await itemService.createItem(itemData);
    }

    // Search with empty query
    const { items: results } = await itemService.searchItems('', 1, 100);

    // Verify: All items are returned
    expect(results.length).toBeGreaterThanOrEqual(5);
  });

  /**
   * T023.5: Search with no matches should return empty array
   */
  test('should return empty array when search query has no matches', async () => {
    const testItems: CreateItemRequest[] = [
      { name: 'Canon Camera', description: 'DSLR camera' },
      { name: 'Sony Camera', description: 'Mirrorless camera' },
      { name: 'iPhone 15', description: 'Mobile phone' },
      { name: 'Galaxy Phone', description: 'Android phone' },
      { name: 'iPad Tablet', description: 'Tablet device' },
    ];

    // Create all items
    for (const itemData of testItems) {
      await itemService.createItem(itemData);
    }

    // Search for non-existent item
    const { items: results } = await itemService.searchItems('laptop', 1, 100);

    // Verify: No results returned
    expect(results.length).toBe(0);
  });

  /**
   * T023.6: Search should be case-insensitive
   */
  test('should perform case-insensitive search', async () => {
    // Create items
    await itemService.createItem({ name: 'Canon Camera', description: 'DSLR camera' });
    await itemService.createItem({ name: 'Sony Camera', description: 'Mirrorless camera' });

    // Search with different cases
    const { items: lowercase } = await itemService.searchItems('camera', 1, 100);
    const { items: uppercase } = await itemService.searchItems('CAMERA', 1, 100);
    const { items: mixedcase } = await itemService.searchItems('CaMeRa', 1, 100);

    // Verify: All searches return same results
    expect(lowercase.length).toBe(2);
    expect(uppercase.length).toBe(2);
    expect(mixedcase.length).toBe(2);
  });
});
