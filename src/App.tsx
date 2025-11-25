import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { RootNavigator } from '@navigation/RootNavigator';
import { store } from '@store/index';
import { initDatabase } from '@services/database';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize database on app startup
    initDatabase().catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PaperProvider>
          <RootNavigator />
        </PaperProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
};

export default App;
