import { versionForNewSaves } from 'store/saveload';

import { createSlice } from '@reduxjs/toolkit';

import { SaveMetaState } from './types';

export const initialState: SaveMetaState = {
  timestamp: Date.now(),
  version: versionForNewSaves(),
};

const slice = createSlice({
  name: 'saveMeta',
  initialState,
  reducers: {
    updateTimestamp(state) {
      state.timestamp = Date.now();
    },
  },
});

export const { updateTimestamp } = slice.actions;
export default slice.reducer;
