import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

const selectSlice = (state: RootState) =>
  state.dataDebugPageSlice || initialState;

export const selectDataDebugPageSlice = createSelector(
  [selectSlice],
  state => state,
);
