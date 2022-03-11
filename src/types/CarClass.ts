import { DisciplineId } from './Discipline';

export interface CarClass {
  readonly name: string;
  readonly grade: number;
  readonly disciplineId: DisciplineId;
  readonly headlights: boolean;
}

export type CarClassId = string & { __brand: 'CarClassId' };

export function getCarClassId(carClass: CarClass): CarClassId {
  return `${carClass.disciplineId}-${carClass.name}` as CarClassId;
}

export function classEquals(a: CarClass, b: CarClass): boolean {
  return getCarClassId(a) === getCarClassId(b);
}
