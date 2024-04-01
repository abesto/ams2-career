import { Cookies } from 'react-cookie-consent';
import { useDispatch, useSelector } from 'react-redux';

import { selectCookieConsent } from './selectors';

import {
  COOKIE_NAME,
  CookieConsentValue,
} from 'app/components/OurCookieConsent';
import * as actions from 'app/slices/CookieConsentSlice';

export function useCookieConsentValue(): [
  string | undefined,
  (value: CookieConsentValue) => void,
] {
  const dispatch = useDispatch();
  const cookieConsentValue =
    useSelector(selectCookieConsent).cookieConsentValue;

  const setValue = (value: CookieConsentValue) => {
    Cookies.set(COOKIE_NAME, value, { sameSite: 'strict' });
    dispatch(actions.setCookieConsentValue(value));
  };

  return [cookieConsentValue, setValue];
}
