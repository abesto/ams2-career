import { createSelector } from '@reduxjs/toolkit';

import initialState from './initialState';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.cookieConsent || initialState;

export const selectCookieConsent = createSelector(
  [selectSlice],
  state => state,
  { devModeChecks: { identityFunctionCheck: 'never' } },
);
