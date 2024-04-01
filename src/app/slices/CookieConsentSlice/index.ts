import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import initialState from './initialState';

import { CookieConsentValue } from 'app/components/OurCookieConsent';

const slice = createSlice({
  name: 'cookieConsent',
  initialState,
  reducers: {
    setCookieConsentValue(state, action: PayloadAction<CookieConsentValue>) {
      state.cookieConsentValue = action.payload;
    },
  },
});

export const { setCookieConsentValue } = slice.actions;
export default slice.reducer;
