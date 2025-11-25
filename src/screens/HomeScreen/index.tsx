import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { FAB, ActivityIndicator, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@store/index';
import {
  loadItemsAsync,
  searchItemsAsync,
  selectItemList,
  selectLoading,
  selectError,
  selectCurrentPage,
  selectSearchQuery,
  selectSelectedLocation,
  setSelectedLocation,
  getItemsByLocationAsync,
} from '@store/itemSlice';
import type { Item } from '../../types/Item';
import SearchBar from '../../components/SearchBar';
import ItemCard from '../../components/ItemCard';
import LocationPicker from '../../components/LocationPicker';

export interface HomeScreenProps {
  navigation: any;
}

/**
 * HomeScreen - Main inventory list screen
 * Displays all items with search, pagination and pull-to-refresh
 * Features:
 * - SearchBar with debounce
 * - ItemCard component for each item
 * - Pagination on scroll end
 * - Pull-to-refresh
 * - FAB to add new items
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectItemList);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const page = useSelector(selectCurrentPage);
  const searchQuery = useSelector(selectSearchQuery);
  const selectedLocationId = useSelector(selectSelectedLocation);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);

  // Load items on mount
  useEffect(() => {
    dispatch(loadItemsAsync(1));
  }, [dispatch]);

  // Show error alert if load fails
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Load items by location if location is selected
  useEffect(() => {
    if (selectedLocationId) {
      dispatch(getItemsByLocationAsync({ locationId: selectedLocationId, page: 1 }));
    } else {
      dispatch(loadItemsAsync(1));
    }
  }, [dispatch, selectedLocationId]);

  /**
   * Handle search query change with debounce
   */
  const handleSearchChange = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
      if (query.trim()) {
        dispatch(searchItemsAsync({ query, page: 1 }));
      } else {
        dispatch(loadItemsAsync(1));
      }
    },
    [dispatch]
  );

  /**
   * Handle clear search
   */
  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    dispatch(loadItemsAsync(1));
  }, [dispatch]);

  /**
   * Handle refresh (pull-to-refresh)
   */
  const handleRefresh = useCallback(() => {
    if (localSearchQuery.trim()) {
      dispatch(searchItemsAsync({ query: localSearchQuery, page: 1 }));
    } else {
      dispatch(loadItemsAsync(1));
    }
  }, [dispatch, localSearchQuery]);

  /**
   * Handle load more (scroll to end)
   */
  const handleLoadMore = useCallback(() => {
    if (!loading && items.length > 0) {
      if (localSearchQuery.trim()) {
        dispatch(searchItemsAsync({ query: localSearchQuery, page: page + 1 }));
      } else {
        dispatch(loadItemsAsync(page + 1));
      }
    }
  }, [dispatch, loading, items, page, localSearchQuery]);

  /**
   * Navigate to AddItemScreen
   */
  const handleAddItem = () => {
    navigation.navigate('AddItemStack', { screen: 'AddItem' });
  };

  /**
   * Navigate to item detail
   */
  const handleItemPress = (item: Item) => {
    navigation.navigate('ItemDetailStack', { screen: 'ItemDetail', params: { itemId: item.id } });
  };

  /**
   * Handle location filter
   */
  const handleLocationFilter = useCallback(() => {
    setLocationPickerVisible(true);
  }, []);

  /**
   * Handle location selection
   */
  const handleLocationSelect = useCallback(
    (locationId: string | undefined) => {
      dispatch(setSelectedLocation(locationId));
      setLocationPickerVisible(false);
    },
    [dispatch]
  );

  /**
   * Render empty state
   */
  if (!loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <SearchBar
          query={localSearchQuery}
          onQueryChange={handleSearchChange}
          onClear={handleClearSearch}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {localSearchQuery ? 'No matches' : 'No Items Yet'}
          </Text>
          <Text style={styles.emptyMessage}>
            {localSearchQuery
              ? `No items match "${localSearchQuery}"`
              : 'Tap the + button to add your first item to the inventory'}
          </Text>
        </View>
        <FAB
          icon="plus"
          onPress={handleAddItem}
          style={[styles.fab, styles.fabBottom]}
          label="Add Item"
          testID="fab-add-item"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        query={localSearchQuery}
        onQueryChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      <View style={styles.filterRow}>
        <FAB
          icon="filter"
          label={selectedLocationId ? 'Filtered by Location' : 'Filter by Location'}
          onPress={handleLocationFilter}
          style={styles.filterFab}
          testID="fab-location-filter"
        />
        {selectedLocationId && (
          <Text style={styles.filterIndicator}>
            Filtered by Location
          </Text>
        )}
      </View>
      <LocationPicker
        visible={locationPickerVisible}
        onSelect={handleLocationSelect}
        onClose={() => setLocationPickerVisible(false)}
        selected={selectedLocationId}
      />
      <FlatList
        data={items}
        keyExtractor={(item: Item) => item.id}
        renderItem={({ item }: { item: Item }) => (
          <ItemCard item={item} onPress={() => handleItemPress(item)} />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer} testID="loading-indicator">
              <ActivityIndicator animating size="large" />
            </View>
          ) : null
        }
        testID="items-flat-list"
      />

      <FAB
        icon="plus"
        onPress={handleAddItem}
        style={[styles.fab, styles.fabBottom]}
        label="Add Item"
        testID="fab-add-item"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  fabBottom: {
    marginBottom: 20,
    marginRight: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterFab: {
    marginRight: 8,
  },
  filterIndicator: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
