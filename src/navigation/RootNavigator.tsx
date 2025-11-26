import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import { HomeScreen } from '@screens/HomeScreen';
import { ItemDetailScreen } from '@screens/ItemDetailScreen';
import { AddItemScreen } from '@screens/AddItemScreen';
import { LocationsScreen } from '@screens/LocationsScreen';
import { AddLocationScreen } from '@screens/AddLocationScreen';
import { LocationDetailScreen } from '@screens/LocationDetailScreen';

// Types
import type { RootTabParamList, HomeStackParamList, LocationsStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LocationsStack = createNativeStackNavigator<LocationsStackParamList>();

/**
 * Home Stack Navigator
 */
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'My Inventory',
        }}
      />
      <HomeStack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{
          title: 'Item Details',
        }}
      />
      <HomeStack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{
          title: 'Add Item',
        }}
      />
    </HomeStack.Navigator>
  );
};

/**
 * Locations Stack Navigator
 */
const LocationsStackNavigator: React.FC = () => {
  return (
    <LocationsStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <LocationsStack.Screen
        name="Locations"
        component={LocationsScreen}
        options={{
          title: 'Locations',
        }}
      />
      <LocationsStack.Screen
        name="LocationDetail"
        component={LocationDetailScreen}
        options={{
          title: 'Location Details',
        }}
      />
      <LocationsStack.Screen
        name="AddLocation"
        component={AddLocationScreen}
        options={{
          title: 'Add Location',
        }}
      />
    </LocationsStack.Navigator>
  );
};

/**
 * Root Navigator with Bottom Tab Navigation
 */
export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: string;

            if (route.name === 'HomeTab') {
              iconName = 'home';
            } else if (route.name === 'LocationsTab') {
              iconName = 'map-marker';
            } else {
              iconName = 'help';
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            title: 'Inventory',
          }}
        />
        <Tab.Screen
          name="LocationsTab"
          component={LocationsStackNavigator}
          options={{
            title: 'Locations',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
