/**
 * ItemCard Component
 * 
 * Displays an individual item in a list/grid format
 * Shows: thumbnail photo, name, location tag (if set), created date
 * 
 * Props:
 * - item: Item object to display
 * - onPress: Callback when card is pressed
 * 
 * Design: React Native Paper Card component with elevation
 * Responsive: Works on phones and tablets
 */

import React from 'react';
import { View, StyleSheet, Image, Text as RNText } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import type { Item } from '../types/Item';
import { formatTimeAgo, truncateText } from '@utils/formatters';

interface ItemCardProps {
  item: Item;
  onPress?: () => void;
}

/**
 * ItemCard Component
 * 
 * Displays item information in a card format
 * - Thumbnail: 60x60px photo or placeholder icon
 * - Name: Truncated to 20 chars with ellipsis
 * - Description: Optional, truncated to 40 chars
 * - Location: Tag showing location name if assigned
 * - Created date: "2 hours ago" format
 * - Touch feedback: Ripple effect on press
 */
export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    card: {
      marginHorizontal: 8,
      marginVertical: 6,
      backgroundColor: theme.colors.surface,
    },
    cardContent: {
      flexDirection: 'row',
      padding: 12,
      alignItems: 'center',
      gap: 12,
    },
    thumbnail: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    thumbnailImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    placeholderIcon: {
      color: theme.colors.onSurfaceVariant,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      gap: 4,
    },
    nameText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    descriptionText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    metaContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      marginTop: 6,
    },
    locationTag: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    locationTagText: {
      fontSize: 10,
      color: theme.colors.onPrimaryContainer,
      fontWeight: '500',
    },
    dateText: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
    },
  });

  const truncatedName = truncateText(item.name, 20);
  const truncatedDescription = item.description ? truncateText(item.description, 40) : '';
  const timeAgo = formatTimeAgo(item.createdAt);

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.cardContent}>
          {/* Thumbnail */}
          <View style={styles.thumbnail}>
            {item.photo ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${item.photo}` }}
                style={styles.thumbnailImage}
              />
            ) : (
              <RNText style={{ fontSize: 32 }}>📦</RNText>
            )}
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Name */}
            <Text style={styles.nameText}>{truncatedName}</Text>

            {/* Description */}
            {truncatedDescription && (
              <Text style={styles.descriptionText}>{truncatedDescription}</Text>
            )}

            {/* Meta: Location Tag + Date */}
            <View style={styles.metaContainer}>
              {/* Location Tag */}
              {item.locationId && (
                <View style={styles.locationTag}>
                  <Text style={styles.locationTagText}>📍 Set</Text>
                </View>
              )}

              {/* Date */}
              <Text style={styles.dateText}>{timeAgo}</Text>
            </View>
          </View>

          {/* Chevron */}
          <RNText style={{ fontSize: 20, color: theme.colors.onSurfaceVariant }}>›</RNText>
        </View>
      </Card.Content>
    </Card>
  );
};

export default ItemCard;
