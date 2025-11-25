import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import locationReducer, {
  clearError,
  loadLocationsAsync,
  createLocationAsync,
  deleteLocationAsync,
  selectLocations,
  selectLocationsLoading,
  selectLocationsError,
} from '../../../src/store/locationSlice';
import type { Location } from '../../../src/types/Location';

// Mock locationService
jest.mock('../../../src/services/locationService', () => ({
  getAllLocations: jest.fn(),
  createLocation: jest.fn(),
  deleteLocation: jest.fn(),
}));

import * as locationService from '../../../src/services/locationService';

describe('locationSlice', () => {
  const mockLocationService = locationService as jest.Mocked<typeof locationService>;

  const createMockLocation = (overrides?: Partial<Location>): Location => ({
    id: 'loc-1',
    name: 'Garage',
    photo: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  const createStore = (preloadedState?: PreloadedState<{ locations: any }>) => {
    return configureStore({
      reducer: {
        locations: locationReducer,
      },
      preloadedState,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should return the initial state', () => {
      const state = locationReducer(undefined, { type: 'unknown' });
      expect(state).toEqual({
        locations: [],
        loading: false,
        error: null,
      });
    });

    it('should handle clearError', () => {
      const stateWithError = {
        locations: [],
        loading: false,
        error: 'Test error',
      };
      const state = locationReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('loadLocationsAsync', () => {
    /**
     * T036.1: Load locations successfully
     */
    test('should load locations successfully', async () => {
      const mockLocations = [
        createMockLocation({ id: 'loc-1', name: 'Garage' }),
        createMockLocation({ id: 'loc-2', name: 'Bedroom' }),
      ];

      mockLocationService.getAllLocations.mockResolvedValue(mockLocations);

      const store = createStore();

      // Dispatch action
      await store.dispatch(loadLocationsAsync());

      // Verify state
      const state = store.getState().locations;
      expect(state.locations).toEqual(mockLocations);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    /**
     * T036.4: Handle load error
     */
    test('should handle load error', async () => {
      const errorMessage = 'Failed to fetch locations';
      mockLocationService.getAllLocations.mockRejectedValue(new Error(errorMessage));

      const store = createStore();

      // Dispatch action
      await store.dispatch(loadLocationsAsync());

      // Verify state
      const state = store.getState().locations;
      expect(state.locations).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('createLocationAsync', () => {
    /**
     * T036.2: Create location successfully
     */
    test('should create location successfully', async () => {
      const newLocation = createMockLocation({ id: 'loc-3', name: 'Living Room' });

      mockLocationService.createLocation.mockResolvedValue(newLocation);

      const store = createStore({
        locations: {
          locations: [createMockLocation({ id: 'loc-1', name: 'Garage' })],
          loading: false,
          error: null,
        },
      });

      // Dispatch action
      await store.dispatch(
        createLocationAsync({ name: 'Living Room' })
      );

      // Verify state
      const state = store.getState().locations;
      expect(state.locations).toHaveLength(2);
      expect(state.locations[1]).toEqual(newLocation);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    /**
     * T036.5: Handle create error
     */
    test('should handle create error', async () => {
      const errorMessage = 'Location with this name already exists';
      mockLocationService.createLocation.mockRejectedValue(new Error(errorMessage));

      const store = createStore({
        locations: {
          locations: [],
          loading: false,
          error: null,
        },
      });

      // Dispatch action
      await store.dispatch(
        createLocationAsync({ name: 'Garage' })
      );

      // Verify state
      const state = store.getState().locations;
      expect(state.locations).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('deleteLocationAsync', () => {
    /**
     * T036.3: Delete location successfully
     */
    test('should delete location successfully', async () => {
      mockLocationService.deleteLocation.mockResolvedValue(undefined);

      const store = createStore({
        locations: {
          locations: [
            createMockLocation({ id: 'loc-1', name: 'Garage' }),
            createMockLocation({ id: 'loc-2', name: 'Bedroom' }),
          ],
          loading: false,
          error: null,
        },
      });

      // Dispatch action
      await store.dispatch(deleteLocationAsync('loc-1'));

      // Verify state
      const state = store.getState().locations;
      expect(state.locations).toHaveLength(1);
      expect(state.locations[0].id).toBe('loc-2');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    /**
     * T036.6: Handle delete error
     */
    test('should handle delete error', async () => {
      const errorMessage = 'Failed to delete location';
      mockLocationService.deleteLocation.mockRejectedValue(new Error(errorMessage));

      const store = createStore({
        locations: {
          locations: [createMockLocation({ id: 'loc-1', name: 'Garage' })],
          loading: false,
          error: null,
        },
      });

      // Dispatch action
      await store.dispatch(deleteLocationAsync('loc-1'));

      // Verify state
      const state = store.getState().locations;
      expect(state.locations).toHaveLength(1); // Not deleted
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('selectors', () => {
    /**
     * T036.7: Selectors work correctly
     */
    test('should select locations correctly', () => {
      const mockLocations = [
        createMockLocation({ id: 'loc-1', name: 'Garage' }),
        createMockLocation({ id: 'loc-2', name: 'Bedroom' }),
      ];

      const store = createStore({
        locations: {
          locations: mockLocations,
          loading: false,
          error: null,
        },
      });

      // Verify selectors
      const state = store.getState() as any;
      expect(selectLocations(state)).toEqual(mockLocations);
      expect(selectLocationsLoading(state)).toBe(false);
      expect(selectLocationsError(state)).toBeNull();
    });
  });

  describe('integration', () => {
    /**
     * T036.8: Multiple operations in sequence
     */
    test('should handle multiple operations in sequence', async () => {
      const garage = createMockLocation({ id: 'loc-1', name: 'Garage' });
      const bedroom = createMockLocation({ id: 'loc-2', name: 'Bedroom' });

      mockLocationService.getAllLocations.mockResolvedValue([garage, bedroom]);

      const store = createStore();

      // Load locations
      await store.dispatch(loadLocationsAsync());
      expect(selectLocations(store.getState() as any)).toHaveLength(2);

      // Delete one
      mockLocationService.deleteLocation.mockResolvedValue(undefined);
      await store.dispatch(deleteLocationAsync('loc-1'));
      expect(selectLocations(store.getState() as any)).toHaveLength(1);
      expect(selectLocations(store.getState() as any)[0].id).toBe('loc-2');

      // Create new
      const storageRoom = createMockLocation({ id: 'loc-3', name: 'Storage Room' });
      mockLocationService.createLocation.mockResolvedValue(storageRoom);
      await store.dispatch(createLocationAsync({ name: 'Storage Room' }));
      expect(selectLocations(store.getState() as any)).toHaveLength(2);
    });
  });
});
