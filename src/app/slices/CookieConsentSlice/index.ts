import { getCookieConsentValue } from 'react-cookie-consent';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CookieConsentState } from './types';

import { CookieConsentValue } from 'app/components/OurCookieConsent';

export const initialState: CookieConsentState = {
  cookieConsentValue: getCookieConsentValue() as CookieConsentValue | undefined,
};

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
