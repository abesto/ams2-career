import {
  getCarClassesByName,
  getDisciplineOfCarClass,
} from './data/car_classes';
import * as xpData from './data/xp';
import { SettingsState } from './slices/SettingsSlice/types';
import { getCrossDisciplineMultiplier } from './xp';

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
