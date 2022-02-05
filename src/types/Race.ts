import { getDisciplineOfCarClass } from 'app/data/car_classes';

import { CarId } from './Car';
import { CarClassId } from './CarClass';
import { Discipline } from './Discipline';
import { TrackId } from './Track';

export interface Race {
  readonly generatedAt: number; // JS timestamp
  readonly simTime: number;
  readonly trackId: TrackId;
  readonly carClassId: CarClassId;
  readonly playerLevel: number;
  readonly aiLevel: number;
}

export interface RaceResult extends Race {
  readonly racedAt: number; // JS timestamp
  readonly position: number;
  readonly carId: CarId;
}

export function getDisciplineOfRace(race: Race): Discipline {
  return getDisciplineOfCarClass(race.carClassId);
}
