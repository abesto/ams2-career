import { Discipline } from './Discipline';

export interface CarClass {
  readonly name: string;
  readonly level: number;
  readonly discipline: Discipline;
}
