import { classEquals } from 'app/data/car_classes';

import { CarClass } from './CarClass';

export interface TrackSpec {
  readonly name: string;
  readonly configuration: string;
  readonly classes: CarClass[];
  // readonly multiclass: boolean;
}

export function canRaceOn(carClass: CarClass, track: TrackSpec): boolean {
  return track.classes.some(c => classEquals(c, carClass));
}

export function trackKey(track: TrackSpec): string {
  return `${track.name}-${track.configuration}`;
}

export function trackEquals(a: TrackSpec | null, b: TrackSpec | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return trackKey(a) === trackKey(b);
}
