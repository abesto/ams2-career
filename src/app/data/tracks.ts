import Papa from 'papaparse';

import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import type { Car, DownforceVariant } from '../../types/Car';
import { getTrackId, Track, TrackId } from '../../types/Track';
import { getCarClassesByName } from './car_classes';
import { getTrackLabels } from './trackNames';
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

type GameTrack = {
  game_id: string;
  TrackName: string;
  ShortTrackName: string;
  Track_Variation: string;
  'Track Group': string;
  display_name?: string;
  display_configuration?: string;
  display_category?: string;
  downforce_variant: DownforceVariant;
};
type GameTrackMapping = {
  game_track_id: string;
  meta_class: string;
  downforce_variant: DownforceVariant;
};
const gameTracks: GameTrack[] = Papa.parse<GameTrack>(gameTracksCsv, { header: true }).data;
const gameMappings: GameTrackMapping[] = Papa.parse<GameTrackMapping>(gameTrackMappingCsv, { header: true }).data;
for (const gameTrack of gameTracks) {
  const { game_id, TrackName, ShortTrackName, Track_Variation } = gameTrack;
  const labels = getTrackLabels({
    name: TrackName ?? '',
    shortName: ShortTrackName,
    variation: Track_Variation,
    category: gameTrack['Track Group'],
    displayName: gameTrack.display_name,
    displayConfiguration: gameTrack.display_configuration,
    displayCategory: gameTrack.display_category,
  });
  const track: Track = {
    ...labels,
    gameId: game_id,
    downforceVariant: gameTrack.downforce_variant,
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

export function getTrackIdsFor(
  carClass: CarClass | CarClassId | Car,
  downforceVariant?: DownforceVariant,
): TrackId[] {
  if (typeof carClass !== 'string' && 'carClassId' in carClass) {
    downforceVariant = carClass.downforceVariant;
    carClass = carClass.carClassId;
  }
  if (typeof carClass !== 'string') {
    carClass = getCarClassId(carClass);
  }
  return (CAR_CLASS_TO_TRACKS.get(carClass) || []).filter(trackId =>
    downforceVariant ? getTrack(trackId).downforceVariant === downforceVariant : true,
  );
}

export function getTracksFor(
  carClass: CarClass | CarClassId | Car,
  downforceVariant?: DownforceVariant,
): Track[] {
  return getTrackIdsFor(carClass, downforceVariant).map(getTrack);
}

export function getAllTracks(): Track[] {
  return [...TRACKS.values()];
}

export function getCarClassIdsWithDefinedTracks(): CarClassId[] {
  return [...CAR_CLASS_TO_TRACKS.keys()];
}
