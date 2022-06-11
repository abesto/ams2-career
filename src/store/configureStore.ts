/**
 * Create the store with dynamic reducers
 */

import { createInjectorsEnhancer } from 'redux-injectors';
import createSagaMiddleware from 'redux-saga';

import {
  configureStore,
  getDefaultMiddleware,
  StoreEnhancer,
} from '@reduxjs/toolkit';

import { gaMiddlewareWithConsent } from '../utils/analytics';
import { createReducerWithPlaceholders } from './reducers';
import { load, saveMiddleware } from './saveload';

export function configureAppStore() {
  const reduxSagaMonitorOptions = {};
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with saga middleware
  const middlewares = [sagaMiddleware, saveMiddleware, gaMiddlewareWithConsent];

  const preloadedState = load(true) || {};

  // Create dummy reducers so that saved state for them is not dropped by redux
  const dummyReducers = {};
  for (const key of Object.keys(preloadedState)) {
    dummyReducers[key] = (state: any) => state || null;
  }
  const createReducer = createReducerWithPlaceholders(dummyReducers);

  const enhancers = [
    createInjectorsEnhancer({
      createReducer,
      runSaga,
    }),
  ] as StoreEnhancer[];

  const store = configureStore({
    reducer: createReducer(dummyReducers),
    middleware: [...getDefaultMiddleware(), ...middlewares],
    devTools: process.env.NODE_ENV !== 'production',
    enhancers,
    preloadedState,
  });

  return store;
}
