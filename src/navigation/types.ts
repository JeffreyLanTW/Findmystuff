import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Home Stack Navigation Params
 */
export type HomeStackParamList = {
  Home: undefined;
  ItemDetail: { itemId: string };
  AddItem: { itemId?: string } | undefined;
};

/**
 * Locations Stack Navigation Params
 */
export type LocationsStackParamList = {
  Locations: undefined;
  LocationDetail: { locationId: string };
  AddLocation: { locationId?: string } | undefined;
};

/**
 * Root Tab Navigation Params
 */
export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  LocationsTab: NavigatorScreenParams<LocationsStackParamList>;
};

/**
 * Screen Props Types
 */
export type HomeTabScreenProps<Screen extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  Screen
>;

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> = NativeStackScreenProps<
  HomeStackParamList,
  Screen
>;

export type LocationsStackScreenProps<Screen extends keyof LocationsStackParamList> =
  NativeStackScreenProps<LocationsStackParamList, Screen>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
