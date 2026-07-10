import { RootState } from 'types';
import { initialState } from '.';

export const selectCookieConsent = (state: RootState) =>
  state.cookieConsent || initialState;
