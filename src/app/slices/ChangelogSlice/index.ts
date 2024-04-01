import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ChangelogState, SemVerWithRaw } from './types';

export const initialState: ChangelogState = {
  seenVersion: {
    raw: '0.0.0',
    major: 0,
    minor: 0,
    patch: 0,
  },
};

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
