import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  showAddItemModal: boolean;
  showAddLocationModal: boolean;
  globalError: string | null;
  globalSuccess: string | null;
}

const initialState: UIState = {
  showAddItemModal: false,
  showAddLocationModal: false,
  globalError: null,
  globalSuccess: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddItemModal: (state: UIState) => {
      state.showAddItemModal = true;
    },
    closeAddItemModal: (state: UIState) => {
      state.showAddItemModal = false;
    },
    openAddLocationModal: (state: UIState) => {
      state.showAddLocationModal = true;
    },
    closeAddLocationModal: (state: UIState) => {
      state.showAddLocationModal = false;
    },
    setGlobalError: (state: UIState, action: PayloadAction<string | null>) => {
      state.globalError = action.payload;
    },
    setGlobalSuccess: (state: UIState, action: PayloadAction<string | null>) => {
      state.globalSuccess = action.payload;
    },
  },
});

export const {
  openAddItemModal,
  closeAddItemModal,
  openAddLocationModal,
  closeAddLocationModal,
  setGlobalError,
  setGlobalSuccess,
} = uiSlice.actions;

export default uiSlice.reducer;

/**
 * Selectors
 */
export const selectShowAddItemModal = (state: { ui: UIState }) => state.ui.showAddItemModal;
export const selectShowAddLocationModal = (state: { ui: UIState }) => state.ui.showAddLocationModal;
export const selectGlobalError = (state: { ui: UIState }) => state.ui.globalError;
export const selectGlobalSuccess = (state: { ui: UIState }) => state.ui.globalSuccess;
