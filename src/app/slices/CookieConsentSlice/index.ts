import { getCookieConsentValue } from 'react-cookie-consent';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

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

export const { actions: cookieConsentActions } = slice;

export const useCookieConsentSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useCookieConsentSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
