import LZString from 'lz-string';
import GitInfo from 'react-git-info/macro';
import { AnyAction, Middleware } from 'redux';

import { createAction, Reducer } from '@reduxjs/toolkit';

import { RootState } from 'types';

function saveKey(version: number | string) {
  if (typeof version === 'string' && version.startsWith('app:save:')) {
    return version;
  }
  return `app:save:${version}`;
}

const MIGRATIONS = [
  // Add saveVersion and timestamp
  (state: RootState) => {
    state.saveMeta = {
      timestamp: Date.now(),
      version: 0,
    };
  },
  // Add AI Adjustments
  (state: RootState) => {
    state.mainPage!.aiAdjustment = {
      global: 0,
      discipline: {},
      carClass: {},
      car: {},
    };
  },
];

const LATEST = 'latest';

export function versionForNewSaves(): number {
  return MIGRATIONS.length;
}

function getSaveVersion(state: RootState) {
  return state.saveMeta?.version || 0;
}

function applyMigration(migration: number, state: RootState) {
  const currentVersion = getSaveVersion(state);
  if (currentVersion !== migration) {
    throw new Error(
      `Cannot apply migration ${migration} to state with version ${currentVersion}`,
    );
  }
  MIGRATIONS[migration](state);
  state.saveMeta!.version = migration + 1;
}

function applyAllMigrations(state: RootState): RootState {
  while (getSaveVersion(state) < MIGRATIONS.length) {
    save(state, `backup:migration:${getSaveVersion(state)}`);
    applyMigration(getSaveVersion(state), state);
  }
  return state;
}

function addCommitVersion(state: RootState): RootState {
  const gitInfo = GitInfo();
  state.saveMeta!.commit = {
    hash: gitInfo.commit.hash,
    date: gitInfo.commit.date,
  };
  return state;
}

export function load(
  shouldApplyMigrations: boolean,
  version: number | string = LATEST,
): RootState | null {
  const raw = localStorage.getItem(saveKey(version));
  if (!raw) {
    return null;
  }
  const data = deserialize(raw);
  if (shouldApplyMigrations) {
    applyAllMigrations(data);
  }
  addCommitVersion(data);
  return data;
}

export function save(
  state: RootState,
  version: number | string = LATEST,
): void {
  localStorage.setItem(saveKey(version), serialize(state));
}

export function serialize(state: RootState): string {
  const data = { ...state };
  delete data.connectivity;
  return LZString.compressToUTF16(JSON.stringify(data));
}

export function deserialize(s: string): RootState {
  const decompressed = LZString.decompressFromUTF16(s);
  if (decompressed === null) {
    return JSON.parse(s);
  }
  return JSON.parse(decompressed);
}

export const saveMiddleware: Middleware<{}, RootState> =
  storeApi => next => action => {
    next(action);
    if (action.type !== 'saveMeta/updateTimestamp') {
      storeApi.dispatch({ type: 'saveMeta/updateTimestamp' });
    } else {
      save(storeApi.getState());
    }
  };

export function clear(): void {
  backup('clear');
  localStorage.removeItem(saveKey(LATEST));
}

export const loadActionType = createAction<RootState>('LOAD');

export const makeLoadableReducer: (r: any) => Reducer<RootState, AnyAction> =
  reducer => (state, action) => {
    if (action.type === loadActionType.type) {
      return applyAllMigrations(action.payload);
    } else {
      return reducer(state, action);
    }
  };

export function backup(name: string): void {
  const last = localStorage.getItem(saveKey(LATEST));
  if (last) {
    localStorage.setItem(saveKey(`backup:${name}`), last);
  }
}

export function availableVersions(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('app:save:')) {
      keys.push(key);
    }
  }
  return keys;
}
