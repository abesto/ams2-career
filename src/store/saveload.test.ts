import {
  availableVersions,
  backup,
  clear,
  load,
  loadActionType,
  loadStr,
  makeLoadableReducer,
  save,
  saveMiddleware,
  serialize,
  versionForNewSaves,
} from './saveload';
import { vi } from 'vitest';

import { RootState } from 'types';

function sampleState(overrides: Partial<RootState> = {}): RootState {
  return {
    career: {
      raceResults: [],
    },
    saveMeta: {
      version: versionForNewSaves(),
      timestamp: 1000,
    },
    ...overrides,
  };
}

describe('saveload', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves and loads compressed state while dropping transient keys', () => {
    const state = sampleState({
      connectivity: { online: true },
      cookieConsent: {},
      changelog: {
        seenVersion: { raw: '1.2.3', major: 1, minor: 2, patch: 3 },
      },
    });

    save(state);

    const loaded = load(true);

    expect(loaded).toEqual({
      career: {
        raceResults: [],
      },
      saveMeta: {
        version: versionForNewSaves(),
        timestamp: 1000,
        commit: expect.objectContaining({
          hash: expect.any(String),
          date: expect.any(String),
        }),
      },
      changelog: {
        seenVersion: { raw: '1.2.3', major: 1, minor: 2, patch: 3 },
      },
    });
    expect(window.localStorage.getItem('app:save:latest')).not.toBeNull();
  });

  it('loads legacy plain JSON strings', () => {
    window.localStorage.setItem(
      'app:save:latest',
      JSON.stringify(
        sampleState({ saveMeta: { version: 3, timestamp: 1000 } }),
      ),
    );

    const loaded = load(true);

    expect(loaded?.saveMeta).toEqual({
      version: 3,
      timestamp: 1000,
      commit: expect.objectContaining({
        hash: expect.any(String),
        date: expect.any(String),
      }),
    });
  });

  it('loads legacy saves without saveMeta when migrations are skipped', () => {
    const loaded = loadStr(
      JSON.stringify({ career: { raceResults: [] } }),
      false,
    );

    expect(loaded?.saveMeta).toEqual({
      version: 0,
      timestamp: expect.any(Number),
      commit: expect.objectContaining({
        hash: expect.any(String),
        date: expect.any(String),
      }),
    });
  });

  it('applies migrations, rewrites old track ids, and creates migration backups', () => {
    const preMigrationState: RootState = {
      career: {
        raceResults: [
          {
            generatedAt: 10,
            simTime: 20,
            trackId: 'Jacarepagua-Kart-1' as any,
            carClassId: 'GT5' as any,
            playerLevel: 1,
            aiLevel: 95,
            racedAt: 30,
            position: 1,
            carId: 'Ginetta G40 Cup' as any,
          },
        ],
      },
      mainPage: {
        raceOptions: [
          {
            generatedAt: 40,
            simTime: 50,
            trackId: 'Jacarepagua-Kart-2' as any,
            carClassId: 'GT5' as any,
            playerLevel: 1,
            aiLevel: 95,
          },
        ],
        selectedRaceIndex: 0,
        selectedCars: {},
      } as any,
    };

    const loaded = loadStr(JSON.stringify(preMigrationState), true);

    expect(loaded?.saveMeta?.version).toBe(versionForNewSaves());
    expect(loaded?.mainPage?.aiAdjustment).toEqual({
      global: 0,
      discipline: {},
      carClass: {},
      car: {},
    });
    expect(loaded?.career?.raceResults[0].trackId).toBe('Interlagos-Kart-1');
    expect(loaded?.mainPage?.raceOptions[0].trackId).toBe('Interlagos-Kart-2');
    expect(
      window.localStorage.getItem('app:save:backup:migration:0'),
    ).not.toBeNull();
    expect(
      window.localStorage.getItem('app:save:backup:migration:1'),
    ).not.toBeNull();
    expect(
      window.localStorage.getItem('app:save:backup:migration:2'),
    ).not.toBeNull();
  });

  it('loads changelog state from its separate storage key', () => {
    window.localStorage.setItem(
      'changelog',
      serialize({
        seenVersion: { raw: '1.0.1', major: 1, minor: 0, patch: 1 },
      }),
    );

    const loaded = loadStr(serialize(sampleState()), true);

    expect(loaded?.changelog).toEqual({
      seenVersion: { raw: '1.0.1', major: 1, minor: 0, patch: 1 },
    });
  });

  it('backs up and clears the latest save', () => {
    window.localStorage.setItem('app:save:latest', serialize(sampleState()));

    backup('manual');
    clear();

    expect(window.localStorage.getItem('app:save:latest')).toBeNull();
    expect(
      window.localStorage.getItem('app:save:backup:manual'),
    ).not.toBeNull();
    expect(window.localStorage.getItem('app:save:backup:clear')).not.toBeNull();
  });

  it('lists available saved versions', () => {
    window.localStorage.setItem('app:save:latest', 'a');
    window.localStorage.setItem('app:save:backup:reset', 'b');
    window.localStorage.setItem('other:key', 'c');

    expect(availableVersions().sort()).toEqual([
      'app:save:backup:reset',
      'app:save:latest',
    ]);
  });

  it('loadable reducer migrates LOAD actions before returning payload state', () => {
    const reducer = vi.fn((state = { untouched: true }) => state);
    const loadableReducer = makeLoadableReducer(reducer);
    const payload = {
      career: { raceResults: [] },
      saveMeta: { version: 0, timestamp: 1 },
    } as RootState;

    const nextState = loadableReducer(undefined, loadActionType(payload));

    expect(nextState.saveMeta?.version).toBe(versionForNewSaves());
    expect(reducer).not.toHaveBeenCalled();
  });

  it('save middleware dispatches timestamp updates and persists on timestamp actions', () => {
    const dispatch = vi.fn();
    const next = vi.fn();
    const state = sampleState();
    const middleware = saveMiddleware({
      dispatch,
      getState: () => state,
    } as any);

    middleware(next)({ type: 'career/recordRaceResult' });
    expect(next).toHaveBeenCalledWith({ type: 'career/recordRaceResult' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'saveMeta/updateTimestamp' });

    dispatch.mockClear();
    next.mockClear();
    middleware(next)({ type: 'saveMeta/updateTimestamp' });
    expect(dispatch).not.toHaveBeenCalled();
    expect(load(true)?.saveMeta?.commit).toEqual(
      expect.objectContaining({
        hash: expect.any(String),
        date: expect.any(String),
      }),
    );
  });
});
