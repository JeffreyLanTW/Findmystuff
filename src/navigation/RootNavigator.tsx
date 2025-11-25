import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens (to be created in Phase 3-4)
// For now, we'll create placeholder screens

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
        component={() => <></>} // Placeholder - to be implemented in Phase 4 (T026)
        options={{
          title: 'My Inventory',
        }}
      />
      <HomeStack.Screen
        name="ItemDetail"
        component={() => <></>} // Placeholder - to be implemented in Phase 4 (T030)
        options={{
          title: 'Item Details',
        }}
      />
      <HomeStack.Screen
        name="AddItem"
        component={() => <></>} // Placeholder - to be implemented in Phase 3 (T018)
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
        component={() => <></>} // Placeholder - to be implemented in Phase 5 (T034)
        options={{
          title: 'Locations',
        }}
      />
      <LocationsStack.Screen
        name="LocationDetail"
        component={() => <></>} // Placeholder - to be implemented in Phase 5
        options={{
          title: 'Location Details',
        }}
      />
      <LocationsStack.Screen
        name="AddLocation"
        component={() => <></>} // Placeholder - to be implemented in Phase 5 (T035)
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
