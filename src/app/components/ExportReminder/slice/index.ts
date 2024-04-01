import { createSlice } from '@reduxjs/toolkit';

import initialState from './initialState';

const slice = createSlice({
  name: 'exportReminder',
  initialState,
  reducers: {
    recordExport(state) {
      state.lastExport = new Date().getTime();
    },
    hideAlertForever(state) {
      state.hideAlertForever = true;
    },
  },
});

export const { recordExport, hideAlertForever } = slice.actions;
export default slice.reducer;
