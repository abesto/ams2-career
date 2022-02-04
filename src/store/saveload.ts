import LZString from 'lz-string';
import { Middleware } from 'redux';
import { RootState } from 'types';

const DEFAULT_KEY = 'app:v1';

export function load(key: string = DEFAULT_KEY): RootState {
  const state = localStorage.getItem(key);
  if (!state) {
    return {};
  }
  const decompressed = LZString.decompressFromUTF16(state);
  if (decompressed === null) {
    return JSON.parse(state);
  }
  return JSON.parse(decompressed);
}

export function save(state: RootState, key: string = DEFAULT_KEY): void {
  localStorage.setItem(key, LZString.compressToUTF16(JSON.stringify(state)));
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
