import { getTrackIdsFor } from 'app/data/tracks';

import { CarClass, CarClassId } from './CarClass';

export interface Track {
  readonly name: string;
  readonly configuration: string;
  // readonly multiclass: boolean;
}

export type TrackId = string;

export function getTrackId(track: Track): TrackId {
  return `${track.name}-${track.configuration}`;
}

export function canRaceOn(
  carClass: CarClass | CarClassId,
  track: Track | TrackId,
): boolean {
  if (typeof track !== 'string') {
    track = getTrackId(track);
  }
  return getTrackIdsFor(carClass).some(candidate => candidate === track);
}

export function trackEquals(a: Track | null, b: Track | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return getTrackId(a) === getTrackId(b);
}
