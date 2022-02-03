import { DisciplineId } from './Discipline';

export interface CarClass {
  readonly name: string;
  readonly level: number;
  readonly disciplineId: DisciplineId;
}

export type CarClassId = string;

export function getCarClassId(carClass: CarClass): CarClassId {
  return `${carClass.disciplineId}-${carClass.name}`;
}

export function classEquals(a: CarClass, b: CarClass): boolean {
  return getCarClassId(a) === getCarClassId(b);
}
