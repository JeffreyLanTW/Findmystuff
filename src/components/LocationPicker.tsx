import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Button,
  Card,
  Text,
  ActivityIndicator,
  useTheme,
  Searchbar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  loadLocationsAsync,
  selectLocations,
  selectLocationsLoading,
  selectLocationsError,
} from '../store/locationSlice';
import type { Location } from '../types/Location';

export interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (locationId: string) => void;
  selected?: string; // locationId of selected location
  onCreateNew?: () => void;
}

/**
 * LocationPicker - Modal component for selecting or creating locations
 * 
 * Features:
 * - Display list of existing locations
 * - Show item count per location (if available)
 * - Search/filter locations
 * - Select location (closes modal)
 * - Button to create new location
 * - Selected state indication
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  visible,
  onClose,
  onSelect,
  selected,
  onCreateNew,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const locations = useSelector(selectLocations);
  const loading = useSelector(selectLocationsLoading);
  const error = useSelector(selectLocationsError);
  const [searchQuery, setSearchQuery] = useState('');

  // Load locations when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(loadLocationsAsync());
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Filter locations by search query
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (locationId: string) => {
    onSelect(locationId);
    onClose();
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
      onClose();
    }
  };

  const renderLocationItem = ({ item }: { item: Location }) => {
    const isSelected = selected === item.id;
    const backgroundColor = isSelected ? theme.colors.primaryContainer : theme.colors.surface;
    const textColor = isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface;

    return (
      <Card
        style={[
          styles.locationCard,
          { backgroundColor },
        ]}
        onPress={() => handleSelectLocation(item.id)}
      >
        <View style={styles.locationCardContent}>
          <View style={styles.locationInfo}>
            <Text
              variant="titleMedium"
              style={{ color: textColor, fontWeight: isSelected ? 'bold' : 'normal' }}
            >
              📍 {item.name}
            </Text>
          </View>
          {isSelected && (
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.primary }}
            >
              ✓ Selected
            </Text>
          )}
        </View>
      </Card>
    );
  };

  const emptyState = (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        📭 No locations yet
      </Text>
      <Text
        variant="bodySmall"
        style={{
          color: theme.colors.onSurfaceVariant,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        Create a new location to organize your items
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ flex: 1 }}>
            Select Location
          </Text>
          <Button
            mode="text"
            onPress={onClose}
            labelStyle={{ color: theme.colors.primary }}
          >
            Close
          </Button>
        </View>

        {/* Search bar */}
        <Searchbar
          placeholder="Search locations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Loading state */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {/* Locations list */}
            <FlatList
              data={filteredLocations}
              renderItem={renderLocationItem}
              keyExtractor={item => item.id}
              style={styles.list}
              contentContainerStyle={filteredLocations.length === 0 ? styles.emptyList : undefined}
              ListEmptyComponent={filteredLocations.length === 0 ? emptyState : null}
            />

            {/* Create new location button */}
            <View style={styles.footer}>
              <Button
                mode="contained"
                onPress={handleCreateNew}
                icon="plus"
                style={styles.createButton}
              >
                Create New Location
              </Button>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Account for status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    margin: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
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
  locationCard: {
    marginBottom: 8,
    marginHorizontal: 4,
  },
  locationCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  locationInfo: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  createButton: {
    marginVertical: 8,
  },
});

export default LocationPicker;
