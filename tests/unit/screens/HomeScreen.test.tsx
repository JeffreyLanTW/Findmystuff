import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import itemReducer from '../../../src/store/itemSlice';
import uiReducer from '../../../src/store/uiSlice';
import locationReducer from '../../../src/store/locationSlice';
import { HomeScreen } from '../../../src/screens/HomeScreen';

describe('Component: HomeScreen', () => {
  const createMockNavigation = () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  });

  test('should render without crashing', () => {
    const store = configureStore({
      reducer: {
        items: itemReducer,
        ui: uiReducer,
        locations: locationReducer,
      },
    });

    const mockNavigation = createMockNavigation();

    const { getByTestId } = render(
      <Provider store={store}>
        <HomeScreen navigation={mockNavigation as any} />
      </Provider>
    );

    expect(getByTestId).toBeDefined();
  });
});

