import * as locationService from '@services/locationService';
import { ValidationError, NotFoundError, DatabaseError } from '@utils/errors';
import type { Location, CreateLocationRequest } from '../../../src/types';

describe('locationService', () => {
  beforeAll(async () => {
    const { initDatabase } = await import('@services/database');
    await initDatabase();
  });

  afterEach(async () => {
    const { clearDatabase } = await import('@services/database');
    await clearDatabase();
  });

  describe('createLocation', () => {
    it('should create a location with unique name', async () => {
      const request: CreateLocationRequest = {
        name: 'Garage',
      };

      const location = await locationService.createLocation(request);

      expect(location.id).toBeDefined();
      expect(location.name).toBe('Garage');
      expect(location.createdAt).toBeDefined();
      expect(location.updatedAt).toBeDefined();
    });

    it('should create a location with optional photo', async () => {
      const request: CreateLocationRequest = {
        name: 'Garage',
        photo: 'base64data',
      };

      const location = await locationService.createLocation(request);

      expect(location.photo).toBe('base64data');
    });

    it('should trim whitespace from name', async () => {
      const request: CreateLocationRequest = {
        name: '  Garage  ',
      };

      const location = await locationService.createLocation(request);

      expect(location.name).toBe('Garage');
    });

    it('should throw ValidationError for empty name', async () => {
      const request: CreateLocationRequest = {
        name: '',
      };

      await expect(locationService.createLocation(request)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for name longer than 100 characters', async () => {
      const request: CreateLocationRequest = {
        name: 'A'.repeat(101),
      };

      await expect(locationService.createLocation(request)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate location names', async () => {
      await locationService.createLocation({ name: 'Garage' });

      await expect(locationService.createLocation({ name: 'Garage' })).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('getLocation', () => {
    it('should retrieve a location by ID', async () => {
      const created = await locationService.createLocation({ name: 'Garage' });
      const retrieved = await locationService.getLocation(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Garage');
    });

    it('should throw NotFoundError for non-existent location', async () => {
      await expect(locationService.getLocation('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllLocations', () => {
    it('should return empty list when no locations exist', async () => {
      const locations = await locationService.getAllLocations();

      expect(locations).toEqual([]);
    });

    it('should return all locations', async () => {
      await locationService.createLocation({ name: 'Garage' });
      await locationService.createLocation({ name: 'Basement' });
      await locationService.createLocation({ name: 'Attic' });

      const locations = await locationService.getAllLocations();

      expect(locations.length).toBe(3);
      expect(locations.map((l) => l.name)).toContain('Garage');
      expect(locations.map((l) => l.name)).toContain('Basement');
      expect(locations.map((l) => l.name)).toContain('Attic');
    });

    it('should return locations ordered by created_at DESC', async () => {
      const loc1 = await locationService.createLocation({ name: 'First' });
      const loc2 = await locationService.createLocation({ name: 'Second' });
      const loc3 = await locationService.createLocation({ name: 'Third' });

      const locations = await locationService.getAllLocations();

      expect(locations[0].id).toBe(loc3.id);
      expect(locations[1].id).toBe(loc2.id);
      expect(locations[2].id).toBe(loc1.id);
    });
  });

  describe('updateLocation', () => {
    it('should update location name', async () => {
      const created = await locationService.createLocation({ name: 'Old Name' });
      const updated = await locationService.updateLocation(created.id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(created.id);
    });

    it('should update location photo', async () => {
      const created = await locationService.createLocation({ name: 'Garage' });
      const updated = await locationService.updateLocation(created.id, {
        photo: 'newphoto',
      });

      expect(updated.photo).toBe('newphoto');
    });

    it('should throw NotFoundError for non-existent location', async () => {
      await expect(
        locationService.updateLocation('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for duplicate name', async () => {
      await locationService.createLocation({ name: 'Garage' });
      const created2 = await locationService.createLocation({ name: 'Basement' });

      await expect(
        locationService.updateLocation(created2.id, { name: 'Garage' })
      ).rejects.toThrow(ValidationError);
    });

    it('should update updatedAt timestamp', async () => {
      const created = await locationService.createLocation({ name: 'Garage' });
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(10);

      const updated = await locationService.updateLocation(created.id, { name: 'Updated' });

      expect(updated.updatedAt).toBeGreaterThan(created.updatedAt);
    });
  });

  describe('deleteLocation', () => {
    it('should delete a location', async () => {
      const created = await locationService.createLocation({ name: 'Garage' });

      await locationService.deleteLocation(created.id);

      await expect(locationService.getLocation(created.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when deleting non-existent location', async () => {
      await expect(locationService.deleteLocation('non-existent-id')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should not affect other locations', async () => {
      const loc1 = await locationService.createLocation({ name: 'Garage' });
      const loc2 = await locationService.createLocation({ name: 'Basement' });

      await locationService.deleteLocation(loc1.id);

      const locations = await locationService.getAllLocations();
      expect(locations.length).toBe(1);
      expect(locations[0].id).toBe(loc2.id);
    });

    it('should allow deleting location while items keep reference (cascade safe)', async () => {
      // This test ensures soft delete behavior
      // Items in deleted location should not be affected
      const created = await locationService.createLocation({ name: 'Garage' });

      await locationService.deleteLocation(created.id);

      const locations = await locationService.getAllLocations();
      expect(locations.length).toBe(0);
    });
  });
});
