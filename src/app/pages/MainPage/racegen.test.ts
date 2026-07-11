import dayjs from 'dayjs';
import { vi } from 'vitest';

import {
  getCarClassesByName,
  getDisciplineOfCarClass,
} from 'app/data/car_classes';
import { getTrackIdsFor } from 'app/data/tracks';
import { getCarClassId } from 'types/CarClass';

import { racegen } from './racegen';
import * as random from './racegen.random';

const openWheelDiscipline = getDisciplineOfCarClass(
  getCarClassesByName('Formula V12')[0],
);
const p4Class = getCarClassesByName('P4')[0];
const enduranceDiscipline = getDisciplineOfCarClass(p4Class);

describe('racegen', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(random, 'choice').mockImplementation(items => items[0]);
  });

  it('falls back to the highest available unlocked class when the player level has no exact match', () => {
    vi.spyOn(random, 'randomDateBetween').mockReturnValue(
      dayjs('2005-06-01T00:00:00'),
    );

    const races = racegen(enduranceDiscipline, {
      raceResults: [],
      progress: {
        [enduranceDiscipline.name]: { totalXp: 0, xpInLevel: 0, level: 6 },
      },
      outcomes: [],
      achievements: [],
    } as any);

    expect(races).toHaveLength(1);
    expect(races[0].carClassId).toBe(getCarClassId(p4Class));
    expect(races[0].playerLevel).toBe(6);
  });

  it('forces daytime race hours for classes without headlights', () => {
    vi.spyOn(random, 'randomDateBetween').mockReturnValue(
      dayjs('2005-06-01T00:00:00'),
    );

    const races = racegen(openWheelDiscipline, {
      raceResults: [],
      progress: {
        [openWheelDiscipline.name]: { totalXp: 0, xpInLevel: 0, level: 3 },
      },
      outcomes: [],
      achievements: [],
    } as any);

    expect(races.length).toBeGreaterThan(0);
    for (const race of races) {
      const hour = new Date(race.simTime).getHours();
      expect(hour).toBeGreaterThanOrEqual(10);
      expect(hour).toBeLessThanOrEqual(16);
      expect(getTrackIdsFor(race.carClassId)).toContain(race.trackId);
    }
  });
});
