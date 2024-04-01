import { createSelector } from '@reduxjs/toolkit';

import initialState from './initialState';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.changelog || initialState;

export const selectChangelog = createSelector([selectSlice], state => state, {
  devModeChecks: { identityFunctionCheck: 'never' },
});
