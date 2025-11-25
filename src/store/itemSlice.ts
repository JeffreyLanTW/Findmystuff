import { createSlice, PayloadAction, createAsyncThunk, SliceCaseReducers, ValidateSliceCaseReducers } from '@reduxjs/toolkit';
import type { Item, ItemListResponse } from '../types/Item';
import * as itemService from '@services/itemService';

interface ItemState {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
  searchQuery: string;
  selectedLocationId?: string;
  loading: boolean;
  error: string | null;
}

const initialState: ItemState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  searchQuery: '',
  selectedLocationId: undefined,
  loading: false,
  error: null,
};

/**
 * Async thunk for loading items
 */
export const loadItemsAsync = createAsyncThunk(
  'items/loadItems',
  async (page: number) => {
    return itemService.getAllItems(page, 20);
  }
);

/**
 * Async thunk for searching items
 */
export const searchItemsAsync = createAsyncThunk(
  'items/searchItems',
  async ({ query, page }: { query: string; page: number }) => {
    return itemService.searchItems(query, page, 20);
  }
);

/**
 * Async thunk for creating an item
 */
export const createItemAsync = createAsyncThunk(
  'items/createItem',
  async (params: Parameters<typeof itemService.createItem>[0]) => {
    return itemService.createItem(params);
  }
);

/**
 * Async thunk for deleting an item
 */
export const deleteItemAsync = createAsyncThunk(
  'items/deleteItem',
  async (id: string) => {
    await itemService.deleteItem(id);
    return id;
  }
);

/**
 * Async thunk for updating an item
 */
export const updateItemAsync = createAsyncThunk(
  'items/updateItem',
  async ({ id, updates }: { id: string; updates: Partial<Item> }) => {
    return itemService.updateItem(id, updates);
  }
);

/**
 * Async thunk for getting items by location
 */
export const getItemsByLocationAsync = createAsyncThunk(
  'items/getItemsByLocation',
  async ({ locationId, page }: { locationId: string; page: number }) => {
    return itemService.getItemsByLocation(locationId, page, 20);
  }
);

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1; // Reset to first page when searching
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSelectedLocation: (state, action: PayloadAction<string | undefined>) => {
      state.selectedLocationId = action.payload;
      state.page = 1; // Reset to first page when changing location filter
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load Items
    builder
      .addCase(loadItemsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadItemsAsync.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.loading = false;
      })
      .addCase(loadItemsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load items';
      });

    // Search Items
    builder
      .addCase(searchItemsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchItemsAsync.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.loading = false;
      })
      .addCase(searchItemsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Search failed';
      });

    // Create Item
    builder
      .addCase(createItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItemAsync.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
        state.loading = false;
      })
      .addCase(createItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create item';
      });

    // Delete Item
    builder
      .addCase(deleteItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItemAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total -= 1;
        state.loading = false;
      })
      .addCase(deleteItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete item';
      });

    // Update Item
    builder
      .addCase(updateItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update item';
      });

    // Get Items By Location
    builder
      .addCase(getItemsByLocationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getItemsByLocationAsync.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = 1;
        state.loading = false;
      })
      .addCase(getItemsByLocationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get items by location';
      });
  },
});

export const { setSearchQuery, setPage, setSelectedLocation, clearError } =
  itemSlice.actions;

export default itemSlice.reducer;

/**
 * Memoized selectors for performance optimization
 */
export const selectItemList = (state: { items: ItemState }) => state.items.items;
export const selectTotalItems = (state: { items: ItemState }) => state.items.total;
export const selectCurrentPage = (state: { items: ItemState }) => state.items.page;
export const selectSearchQuery = (state: { items: ItemState }) => state.items.searchQuery;
export const selectSelectedLocation = (state: { items: ItemState }) =>
  state.items.selectedLocationId;
export const selectLoading = (state: { items: ItemState }) => state.items.loading;
export const selectError = (state: { items: ItemState }) => state.items.error;
