import { RootState } from 'types';

import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './';

const selectSlice = (state: RootState) =>
  state.dataDebugPageSlice || initialState;

export const selectDataDebugPageSlice = createSelector(
  [selectSlice],
  state => state,
);
