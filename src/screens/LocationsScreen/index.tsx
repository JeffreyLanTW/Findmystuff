import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { FAB, Card, Text, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import {
  loadLocationsAsync,
  deleteLocationAsync,
  selectLocations,
  selectLocationsLoading,
  selectLocationsError,
} from '../../store/locationSlice';
import { selectItemList, setSelectedLocation } from '../../store/itemSlice';
import { getErrorMessage } from '../../utils/errors';
import type { Location } from '../../types/Location';

export interface LocationsScreenProps {
  navigation: any;
}

/**
 * LocationsScreen - Manage locations
 * 
 * Features:
 * - Display all locations
 * - Show item count per location
 * - Delete locations with confirmation
 * - FAB to add new location
 * - Pull-to-refresh
 */
export const LocationsScreen: React.FC<LocationsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const locations = useSelector(selectLocations);
  const loading = useSelector(selectLocationsLoading);
  const error = useSelector(selectLocationsError);
  const items = useSelector(selectItemList);
  const [refreshing, setRefreshing] = useState(false);

  // Load locations on mount
  useEffect(() => {
    dispatch(loadLocationsAsync());
  }, [dispatch]);

  // Show error alert if load fails
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Focus listener to refresh when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(loadLocationsAsync());
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadLocationsAsync()).unwrap();
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleDeleteLocation = useCallback((location: Location) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${location.name}"? Items will keep their references but won't show a location.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await dispatch(deleteLocationAsync(location.id)).unwrap();
              Alert.alert('Success', 'Location deleted');
            } catch (error) {
              Alert.alert('Error', getErrorMessage(error));
            }
          },
          style: 'destructive',
        },
      ]
    );
  }, [dispatch]);

  const handleLocationPress = useCallback((location: Location) => {
    dispatch(setSelectedLocation(location.id));
    navigation.navigate('HomeStack', { screen: 'Home' });
  }, [dispatch, navigation]);

  const handleAddLocation = () => {
    navigation.navigate('AddLocationStack', {
      screen: 'AddLocation',
    });
  };

  const renderLocationItem = ({ item }: { item: Location }) => {
    const itemCount = items.filter((i: any) => i.locationId === item.id).length;

    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
        onPress={() => handleLocationPress(item)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.locationInfo}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              📍 {item.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </Text>
          </View>
          <Button
            mode="text"
            textColor={theme.colors.error}
            onPress={() => handleDeleteLocation(item)}
            icon="trash-can"
            compact
          >
            Delete
          </Button>
        </Card.Content>
      </Card>
    );
  };

  const emptyState = (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        📭 No locations yet
      </Text>
      <Text
        variant="bodySmall"
        style={{
          color: theme.colors.onSurfaceVariant,
          textAlign: 'center',
        }}
      >
        Create your first location to organize your items
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={locations}
          renderItem={renderLocationItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={locations.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={locations.length === 0 ? emptyState : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      {/* FAB to add location */}
      <FAB
        icon="plus"
        label="Add Location"
        onPress={handleAddLocation}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    padding: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  locationInfo: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default LocationsScreen;
