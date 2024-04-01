import { createSelector } from '@reduxjs/toolkit';

import initialState from './initialState';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.saveMeta || initialState;

export const selectSaveTimestamp = createSelector(
  [selectSlice],
  state => state,
  { devModeChecks: { identityFunctionCheck: 'never' } },
);
