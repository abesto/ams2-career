import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import initialState from './initialState';

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
