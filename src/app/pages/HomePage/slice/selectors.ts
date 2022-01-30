import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

const selectSlice = (state: RootState) => state.homePageSlice || initialState;

export const selectHomePageSlice = createSelector(
  [selectSlice],
  state => state,
);
