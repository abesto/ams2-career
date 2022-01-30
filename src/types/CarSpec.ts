import { CarClass } from './CarClass';

export interface CarSpec {
  readonly name: string;
  readonly class: CarClass;
}

export function carKey(car: CarSpec): string {
  return `${car.class.name}-${car.name}`;
}

export function carEquals(a: CarSpec | null, b: CarSpec | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return carKey(a) === carKey(b);
}
