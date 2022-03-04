import Papa from 'papaparse';
import raw from 'raw.macro';

import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import { getTrackId, Track, TrackId } from '../../types/Track';
import { getCarClassesByName } from './car_classes';

interface Record {
  [key: string]: string;
  Name: string;
  Configuration: string;
}

// Manually curated
const data: Record[] = Papa.parse(raw('./tracks.csv'), {
  header: true,
}).data;
console.log(data);

export const TRACKS: { [key: TrackId]: Track } = Object.fromEntries(
  data.map(({ name, configuration, ..._ }) => {
    const track = { name, configuration };
    return [getTrackId(track), track];
  }),
);

let CAR_CLASS_TO_TRACKS: { [key: CarClassId]: TrackId[] } = {};
for (const { name, configuration, ...classes } of data) {
  const track = { name, configuration };
  const trackId = getTrackId(track);
  for (const [carClassName, canRace] of Object.entries(classes)) {
    if (canRace === 'x') {
      for (const carClass of getCarClassesByName(carClassName)) {
        const carClassId = getCarClassId(carClass);
        CAR_CLASS_TO_TRACKS[carClassId] = CAR_CLASS_TO_TRACKS[carClassId] || [];
        CAR_CLASS_TO_TRACKS[carClassId].push(trackId);
      }
    } else if (canRace !== '') {
      throw new Error(
        `Invalid canRace value: ${canRace} for ${carClassName} at ${track.name} ${track.configuration}`,
      );
    }
  }
}

export function getTrack(id: TrackId): Track {
  if (!TRACKS[id]) {
    throw new Error(`Unknown track: ${id}`);
  }

  return TRACKS[id];
}

export function getTrackIdsFor(carClass: CarClass | CarClassId): TrackId[] {
  if (typeof carClass !== 'string') {
    carClass = getCarClassId(carClass);
  }
  return CAR_CLASS_TO_TRACKS[carClass] || [];
}

export function getTracksFor(carClass: CarClass | CarClassId): Track[] {
  return getTrackIdsFor(carClass).map(getTrack);
}

export function getAllTracks(): Track[] {
  return Object.values(TRACKS);
}
