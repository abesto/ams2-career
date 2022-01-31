import { classesAt } from 'app/data/car_classes';
import { carsIn } from 'app/data/cars';
import { tracksFor } from 'app/data/tracks';
import { CarClass } from 'types/CarClass';
import { Discipline } from 'types/Discipline';
import { Race } from 'types/Race';

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

export function racegen(discipline: Discipline, playerLevel: number): Race[] {
  const generatedAt = new Date().getTime();
  return highestUnlockedClasses(discipline, playerLevel)
    .map(carClass => ({
      generatedAt,
      car: choice(carsIn(carClass)),
      track: choice(tracksFor(carClass)),
    }))
    .filter(race => race.car && race.track);
}
