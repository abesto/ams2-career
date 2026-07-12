import dayjs, { Dayjs } from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

import { choice, randomDateBetween } from './racegen.random';

import { getCarClassesAt } from 'app/data/car_classes';
import { canRaceAtNight, getCarsInClass } from 'app/data/cars';
import { getTrackIdsFor } from 'app/data/tracks';
import { aiLevel, EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { DownforceVariant } from 'types/Car';
import { CarClass, getCarClassId } from 'types/CarClass';
import { Discipline } from 'types/Discipline';
import { Race } from 'types/Race';
import { TrackId } from 'types/Track';

dayjs.extend(minMax);

const HISTORICAL_RACE_DATE_RANGES: Record<
  string,
  { start: () => Dayjs; end: () => Dayjs }
> = {
  'Copa Classic (Class: B)': {
    start: () => dayjs().subtract(10, 'year').startOf('year'),
    end: () => dayjs(),
  },
  'Copa Classic (Class: FL)': {
    start: () => dayjs().subtract(10, 'year').startOf('year'),
    end: () => dayjs(),
  },
  'Copa Uno': {
    start: () => dayjs('1990-01-01'),
    end: () => dayjs('2000-01-01'),
  },
};

function highestUnlockedClasses(
  discipline: Discipline,
  level: number,
): CarClass[] {
  for (let thisLevel = Math.max(1, level); thisLevel >= 0; thisLevel--) {
    const candidates = getCarClassesAt(discipline, thisLevel);
    if (candidates.length) {
      return candidates;
    }
  }
  return [];
}

export function raceDateRange(
  carClass: CarClass,
  downforceVariant?: DownforceVariant,
): [Dayjs, Dayjs] {
  const override = HISTORICAL_RACE_DATE_RANGES[carClass.name];
  if (override) {
    return [override.start(), override.end()];
  }

  const cars = getCarsInClass(carClass, downforceVariant);
  const startYear = Math.min(...cars.map(c => c.year));
  const start = dayjs(new Date(startYear, 1, 1)).startOf('year');
  return [start, dayjs.min(start.add(10, 'year'), dayjs())];
}

function genRaceDate(
  carClass: CarClass,
  downforceVariant: DownforceVariant,
): Date {
  const [start, end] = raceDateRange(carClass, downforceVariant);
  var date = randomDateBetween(start, end);

  if (!canRaceAtNight(carClass)) {
    date = date.set('hour', 10 + Math.floor(Math.random() * 7));
  }

  return date.toDate();
}

export function racegen(
  discipline: Discipline,
  career: EnrichedCareerData,
): Race[] {
  const generatedAt = new Date().getTime();
  const playerLevel = career.progress[discipline.name].level;
  return highestUnlockedClasses(discipline, playerLevel)
    .flatMap(carClass => {
      const variants = [
        ...new Set(
          getCarsInClass(carClass).map(
            car => car.downforceVariant || 'standard',
          ),
        ),
      ].filter(variant => getTrackIdsFor(carClass, variant).length > 0);
      return variants.map(downforceVariant => ({
        generatedAt,
        simTime: genRaceDate(carClass, downforceVariant).getTime(),
        carClassId: getCarClassId(carClass),
        trackId: choice(getTrackIdsFor(carClass, downforceVariant)) as TrackId,
        downforceVariant,
        playerLevel,
        aiLevel: aiLevel(career, discipline),
      }));
    })
    .filter(race => race.trackId);
}
