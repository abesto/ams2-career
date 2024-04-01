import { createSlice } from '@reduxjs/toolkit';

import initialState from './initialState';

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
