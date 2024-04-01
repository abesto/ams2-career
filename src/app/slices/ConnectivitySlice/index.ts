import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ConnectivityState } from './types';

export const initialState: ConnectivityState = {
  online: navigator.onLine,
};

const slice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    update(state, action: PayloadAction<boolean>) {
      state.online = action.payload;
    },
  },
});

export const { update } = slice.actions;
export default slice.reducer;
