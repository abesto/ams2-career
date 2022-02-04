/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { InjectedReducersType } from 'utils/types/injector-typings';

import { combineReducers } from '@reduxjs/toolkit';

import { makeLoadableReducer } from './saveload';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
function createReducer(injectedReducers: InjectedReducersType = {}) {
  // Initially we don't have any injectedReducers, so returning identity function to avoid the error
  if (Object.keys(injectedReducers).length === 0) {
    return state => state;
  } else {
    return combineReducers({
      ...injectedReducers,
    });
  }
}

export function createReducerWithPlaceholders(placeholders: any) {
  return (injectedReducers: InjectedReducersType) => {
    const reducers = {
      ...placeholders,
      ...injectedReducers,
    };
    return makeLoadableReducer(createReducer(reducers));
  };
}
