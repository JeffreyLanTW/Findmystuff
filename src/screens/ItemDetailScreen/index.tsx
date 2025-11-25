/**
 * ItemDetailScreen - View and manage individual items
 * 
 * Features:
 * - Display full item information (photo, name, description, location, date)
 * - Edit button → navigate to AddItemScreen with item data for editing
 * - Delete button → delete with confirmation dialog
 * - Back navigation
 * - Loading states during operations
 * 
 * Props:
 * - route.params.itemId: ID of item to display
 * - navigation: React Navigation navigation prop
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@store/index';
import type { Item } from '../../types/Item';
import { getItem, deleteItem } from '@services/itemService';
import { formatTimeAgo } from '@utils/formatters';
import { getErrorMessage } from '@utils/errors';

export interface ItemDetailScreenProps {
  route: {
    params: {
      itemId: string;
    };
  };
  navigation: any;
}

/**
 * ItemDetailScreen Component
 * 
 * Displays full item details with edit/delete options
 */
export const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { itemId } = route.params;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load item on mount
  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        const loadedItem = await getItem(itemId);
        setItem(loadedItem);
        setError(null);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        Alert.alert('Error', `Failed to load item: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  // Navigate to edit screen
  const handleEdit = () => {
    if (item) {
      navigation.navigate('AddItemStack', {
        screen: 'AddItem',
        params: { item }, // Pass item for editing
      });
    }
  };

  // Delete item with confirmation
  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: confirmDelete,
          style: 'destructive',
        },
      ]
    );
  };

  // Confirm and execute deletion
  const confirmDelete = async () => {
    if (!item) return;

    try {
      setDeleting(true);
      await deleteItem(item.id);
      Alert.alert('Success', 'Item deleted successfully');
      navigation.goBack();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      Alert.alert('Error', `Failed to delete item: ${message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Error state
  if (error && !item) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Failed to load item</Text>
        <Button onPress={() => navigation.goBack()} mode="contained">
          Go Back
        </Button>
      </View>
    );
  }

  // No item found
  if (!item) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Item not found</Text>
        <Button onPress={() => navigation.goBack()} mode="contained">
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Photo */}
      <View style={styles.photoContainer}>
        {item.photo ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.photo}` }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.photo, styles.placeholderPhoto]}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <Text style={styles.itemName}>{item.name}</Text>

        {/* Description */}
        {item.description && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}

        {/* Location */}
        {item.locationId && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            <Text style={styles.location}>📍 Location ID: {item.locationId}</Text>
          </View>
        )}

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Created</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.dateAgo}>({formatTimeAgo(item.createdAt)})</Text>
        </View>

        {item.updatedAt !== item.createdAt && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Last Updated</Text>
            <Text style={styles.date}>
              {new Date(item.updatedAt).toLocaleString()}
            </Text>
            <Text style={styles.dateAgo}>({formatTimeAgo(item.updatedAt)})</Text>
          </View>
        )}

        {/* ID */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Item ID</Text>
          <Text style={[styles.itemId, { color: theme.colors.onSurfaceVariant }]}>
            {item.id}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleEdit}
          disabled={deleting}
          style={styles.button}
        >
          Edit Item
        </Button>
        <Button
          mode="contained"
          buttonColor={theme.colors.error}
          onPress={handleDelete}
          loading={deleting}
          disabled={deleting}
          style={styles.button}
        >
          Delete Item
        </Button>
      </View>

      {/* Spacing for bottom */}
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 300,
  },
  placeholderPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: 60,
  },
  content: {
    padding: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  location: {
    fontSize: 16,
    color: '#0066cc',
  },
  date: {
    fontSize: 14,
    color: '#333',
  },
  dateAgo: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    padding: 16,
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  spacer: {
    height: 20,
  },
});

export default ItemDetailScreen;
