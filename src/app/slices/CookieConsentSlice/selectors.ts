import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

const selectSlice = (state: RootState) => state.cookieConsent || initialState;

export const selectCookieConsent = createSelector(
  [selectSlice],
  state => state,
);
