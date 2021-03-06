import { toAscii } from 'utils/string';

import { CarClassId } from './CarClass';

export interface Car {
  readonly name: string;
  readonly carClassId: CarClassId;
  readonly year: number;
}

export type CarId = string & { __brand: 'CarId' };

export function getCarId(car: Car): CarId {
  return `${car.carClassId}-${toAscii(car.name)}` as CarId;
}

export function carEquals(a: Car | null, b: Car | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return getCarId(a) === getCarId(b);
}
