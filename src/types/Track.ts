import { toAscii } from 'utils/string';

import { CarClass, CarClassId } from './CarClass';
import { Car, DownforceVariant } from './Car';

import { getTrackIdsFor } from 'app/data/tracks';

export interface Track {
  readonly name: string;
  readonly configuration: string;
  readonly category?: string;
  readonly gameId?: string;
  readonly downforceVariant?: DownforceVariant;
  // readonly multiclass: boolean;
}

export type TrackId = string & { __brand: 'TrackId' };

export function getTrackId(track: Track): TrackId {
  if (track.gameId) {
    return track.gameId as TrackId;
  }
  return `${toAscii(track.name)}-${toAscii(track.configuration)}` as TrackId;
}

export function canRaceOn(
  carClass: CarClass | CarClassId | Car,
  track: Track | TrackId,
): boolean {
  if (typeof track !== 'string') {
    track = getTrackId(track);
  }
  const variant = typeof carClass === 'string' || !('gameId' in carClass)
    ? undefined
    : carClass.downforceVariant;
  return getTrackIdsFor(carClass, variant).some(candidate => candidate === track);
}

export function trackEquals(a: Track | null, b: Track | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return getTrackId(a) === getTrackId(b);
}
