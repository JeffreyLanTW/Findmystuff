import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Button, TextInput as PaperTextInput, Text } from 'react-native-paper';
import { selectImage, compressImage } from '../../services/imageService';
import { getErrorMessage } from '../../utils/errors';
import type { Location } from '../../types/Location';

export interface AddLocationScreenProps {
  navigation: any;
  route?: any;
}

/**
 * AddLocationScreen - Form for creating a new location
 * 
 * Features:
 * - Location name input (required)
 * - Optional photo picker
 * - Validation for unique names
 * - Success navigation
 */
export const AddLocationScreen: React.FC<AddLocationScreenProps> = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Callback for when location is created (from LocationPicker)
  const onLocationCreated = route?.params?.onLocationCreated;

  /**
   * Handle image selection and compression
   */
  const handleSelectPhoto = async () => {
    try {
      Alert.alert('Select Photo', 'Choose photo source', [
        {
          text: 'Gallery',
          onPress: async () => {
            await pickAndCompressImage('gallery');
          },
        },
        {
          text: 'Camera',
          onPress: async () => {
            await pickAndCompressImage('camera');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  /**
   * Pick image and compress it
   */
  const pickAndCompressImage = async (source: 'gallery' | 'camera') => {
    try {
      setLoading(true);
      const imageData = await selectImage(source);

      if (!imageData) {
        // User cancelled
        return;
      }

      // Compress image
      const compressed = await compressImage(imageData.base64, {
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      setPhoto(compressed);
      setPhotoPreview(compressed);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate location name
   */
  const validateLocationName = async (locationName: string): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!locationName || locationName.trim().length === 0) {
      newErrors.name = 'Location name is required';
    } else if (locationName.trim().length > 100) {
      newErrors.name = 'Location name must be 100 characters or less';
    }

    // Check for duplicate names
    if (!newErrors.name) {
      try {
        const { getAllLocations } = await import('../../services/locationService');
        const allLocations = await getAllLocations();
        const isDuplicate = allLocations.some(
          loc => loc.name.toLowerCase() === locationName.trim().toLowerCase()
        );
        if (isDuplicate) {
          newErrors.name = 'Location with this name already exists';
        }
      } catch (error) {
        console.error('Error checking for duplicates:', error);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Save location
   */
  const handleSave = async () => {
    // Validate first
    const isValid = await validateLocationName(name);
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      // Create location
      const { createLocation } = await import('../../services/locationService');
      const newLocation = await createLocation({
        name: name.trim(),
        photo,
      });

      // Call callback if provided (from LocationPicker flow)
      if (onLocationCreated) {
        onLocationCreated(newLocation.id);
      } else {
        // Navigate back to LocationsScreen
        Alert.alert('Success', 'Location created');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Location Name *</Text>
          <PaperTextInput
            mode="outlined"
            placeholder="e.g., Garage, Bedroom, Basement"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                const newErrors = { ...errors };
                delete newErrors.name;
                setErrors(newErrors);
              }
            }}
            editable={!loading}
            error={!!errors.name}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Photo (Optional)</Text>
          {photoPreview && (
            <Image
              source={{ uri: photoPreview }}
              style={styles.photoPreview}
              resizeMode="cover"
            />
          )}
          <Button
            mode="contained-tonal"
            onPress={handleSelectPhoto}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Processing...' : 'Select Photo'}
          </Button>
          {photo && (
            <TouchableOpacity
              onPress={() => {
                setPhoto(undefined);
                setPhotoPreview(undefined);
              }}
              disabled={loading}
            >
              <Text style={styles.removePhotoText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={loading}
            style={styles.button}
            loading={loading}
          >
            Create Location
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.button}
          >
            Cancel
          </Button>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  error: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    marginBottom: 8,
  },
  buttonGroup: {
    marginTop: 20,
  },
  removePhotoText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    padding: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddLocationScreen;
