import {
  getCarClassesByName,
  getDisciplineOfCarClass,
} from 'app/data/car_classes';
import { getCarsInClass } from 'app/data/cars';
import { getAllDisciplines } from 'app/data/disciplines';
import { getTrackIdsFor } from 'app/data/tracks';
import { initialState as defaultSettings } from 'app/slices/SettingsSlice';
import { getCarId } from 'types/Car';
import { getCarClassId } from 'types/CarClass';
import { getDisciplineId } from 'types/Discipline';
import { RaceResult } from 'types/Race';

import { aiLevel, enrich, GradeUp, XpGain } from './types';

const gt5Class = getCarClassesByName('GT5')[0];
const gt3Class = getCarClassesByName('GT3')[0];
const gt5Car = getCarsInClass(gt5Class)[0];
const gt3Car = getCarsInClass(gt3Class)[0];
const gt5TrackId = getTrackIdsFor(gt5Class)[0];
const gt3TrackId = getTrackIdsFor(gt3Class)[0];
const gtDisciplineId = getDisciplineId(getDisciplineOfCarClass(gt5Class));
const openWheel = getDisciplineOfCarClass(
  getCarClassesByName('Formula V12')[0],
);

function raceResult(
  overrides: Partial<RaceResult> = {},
  index = 0,
): RaceResult {
  return {
    generatedAt: 1000 + index,
    simTime: 2000 + index,
    trackId: gt5TrackId,
    carClassId: gt5Car.carClassId,
    playerLevel: 4,
    aiLevel: 95,
    racedAt: 3000 + index,
    position: 1,
    carId: getCarId(gt5Car),
    ...overrides,
  };
}

describe('career progression', () => {
  it('initializes progress for every discipline and records xp outcomes per race', () => {
    const career = enrich(
      {
        raceResults: [raceResult()],
      },
      defaultSettings,
    );

    expect(Object.keys(career.progress)).toHaveLength(
      getAllDisciplines().length,
    );
    expect(career.outcomes).toHaveLength(1);
    expect(career.outcomes[0].some(XpGain.is)).toBe(true);
    expect(career.progress[gtDisciplineId].totalXp).toBeGreaterThan(0);
  });

  it('suppresses cross-discipline xp when that setting is disabled', () => {
    const career = enrich(
      {
        raceResults: [raceResult()],
      },
      {
        ...defaultSettings,
        crossDisciplineGainsEnabled: false,
      },
    );

    const xpOutcomes = career.outcomes[0].filter(XpGain.is);
    expect(xpOutcomes).toHaveLength(1);
    expect(xpOutcomes[0].value.disciplineId).toBe(gtDisciplineId);
  });

  it('records grade-up outcomes once enough xp has been accumulated', () => {
    const initialLevel = enrich({ raceResults: [] }, defaultSettings).progress[
      gtDisciplineId
    ].level;
    const career = enrich(
      {
        raceResults: Array.from({ length: 12 }, (_, index) =>
          raceResult({}, index),
        ),
      },
      defaultSettings,
    );

    const gradeUps = career.outcomes.flat().filter(GradeUp.is);
    expect(gradeUps.length).toBeGreaterThan(0);
    expect(
      gradeUps.some(outcome => outcome.value.disciplineId === gtDisciplineId),
    ).toBe(true);
    expect(career.progress[gtDisciplineId].level).toBeLessThan(initialLevel);
  });

  it('computes ai level from same-discipline race finishes only', () => {
    const career = enrich(
      {
        raceResults: [
          raceResult({ position: 1 }, 0),
          raceResult({ position: 10 }, 1),
          raceResult({ position: 20 }, 2),
          raceResult(
            {
              carClassId: getCarClassId(gt3Class),
              carId: getCarId(gt3Car),
              trackId: gt3TrackId,
              position: 1,
            },
            3,
          ),
        ],
      },
      defaultSettings,
    );

    expect(aiLevel(career, getDisciplineOfCarClass(gt5Class))).toBe(93);
    expect(aiLevel(career, openWheel)).toBe(95);
  });
});
