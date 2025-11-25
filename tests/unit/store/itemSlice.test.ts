import itemReducer, {
  setSearchQuery,
  setPage,
  setSelectedLocation,
  clearError,
  selectItemList,
  selectTotalItems,
  selectSearchQuery,
  selectLoading,
  selectError,
} from '@store/itemSlice';
import type { Item } from '@types/Item';

describe('itemSlice', () => {
  const initialState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    searchQuery: '',
    selectedLocationId: undefined,
    loading: false,
    error: null,
  };

  const mockItem: Item = {
    id: 'item-1',
    name: 'Camera',
    description: 'Canon EOS',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      const state = itemReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should handle setSearchQuery', () => {
      const state = itemReducer(initialState, setSearchQuery('camera'));
      expect(state.searchQuery).toBe('camera');
      expect(state.page).toBe(1); // Should reset to first page
    });

    it('should handle setPage', () => {
      const state = itemReducer(initialState, setPage(2));
      expect(state.page).toBe(2);
    });

    it('should handle setSelectedLocation', () => {
      const state = itemReducer(initialState, setSelectedLocation('loc-1'));
      expect(state.selectedLocationId).toBe('loc-1');
      expect(state.page).toBe(1); // Should reset to first page
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const state = itemReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('selectors', () => {
    const stateWithItems = {
      items: {
        ...initialState,
        items: [mockItem],
        total: 1,
        searchQuery: 'camera',
        loading: false,
      },
    };

    it('should select item list', () => {
      const items = selectItemList(stateWithItems);
      expect(items).toEqual([mockItem]);
    });

    it('should select total items', () => {
      const total = selectTotalItems(stateWithItems);
      expect(total).toBe(1);
    });

    it('should select search query', () => {
      const query = selectSearchQuery(stateWithItems);
      expect(query).toBe('camera');
    });

    it('should select loading state', () => {
      const loading = selectLoading(stateWithItems);
      expect(loading).toBe(false);
    });

    it('should select error message', () => {
      const errorState = {
        items: {
          ...initialState,
          error: 'Test error',
        },
      };
      const error = selectError(errorState);
      expect(error).toBe('Test error');
    });
  });
});
