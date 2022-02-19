import LZString from 'lz-string';
import { AnyAction, Middleware } from 'redux';

import { createAction, Reducer } from '@reduxjs/toolkit';

import { RootState } from 'types';

const DEFAULT_KEY = 'app:v1';

export function load(key: string = DEFAULT_KEY): RootState {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return {};
  }
  return deserialize(raw);
}

export function save(state: RootState, key: string = DEFAULT_KEY): void {
  localStorage.setItem(key, serialize(state));
}

export function serialize(state: RootState): string {
  return LZString.compressToUTF16(JSON.stringify(state));
}

export function deserialize(s: string): RootState {
  const decompressed = LZString.decompressFromUTF16(s);
  if (decompressed === null) {
    return JSON.parse(s);
  }
  return JSON.parse(decompressed);
}

export const saveMiddleware: (key?: string) => Middleware<{}, RootState> =
  (key: string = DEFAULT_KEY) =>
  storeApi =>
  next =>
  action => {
    next(action);
    save(storeApi.getState(), key);
  };

export function clear(key: string = DEFAULT_KEY): void {
  localStorage.removeItem(key);
}

export const loadActionType = createAction<RootState>('LOAD');

export const makeLoadableReducer: (r: any) => Reducer<RootState, AnyAction> =
  reducer => (state, action) => {
    if (action.type === loadActionType.type) {
      return action.payload;
    } else {
      return reducer(state, action);
    }
  };
