import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { Location, CreateLocationRequest } from '../types/Location';
import * as locationService from '@services/locationService';

interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  locations: [],
  loading: false,
  error: null,
};

/**
 * Async thunk for loading all locations
 */
export const loadLocationsAsync = createAsyncThunk(
  'locations/loadLocations',
  async () => {
    return locationService.getAllLocations();
  }
);

/**
 * Async thunk for creating a location
 */
export const createLocationAsync = createAsyncThunk(
  'locations/createLocation',
  async (request: CreateLocationRequest) => {
    return locationService.createLocation(request);
  }
);

/**
 * Async thunk for deleting a location
 */
export const deleteLocationAsync = createAsyncThunk(
  'locations/deleteLocation',
  async (id: string) => {
    await locationService.deleteLocation(id);
    return id;
  }
);

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    clearError: (state: LocationState) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load Locations
    builder
      .addCase(loadLocationsAsync.pending, (state: LocationState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLocationsAsync.fulfilled, (state: LocationState, action) => {
        state.locations = action.payload;
        state.loading = false;
      })
      .addCase(loadLocationsAsync.rejected, (state: LocationState, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load locations';
      });

    // Create Location
    builder
      .addCase(createLocationAsync.pending, (state: LocationState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocationAsync.fulfilled, (state: LocationState, action) => {
        state.locations.push(action.payload);
        state.loading = false;
      })
      .addCase(createLocationAsync.rejected, (state: LocationState, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create location';
      });

    // Delete Location
    builder
      .addCase(deleteLocationAsync.pending, (state: LocationState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLocationAsync.fulfilled, (state: LocationState, action) => {
        state.locations = state.locations.filter((loc) => loc.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteLocationAsync.rejected, (state: LocationState, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete location';
      });
  },
});

export const { clearError } = locationSlice.actions;

export default locationSlice.reducer;

/**
 * Selectors
 */
export const selectLocations = (state: { locations: LocationState }) => state.locations.locations;
export const selectLocationsLoading = (state: { locations: LocationState }) => state.locations.loading;
export const selectLocationsError = (state: { locations: LocationState }) => state.locations.error;
