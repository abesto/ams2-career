import { toAscii } from 'utils/string';

import { CarClassId } from './CarClass';

export interface Car {
  readonly name: string;
  readonly carClassId: CarClassId;
  readonly year: number;
  readonly gameId?: string;
  readonly gameClass?: string;
  readonly headlights?: boolean;
}

export type CarId = string & { __brand: 'CarId' };

export function getCarId(car: Car): CarId {
  if (car.gameId) {
    return car.gameId as CarId;
  }
  return `${car.carClassId}-${toAscii(car.name)}` as CarId;
}

export function carEquals(a: Car | null, b: Car | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return getCarId(a) === getCarId(b);
}
