import * as React from 'react';
import CookieConsent, { Cookies } from 'react-cookie-consent';
import { useDispatch, useSelector } from 'react-redux';

import { useCookieConsentSlice } from 'app/slices/CookieConsentSlice';
import { selectCookieConsent } from 'app/slices/CookieConsentSlice/selectors';

export const COOKIE_NAME = 'CookieConsent';
export const GRANTED = 'granted';
export const DECLINED = 'declined';
export type CookieConsentValue = typeof GRANTED | typeof DECLINED;

export function useCookieConsentValue(): [
  string | undefined,
  (value: CookieConsentValue) => void,
] {
  const dispatch = useDispatch();
  const actions = useCookieConsentSlice().actions;
  const cookieConsentValue =
    useSelector(selectCookieConsent).cookieConsentValue;

  const setValue = (value: CookieConsentValue) => {
    Cookies.set(COOKIE_NAME, value);
    dispatch(actions.setCookieConsentValue(value));
  };

  return [cookieConsentValue, setValue];
}

export const OurCookieConsent = () => {
  const [cookieConsentValue, setCookieConsentValue] = useCookieConsentValue();

  return (
    <CookieConsent
      enableDeclineButton
      cookieName={COOKIE_NAME}
      cookieValue={GRANTED}
      declineCookieValue={DECLINED}
      visible={cookieConsentValue === undefined ? 'show' : 'hidden'}
      onAccept={() => setCookieConsentValue(GRANTED)}
      onDecline={() => setCookieConsentValue(DECLINED)}
    >
      This website uses cookies to enhance the user experience.{' '}
      <span style={{ fontSize: '12px', color: 'lightGray' }}>
        In particular, we use Google Analytics to understand your use of the
        app. You can change this later in the Settings menu.
      </span>
    </CookieConsent>
  );
};
