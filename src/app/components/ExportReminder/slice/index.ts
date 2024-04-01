import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { ExportReminderState } from './types';

export const initialState: ExportReminderState = {
  lastExport: null,
  hideAlertForever: false,
};

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

export const { actions: exportReminderActions } = slice;

export const useExportReminderSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};
