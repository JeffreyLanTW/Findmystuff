/**
 * Integration Test: Location Flow
 * 
 * Tests the complete workflow of:
 * 1. Creating locations
 * 2. Assigning items to locations
 * 3. Querying items by location
 * 4. Deleting locations
 * 
 * User Story: "As a user, I want to organize my items by location"
 * 
 * Test Scenario:
 * - Create location "Garage"
 * - Create item and assign to location
 * - Query items at location
 * - Verify item shows with location tag
 */

import * as itemService from '../../src/services/itemService';
import * as locationService from '../../src/services/locationService';
import type { Item, CreateItemRequest } from '../../src/types';
import type { Location, CreateLocationRequest } from '../../src/types/Location';

describe('Integration: Location Flow', () => {
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

  // Cleanup: Remove all locations and items after each test
  afterEach(async () => {
    try {
      const { clearDatabase } = await import('../../src/services/database');
      await clearDatabase();
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  /**
   * T031.1: Create location and verify it appears in list
   */
  test('should create a location successfully', async () => {
    const locationData: CreateLocationRequest = {
      name: 'Garage',
    };

    // Create location
    const created = await locationService.createLocation(locationData);

    // Verify: Location has correct properties
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Garage');
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeDefined();

    // Verify: Location appears in list
    const allLocations = await locationService.getAllLocations();
    expect(allLocations.length).toBeGreaterThanOrEqual(1);
    expect(allLocations.find((l: Location) => l.name === 'Garage')).toBeDefined();
  });

  /**
   * T031.2: Create item and assign to location, verify locationId is set
   */
  test('should create item with location and verify locationId', async () => {
    // Create location first
    const location = await locationService.createLocation({ name: 'Garage' });

    // Create item and assign to location
    const itemData: CreateItemRequest = {
      name: 'Power Drill',
      description: 'DeWalt cordless drill',
      locationId: location.id, // Assign to location
    };

    const created = await itemService.createItem(itemData);

    // Verify: Item has location ID set
    expect(created.locationId).toBe(location.id);

    // Verify: Item retrieval shows location
    const retrieved = await itemService.getItem(created.id);
    expect(retrieved.locationId).toBe(location.id);
  });

  /**
   * T031.3: Query items at a specific location
   */
  test('should filter items by location', async () => {
    // Create two locations
    const garage = await locationService.createLocation({ name: 'Garage' });
    const bedroom = await locationService.createLocation({ name: 'Bedroom' });

    // Create items at different locations
    const item1 = await itemService.createItem({
      name: 'Power Drill',
      description: 'In garage',
      locationId: garage.id,
    });

    const item2 = await itemService.createItem({
      name: 'Extension Cord',
      description: 'In garage',
      locationId: garage.id,
    });

    const item3 = await itemService.createItem({
      name: 'Alarm Clock',
      description: 'In bedroom',
      locationId: bedroom.id,
    });

    // Query all items
    const { items: allItems } = await itemService.getAllItems(1, 100);

    // Verify: All 3 items created
    expect(allItems.length).toBeGreaterThanOrEqual(3);

    // Filter items by garage location
    const garageItems = allItems.filter(
      (item: Item) => item.locationId === garage.id
    );

    // Verify: Only garage items returned
    expect(garageItems.length).toBe(2);
    expect(garageItems.find((i: Item) => i.name === 'Power Drill')).toBeDefined();
    expect(garageItems.find((i: Item) => i.name === 'Extension Cord')).toBeDefined();

    // Filter items by bedroom location
    const bedroomItems = allItems.filter(
      (item: Item) => item.locationId === bedroom.id
    );

    // Verify: Only bedroom items returned
    expect(bedroomItems.length).toBe(1);
    expect(bedroomItems[0].name).toBe('Alarm Clock');
  });

  /**
   * T031.4: Reassign item to different location
   */
  test('should reassign item to different location', async () => {
    // Create two locations
    const garage = await locationService.createLocation({ name: 'Garage' });
    const storage = await locationService.createLocation({ name: 'Storage' });

    // Create item at garage
    const item = await itemService.createItem({
      name: 'Toolbox',
      description: 'Metal toolbox',
      locationId: garage.id,
    });

    expect(item.locationId).toBe(garage.id);

    // Reassign to storage (by updating)
    const updated = await itemService.updateItem(item.id, {
      locationId: storage.id,
    });

    // Verify: Location ID changed
    expect(updated.locationId).toBe(storage.id);
  });

  /**
   * T031.5: Delete location and verify items still exist (orphaned)
   */
  test('should delete location while items remain', async () => {
    // Create location
    const garage = await locationService.createLocation({ name: 'Garage' });

    // Create item at location
    const item = await itemService.createItem({
      name: 'Hammer',
      description: 'Claw hammer',
      locationId: garage.id,
    });

    // Verify: Item has location
    expect(item.locationId).toBe(garage.id);

    // Delete location
    await locationService.deleteLocation(garage.id);

    // Verify: Location is deleted
    const allLocations = await locationService.getAllLocations();
    expect(allLocations.find((l: Location) => l.id === garage.id)).toBeUndefined();

    // Verify: Item still exists (with location ID reference)
    const retrieved = await itemService.getItem(item.id);
    expect(retrieved.id).toBe(item.id);
    expect(retrieved.locationId).toBe(garage.id); // Location reference remains (orphaned)
  });

  /**
   * T031.6: Create multiple locations and verify count
   */
  test('should create multiple locations and verify count', async () => {
    const locations = [
      { name: 'Garage' },
      { name: 'Bedroom' },
      { name: 'Living Room' },
      { name: 'Kitchen' },
    ];

    // Create all locations
    for (const loc of locations) {
      await locationService.createLocation(loc);
    }

    // Retrieve all
    const allLocations = await locationService.getAllLocations();

    // Verify: At least 4 locations exist
    expect(allLocations.length).toBeGreaterThanOrEqual(4);

    // Verify: All created locations present
    const locationNames = allLocations.map((l: Location) => l.name);
    locations.forEach(loc => {
      expect(locationNames).toContain(loc.name);
    });
  });
});
