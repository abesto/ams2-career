import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import initialState from './initialState';
import { SemVerWithRaw } from './types';

const slice = createSlice({
  name: 'changelog',
  initialState,
  reducers: {
    setSeenVersion(state, action: PayloadAction<SemVerWithRaw>) {
      state.seenVersion = action.payload;
    },
  },
});

export const { setSeenVersion } = slice.actions;
export default slice.reducer;
