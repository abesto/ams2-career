import JSON5 from 'json5';
import raw from 'raw.macro';

import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import { getTrackId, Track, TrackId } from '../../types/Track';
import {
  getCarClass,
  getCarClassesAt,
  getCarClassesByName,
} from './car_classes';
import { getDiscipline } from './disciplines';

interface Record {
  tracks: { [track: string]: string[] };
  representativeClasses: CarClassId[];
}

// Manually curated
const data: Record[] = JSON5.parse(raw('./tracks.json5'));

export const TRACKS: { [key: TrackId]: Track } = Object.fromEntries(
  data.flatMap(({ tracks, representativeClasses }) =>
    Object.entries(tracks).flatMap(([name, configurations]) =>
      configurations.map(configuration => {
        const track = { name, configuration };
        return [getTrackId(track), track];
      }),
    ),
  ),
);

let CAR_CLASS_TO_TRACKS: { [key: CarClassId]: TrackId[] } = {};
for (const record of data) {
  const carClassIds = record.representativeClasses
    .flatMap(getCarClassesByName)
    .flatMap((representativeCarClass: CarClass) =>
      getCarClassesAt(
        getDiscipline(representativeCarClass.disciplineId),
        representativeCarClass.level,
      ),
    )
    .map(getCarClassId)
    .filter((v, i, a) => a.indexOf(v) === i);

  for (const [trackName, configurations] of Object.entries(record.tracks)) {
    for (const configuration of configurations) {
      const track = { name: trackName, configuration };
      const trackId = getTrackId(track);
      for (const carClassId of carClassIds) {
        CAR_CLASS_TO_TRACKS[carClassId] = CAR_CLASS_TO_TRACKS[carClassId] || [];
        CAR_CLASS_TO_TRACKS[carClassId].push(trackId);
      }
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
