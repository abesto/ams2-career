/**
 * Create the store with dynamic reducers
 */

import createSagaMiddleware from 'redux-saga';

import { configureStore, StoreEnhancer } from '@reduxjs/toolkit';

import { createGaMiddleware } from '../utils/analytics';
import { createInjectorsEnhancer } from '../utils/redux-injectors';
import { createReducerWithPlaceholders } from './reducers';
import { load, saveMiddleware } from './saveload';

export function configureAppStore(preloadedState?: any) {
  const reduxSagaMonitorOptions = {};
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with saga middleware
  const middlewares = [sagaMiddleware, saveMiddleware];
  if (import.meta.env.PROD) {
    middlewares.push(createGaMiddleware());
  }

  if (preloadedState === undefined) {
    if (import.meta.env.MODE === 'test') {
      preloadedState = {};
    } else {
      preloadedState = load(true) || {};
    }
  }

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
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(...middlewares),
    devTools: !import.meta.env.PROD,
    enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(enhancers),
    preloadedState,
  });

  return store;
}
