import Papa from 'papaparse';
import raw from 'raw.macro';
import { CarClass } from 'types/CarClass';
import { CarSpec } from 'types/CarSpec';

import { classEquals, getCarClasses } from './car_classes';
import { tracksFor } from './tracks';

// Dumped from the official car list
const data = Papa.parse(
  raw('./AMS2 v.1.3.2.1 - Extended Car Info v1.0.30.csv'),
  { header: true },
).data;

function recordToCars(record: { [key: string]: string }): CarSpec[] {
  return getCarClasses(record.class).map(carClass => ({
    name: record.name,
    class: carClass,
  }));
}

function compareFields(a: CarSpec): any[] {
  return [a.class.discipline.name, a.class.level, a.class.name, a.name];
}

const zip = (a: any[], b: any[]) => a.map((k, i) => [k, b[i]]);

function compareCars(a: CarSpec, b: CarSpec): number {
  for (const [ax, bx] of zip(compareFields(a), compareFields(b))) {
    if (ax < bx) {
      return -1;
    }
    if (ax > bx) {
      return 1;
    }
  }
  return 0;
}

export const CARS: CarSpec[] = data
  .flatMap(recordToCars)
  .filter((car: CarSpec) => car && tracksFor(car.class).length > 0);
CARS.sort(compareCars);

export function carsIn(carClass: CarClass): CarSpec[] {
  return CARS.filter(c => classEquals(c.class, carClass));
}
