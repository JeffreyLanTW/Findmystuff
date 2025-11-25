import { configureStore } from '@reduxjs/toolkit';
import itemReducer from './itemSlice';
import locationReducer from './locationSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    items: itemReducer,
    locations: locationReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
