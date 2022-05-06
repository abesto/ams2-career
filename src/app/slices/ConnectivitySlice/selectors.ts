import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.connectivity || initialState;

export const selectOnline = createSelector(
  [selectSlice],
  state => state.online,
);
