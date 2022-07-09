import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

import { choice, randomDateBetween } from './racegen.random';

import { getCarClassesAt } from 'app/data/car_classes';
import { canRaceAtNight, getCarsInClass } from 'app/data/cars';
import { getTrackIdsFor } from 'app/data/tracks';
import { aiLevel, EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { CarClass, getCarClassId } from 'types/CarClass';
import { Discipline } from 'types/Discipline';
import { Race } from 'types/Race';
import { TrackId } from 'types/Track';

dayjs.extend(minMax);

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

function genRaceDate(carClass: CarClass): Date {
  const cars = getCarsInClass(carClass);

  const startYear = Math.min(...cars.map(c => c.year));
  const start = dayjs(new Date(startYear, 1, 1)).startOf('year');
  const end = dayjs.min(start.add(10, 'year'), dayjs());
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
    .map(carClass => {
      return {
        generatedAt,
        simTime: genRaceDate(carClass).getTime(),
        carClassId: getCarClassId(carClass),
        trackId: choice(getTrackIdsFor(carClass)) as TrackId,
        playerLevel,
        aiLevel: aiLevel(career, discipline),
      };
    })
    .filter(race => race.trackId);
}
