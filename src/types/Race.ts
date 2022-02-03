import { getCar, getDisciplineOfCar } from 'app/data/cars';

import { CarId } from './Car';
import { Discipline } from './Discipline';
import { TrackId } from './Track';

export interface Race {
  readonly generatedAt: number; // JS timestamp
  readonly simTime: number;
  readonly carId: CarId;
  readonly trackId: TrackId;
  readonly playerLevel: number;
  readonly aiLevel: number;
}

export interface RaceResult extends Race {
  readonly racedAt: number; // JS timestamp
  readonly position: number;
}

export function getDisciplineOfRace(race: Race): Discipline {
  return getDisciplineOfCar(getCar(race.carId));
}
