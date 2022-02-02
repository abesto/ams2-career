import { CarClass } from './CarClass';

export interface CarSpec {
  readonly name: string;
  readonly class: CarClass;
  readonly year: number;
}

export function carKey(car: CarSpec): string {
  return `${car.class.discipline.name}-${car.class.name}-${car.name}`;
}

export function carEquals(a: CarSpec | null, b: CarSpec | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return carKey(a) === carKey(b);
}
