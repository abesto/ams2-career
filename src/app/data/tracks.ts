import Papa from 'papaparse';
import raw from 'raw.macro';
import { CarClass, CarClassId, getCarClassId } from 'types/CarClass';
import { getTrackId, Track, TrackId } from 'types/Track';

import { getCarClassesByName } from './car_classes';

// Manually curated
const data = Papa.parse(raw('./tracks.csv'), { header: true }).data;

function recordToTrack(record: { [key: string]: string }): Track {
  return {
    name: record.Name,
    configuration: record.Configuration,
  };
}

export const TRACKS: { [key: TrackId]: Track } = Object.fromEntries(
  data.map(recordToTrack).map((track: Track) => [getTrackId(track), track]),
);

let CAR_CLASS_TO_TRACKS: { [key: CarClassId]: TrackId[] } = {};
for (const record of data) {
  const trackId = getTrackId(recordToTrack(record));
  for (const [carClassName, val] of Object.entries(record)) {
    if (carClassName === 'Name' || carClassName === 'Configuration') {
      continue;
    }
    if (val !== 'x') {
      continue;
    }
    for (const carClass of getCarClassesByName(carClassName)) {
      const carClassId = getCarClassId(carClass);
      CAR_CLASS_TO_TRACKS[carClassId] = CAR_CLASS_TO_TRACKS[carClassId] || [];
      CAR_CLASS_TO_TRACKS[carClassId].push(trackId);
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
