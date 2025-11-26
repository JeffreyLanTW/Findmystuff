import React, { useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store/index';
import { createItemAsync } from '@store/itemSlice';
import { selectImage, compressImage } from '@services/imageService';
import { validateItemName } from '@utils/validators';
import { getErrorMessage } from '@utils/errors';
import LocationPicker from '../../components/LocationPicker';

export interface AddItemScreenProps {
  navigation: any;
  route?: any;
}

/**
 * AddItemScreen - Form for adding a new item to inventory
 * Supports name, description, location, and photo
 */
export const AddItemScreen: React.FC<AddItemScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationId, setLocationId] = useState<string | undefined>();
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /**
   * Handle location selection from LocationPicker
   */
  const handleLocationSelect = async (selectedLocationId: string) => {
    setLocationId(selectedLocationId);
    setShowLocationPicker(false);
    
    // Fetch location name for display
    try {
      const { getLocation } = await import('../../services/locationService');
      const location = await getLocation(selectedLocationId);
      setSelectedLocationName(location.name);
    } catch (error) {
      console.error('Failed to fetch location:', error);
      setSelectedLocationName('Unknown Location');
    }
  };

  /**
   * Clear selected location
   */
  const handleClearLocation = () => {
    setLocationId(undefined);
    setSelectedLocationName('');
  };

  /**
   * Handle image selection and compression
   */
  const handleSelectPhoto = async () => {
    try {
      const options: ('gallery' | 'camera')[] = ['gallery', 'camera'];
      
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
   * Validate form and save item
   */
  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    const nameValidation = validateItemName(name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error || 'Invalid name';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Create item
      await dispatch(
        createItemAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          photo,
          locationId,
        })
      ).unwrap();

      // Success - navigate back
      Alert.alert('Success', 'Item added successfully');
      navigation.goBack();
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
          <Text style={styles.label}>Item Name *</Text>
          <PaperTextInput
            mode="outlined"
            placeholder="e.g., Camera"
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

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <PaperTextInput
            mode="outlined"
            placeholder="Optional description"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Location Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <Button
            mode={selectedLocationName ? 'contained-tonal' : 'outlined'}
            onPress={() => setShowLocationPicker(true)}
            disabled={loading}
            style={styles.button}
          >
            {selectedLocationName ? `📍 ${selectedLocationName}` : 'Select Location'}
          </Button>
          {selectedLocationName && (
            <TouchableOpacity
              onPress={handleClearLocation}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              <Text style={styles.removePhotoText}>Remove Location</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Photo</Text>
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
            Save Item
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

        {/* Location Picker Modal */}
        <LocationPicker
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleLocationSelect}
          selected={locationId}
          onCreateNew={() => {
            // Navigate to AddLocationScreen when user wants to create new location
            setShowLocationPicker(false);
            navigation.navigate('LocationsTab', {
              screen: 'AddLocation',
              params: { onLocationCreated: handleLocationSelect },
            });
          }}
        />
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
