import { createSelector } from '@reduxjs/toolkit';

import initialState from './initialState';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.welcome || initialState;

export const selectWelcome = createSelector([selectSlice], state => state, {
  devModeChecks: { identityFunctionCheck: 'never' },
});
