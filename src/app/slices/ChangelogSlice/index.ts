import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { ChangelogState, SemVer } from './types';

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
    setSeenVersion(state, action: PayloadAction<SemVer>) {
      state.seenVersion = action.payload;
    },
  },
});

export const { actions: changelogActions } = slice;

export const useChangelogSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useChangelogSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
