import { configureStore } from '@reduxjs/toolkit';

import { createGaMiddleware } from '../utils/analytics';
import { load, saveMiddleware } from './saveload';

import exportReminder from 'app/components/ExportReminder/slice';
import mainPage from 'app/pages/MainPage/slice';
import career from 'app/slices/CareerSlice';
import changelog from 'app/slices/ChangelogSlice';
import connectivity from 'app/slices/ConnectivitySlice';
import cookieConsent from 'app/slices/CookieConsentSlice';
import saveMeta from 'app/slices/SaveMetaSlice';
import settings from 'app/slices/SettingsSlice';
import welcome from 'app/slices/WelcomeSlice';

export function configureAppStore(preloadedState?: object) {
  const middlewares = [saveMiddleware];
  if (process.env.NODE_ENV === 'production') {
    middlewares.push(createGaMiddleware());
  }

  if (preloadedState === undefined) {
    if (process.env.NODE_ENV === 'test') {
      preloadedState = {};
    } else {
      preloadedState = load(true) || {};
    }
  }

  const store = configureStore({
    reducer: {
      career,
      mainPage,
      exportReminder,
      saveMeta,
      welcome,
      connectivity,
      changelog,
      settings,
      cookieConsent,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(middlewares),
    devTools: process.env.NODE_ENV !== 'production',
    preloadedState,
  });

  return store;
}
