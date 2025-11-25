import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '@store/index';
import { AddItemScreen } from '@screens/AddItemScreen';

describe('AddItemScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <AddItemScreen navigation={mockNavigation as any} />
      </Provider>
    );

    expect(getByTestId).toBeDefined();
  });
});

