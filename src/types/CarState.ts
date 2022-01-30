import { CarSpec } from './CarSpec';
import { RaceResult } from './RaceResult';

export interface CarState {
  readonly spec: CarSpec;
  unlocked: boolean;
  races: RaceResult[];
}
