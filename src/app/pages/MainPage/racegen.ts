import { classesAt } from 'app/data/car_classes';
import { canRaceAtNight, carsIn } from 'app/data/cars';
import { tracksFor } from 'app/data/tracks';
import { aiLevel, EnrichedCareerData } from 'app/slice/types';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import { CarClass } from 'types/CarClass';
import { CarSpec } from 'types/CarSpec';
import { Discipline } from 'types/Discipline';
import { Race } from 'types/Race';

dayjs.extend(minMax);

function highestUnlockedClasses(
  discipline: Discipline,
  level: number,
): CarClass[] {
  for (let thisLevel = level; thisLevel--; thisLevel > 0) {
    const candidates = classesAt(discipline, thisLevel);
    if (candidates.length) {
      return candidates;
    }
  }
  return [];
}

function choice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function genRaceDate(car: CarSpec): Date {
  const start = dayjs(new Date(car.year, 1, 1)).startOf('year');
  const end = dayjs.min(start.add(10, 'year'), dayjs());
  const diffMs = start.diff(end);
  const diffRandom = Math.random() * diffMs;

  var date = start.add(diffRandom, 'millisecond');

  if (!canRaceAtNight(car)) {
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
      const car = choice(carsIn(carClass));
      return {
        generatedAt,
        simtime: car && genRaceDate(car).getTime(),
        car: car,
        track: choice(tracksFor(carClass)),
        playerLevel,
        aiLevel: aiLevel(career, discipline),
      };
    })
    .filter(race => race.car && race.track);
}
