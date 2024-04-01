import { getCookieConsentValue } from 'react-cookie-consent';

import { CookieConsentState } from './types';

import { CookieConsentValue } from 'app/components/OurCookieConsent';

const initialState: CookieConsentState = {
  cookieConsentValue: getCookieConsentValue() as CookieConsentValue | undefined,
};

export default initialState;
