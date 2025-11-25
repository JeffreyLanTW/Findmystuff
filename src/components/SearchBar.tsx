/**
 * SearchBar Component
 * 
 * Search input field with optional clear button
 * Features:
 * - Search icon at start
 * - Clear (x) button when query is not empty
 * - Real-time input with debounce support
 * - Lightweight and reusable
 * 
 * Props:
 * - query: Current search query string
 * - onQueryChange: Callback when query changes
 * - onClear: Callback when clear button is pressed
 * - placeholder: Optional placeholder text
 */

import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * SearchBar Component
 * 
 * Provides a Material Design search input with:
 * - Search icon (built-in to Searchbar)
 * - Clear button automatically shown when query is not empty
 * - Debounce support to prevent excessive re-renders
 * - Accessible and keyboard-friendly
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onClear,
  placeholder = 'Search items...',
  debounceMs = 300,
}) => {
  const theme = useTheme();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced query change handler
  const handleQueryChange = useCallback(
    (text: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        onQueryChange(text);
      }, debounceMs);
    },
    [onQueryChange, debounceMs]
  );

  // Handle clear button press
  const handleClear = useCallback(() => {
    // Immediately clear
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onClear();
  }, [onClear]);

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
    },
    searchbar: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      elevation: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleQueryChange}
        value={query}
        onClearIconPress={handleClear}
        style={styles.searchbar}
        icon="magnify"
        clearIcon={query ? 'close' : undefined}
        testID="search-bar-input"
      />
    </View>
  );
};

export default SearchBar;
