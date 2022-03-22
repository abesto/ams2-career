import Papa from 'papaparse';
import raw from 'raw.macro';

import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import { getTrackId, Track, TrackId } from '../../types/Track';
import { getCarClassesByName } from './car_classes';

interface Record {
  [key: string]: string;
  name: string;
  configuration: string;
}

// Manually curated
const data: Record[] = Papa.parse(raw('./tracks.csv'), {
  header: true,
}).data;

export const TRACKS: Map<TrackId, Track> = new Map();
for (const { name, configuration } of data) {
  const track = { name, configuration };
  TRACKS.set(getTrackId(track), track);
}

let CAR_CLASS_TO_TRACKS: Map<CarClassId, TrackId[]> = new Map();
for (const { name, configuration, ...classes } of data) {
  const track = { name, configuration };
  const trackId = getTrackId(track);
  for (const [carClassName, canRace] of Object.entries(classes)) {
    if (canRace === 'x') {
      for (const carClass of getCarClassesByName(carClassName)) {
        const carClassId = getCarClassId(carClass);
        CAR_CLASS_TO_TRACKS.set(
          carClassId,
          CAR_CLASS_TO_TRACKS.get(carClassId) || [],
        );
        CAR_CLASS_TO_TRACKS.get(carClassId)!.push(trackId);
      }
    } else if (canRace !== '') {
      throw new Error(
        `Invalid canRace value: ${canRace} for ${carClassName} at ${track.name} ${track.configuration}`,
      );
    }
  }
}

export function getTrack(id: TrackId): Track {
  const track = TRACKS.get(id);
  if (!track) {
    throw new Error(`Unknown track: ${id}`);
  }

  return track;
}

export function getTrackIdsFor(carClass: CarClass | CarClassId): TrackId[] {
  if (typeof carClass !== 'string') {
    carClass = getCarClassId(carClass);
  }
  return CAR_CLASS_TO_TRACKS.get(carClass) || [];
}

export function getTracksFor(carClass: CarClass | CarClassId): Track[] {
  return getTrackIdsFor(carClass).map(getTrack);
}

export function getAllTracks(): Track[] {
  return [...TRACKS.values()];
}

export function getCarClassIdsWithDefinedTracks(): CarClassId[] {
  return [...CAR_CLASS_TO_TRACKS.keys()];
}
