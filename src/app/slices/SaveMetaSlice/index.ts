import { versionForNewSaves } from 'store/saveload';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

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

export const { actions: saveTimestampActions } = slice;

export const useSaveTimestampSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};
