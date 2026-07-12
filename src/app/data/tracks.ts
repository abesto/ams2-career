import Papa from 'papaparse';

import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import { getTrackId, Track, TrackId } from '../../types/Track';
import { getCarClassesByName } from './car_classes';
import tracksCsv from './tracks.csv?raw';
import gameTracksCsv from './game_tracks.csv?raw';
import gameTrackMappingCsv from './game_track_mapping.csv?raw';

interface Record {
  [key: string]: string;
  Name: string;
  Configuration: string;
}

// Manually curated
const data: Record[] = Papa.parse(tracksCsv, {
  header: true,
}).data;

export const TRACKS: Map<TrackId, Track> = new Map();
const legacyTracks: Map<TrackId, Track> = new Map();
for (const { name, configuration } of data) {
  const track = { name: name ?? '', configuration: configuration ?? '' };
  legacyTracks.set(getTrackId(track), track);
}

type GameTrack = { game_id: string; TrackName: string; ShortTrackName: string; Track_Variation: string };
type GameTrackMapping = { game_track_id: string; meta_class: string };
const gameTracks: GameTrack[] = Papa.parse<GameTrack>(gameTracksCsv, { header: true }).data;
const gameMappings: GameTrackMapping[] = Papa.parse<GameTrackMapping>(gameTrackMappingCsv, { header: true }).data;
for (const { game_id, TrackName, ShortTrackName, Track_Variation } of gameTracks) {
  const track = {
    name: TrackName ?? '',
    configuration: Track_Variation || ShortTrackName || '',
    gameId: game_id,
  };
  TRACKS.set(getTrackId(track), track);
}

let CAR_CLASS_TO_TRACKS: Map<CarClassId, TrackId[]> = new Map();
for (const { game_track_id, meta_class } of gameMappings) {
  const trackId = game_track_id as TrackId;
  for (const carClass of getCarClassesByName(meta_class)) {
    const carClassId = getCarClassId(carClass);
    const tracks = CAR_CLASS_TO_TRACKS.get(carClassId) || [];
    if (!tracks.includes(trackId)) tracks.push(trackId);
    CAR_CLASS_TO_TRACKS.set(carClassId, tracks);
  }
}

export function getTrack(id: TrackId): Track {
  const track = TRACKS.get(id) || legacyTracks.get(id);
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
