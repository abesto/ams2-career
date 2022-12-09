import {
  getCarClassesByName,
  getDisciplineOfCarClass,
} from './data/car_classes';
import * as xpData from './data/xp';
import { SettingsState } from './slices/SettingsSlice/types';
import { getCrossDisciplineMultiplier, getPositionMultiplier } from './xp';

import { getCarClassId } from 'types/CarClass';
import { getDisciplineId } from 'types/Discipline';
import { RaceResult } from 'types/Race';

const carClass = getCarClassesByName('GT5')[0];
const carClassId = getCarClassId(carClass);
const discipline = getDisciplineOfCarClass(carClass);
const disciplineId = getDisciplineId(discipline);
const otherDisciplineId = getDisciplineId(
  getDisciplineOfCarClass(getCarClassesByName('GT3')[0]),
);

describe('getCrossDisciplineMultiplier', () => {
  it('should return 1 for the same discipline if crossDisciplineGainsEnabled is true', () => {
    const settings = { crossDisciplineGainsEnabled: true } as SettingsState;
    const result = { carClassId } as RaceResult;
    expect(getCrossDisciplineMultiplier(disciplineId, result, settings)).toBe(
      1,
    );
  });

  it('should return 1 for the same discipline if crossDisciplineGainsEnabled is false', () => {
    const settings = { crossDisciplineGainsEnabled: false } as SettingsState;
    const result = { carClassId } as RaceResult;
    expect(getCrossDisciplineMultiplier(disciplineId, result, settings)).toBe(
      1,
    );
  });

  it('should return the configured multiplier for a different discipline is crossDisciplineGainsEnabled is true', () => {
    const settings = { crossDisciplineGainsEnabled: true } as SettingsState;
    const result = { carClassId } as RaceResult;
    expect(
      getCrossDisciplineMultiplier(otherDisciplineId, result, settings),
    ).toBe(
      xpData.getCrossDisciplineMultiplier(disciplineId, otherDisciplineId),
    );
  });

  it('should return 0 for a different discipline if crossDisciplineGainsEnabled is false', () => {
    const settings = { crossDisciplineGainsEnabled: false } as SettingsState;
    const result = { carClassId } as RaceResult;
    expect(
      getCrossDisciplineMultiplier(otherDisciplineId, result, settings),
    ).toBe(0);
  });
});

describe('positionXPMultiplier', () => {
  test('settings multiplier of 1.0 has no effect compared to old behavior', () => {
    const settings = { positionXpMultiplier: 1.0 } as SettingsState;

    let result = { position: 1 } as RaceResult;
    expect(getPositionMultiplier(result, settings)).toBe(1.03);

    result = { position: 5 } as RaceResult;
    expect(getPositionMultiplier(result, settings)).toBe(0.99);

    result = { position: 20 } as RaceResult;
    expect(getPositionMultiplier(result, settings)).toBe(0.9);
  });

  test('settings multiplier of 0.0 flattens out the multiplier', () => {
    const settings = { positionXpMultiplier: 0.0 } as SettingsState;

    let result = { position: 1 } as RaceResult;
    expect(getPositionMultiplier(result, settings)).toBe(1.0);

    result = { position: 20 } as RaceResult;
    expect(getPositionMultiplier(result, settings)).toBe(1.0);
  });

  test('settings multiplier of 2.0 doubles the effect of the finishing position', () => {
    const settings = { positionXpMultiplier: 2.0 } as SettingsState;

    let result = { position: 1 } as RaceResult;
    expect(getPositionMultiplier(result, settings)).toBe(1.06);

    result = { position: 20 } as RaceResult;
    expect(getPositionMultiplier(result, settings)).toBe(0.8);
  });
});
