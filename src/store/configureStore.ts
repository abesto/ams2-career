/**
 * Create the store with dynamic reducers
 */

import { createInjectorsEnhancer } from 'redux-injectors';
import { load, save } from 'redux-localstorage-simple';
import createSagaMiddleware from 'redux-saga';

import {
  configureStore,
  getDefaultMiddleware,
  StoreEnhancer,
} from '@reduxjs/toolkit';

import { createReducerWithPlaceholders } from './reducers';

export function configureAppStore() {
  const reduxSagaMonitorOptions = {};
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with saga middleware
  const middlewares = [
    sagaMiddleware,
    save({ ignoreStates: ['DebugPageSlice'], debounce: 1000 }),
  ];

  const preloadedState = load();

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
