import {
  getCarClassesByName,
  getDisciplineOfCarClass,
} from 'app/data/car_classes';
import { getCarsInClass } from 'app/data/cars';
import { getAllDisciplines } from 'app/data/disciplines';
import { getTrackIdsFor } from 'app/data/tracks';
import { initialState as defaultSettings } from 'app/slices/SettingsSlice';
import { getCarId } from 'types/Car';
import { getDisciplineId } from 'types/Discipline';
import { RaceResult } from 'types/Race';

import { prepareAchievements, isUnlocked } from './achievements';
import { GradeUp } from './types';

const clubClass = getCarClassesByName('GT5')[0];
const clubCar = getCarsInClass(clubClass)[0];
const clubTrackIds = getTrackIdsFor(clubClass);

function raceResult(
  overrides: Partial<RaceResult> = {},
  index = 0,
): RaceResult {
  return {
    generatedAt: 1000 + index,
    simTime: 2000 + index,
    trackId: clubTrackIds[index % clubTrackIds.length],
    carClassId: clubCar.carClassId,
    playerLevel: 4,
    aiLevel: 95,
    racedAt: 3000 + index,
    position: 1,
    carId: getCarId(clubCar),
    ...overrides,
  };
}

function byName(name: string, achievements: any[]) {
  return achievements.find(achievement => achievement.name === name);
}

describe('achievements', () => {
  it('counts unique tracks and unlocks Frequent Flyer only once', () => {
    const achievements = prepareAchievements(defaultSettings);

    const firstNineUnlocks = clubTrackIds
      .slice(0, 9)
      .flatMap((trackId, index) =>
        achievements.process(raceResult({ trackId }, index), []),
      );
    const tenthUnlocks = achievements.process(
      raceResult({ trackId: clubTrackIds[9] }, 9),
      [],
    );
    const duplicateUnlocks = achievements.process(
      raceResult({ trackId: clubTrackIds[9] }, 10),
      [],
    );

    expect(firstNineUnlocks.map(a => a.name)).not.toContain('Frequent Flyer');
    expect(tenthUnlocks.map(a => a.name)).toContain('Frequent Flyer');
    expect(duplicateUnlocks.map(a => a.name)).not.toContain('Frequent Flyer');
  });

  it('tracks grade-based achievements from GradeUp outcomes', () => {
    const achievements = prepareAchievements(defaultSettings);
    const disciplines = getAllDisciplines().slice(0, 5).map(getDisciplineId);

    const unlocks = disciplines.flatMap((disciplineId, index) =>
      achievements.process(raceResult({}, index), [
        GradeUp({ disciplineId, newGrade: 3 }),
      ]),
    );

    expect(unlocks.map(a => a.name)).toContain('Vic Elford');
    expect(isUnlocked(byName('Vic Elford', achievements.finalize()))).toBe(
      true,
    );
  });

  it('unlocks discipline-specific grade-a achievements', () => {
    const achievements = prepareAchievements(defaultSettings);
    const openWheelId = getDisciplineId(
      getDisciplineOfCarClass(getCarClassesByName('Formula V12')[0]),
    );

    const unlocks = achievements.process(raceResult(), [
      GradeUp({ disciplineId: openWheelId, newGrade: 1 }),
    ]);

    expect(unlocks.map(a => a.name)).toContain('Grand Prix Driver');
    expect(
      isUnlocked(byName('Grand Prix Driver', achievements.finalize())),
    ).toBe(true);
  });

  it('formats Hall of Fame progress as human-readable numbers', () => {
    const achievements = prepareAchievements(defaultSettings);

    achievements.process(raceResult(), []);

    const hallOfFame = byName(
      `Hall of Fame: ${getDisciplineOfCarClass(clubClass).name}`,
      achievements.finalize(),
    );

    expect(isUnlocked(hallOfFame)).toBe(false);
    expect((hallOfFame.progress as any).value.formattedCurrent).toMatch(
      /^\d+$/,
    );
    expect((hallOfFame.progress as any).value.formattedMax).toMatch(/^\d+$/);
  });
});
