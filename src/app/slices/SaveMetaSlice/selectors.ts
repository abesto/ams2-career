import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.saveMeta || initialState;

export const selectSaveTimestamp = createSelector(
  [selectSlice],
  state => state,
);
