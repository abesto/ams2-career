import raw from 'raw.macro';
import Papa from 'papaparse';

import { CarClass } from 'types/CarClass';
import { canRaceOn, TrackSpec } from 'types/TrackSpec';
import { CAR_CLASSES } from './car_classes';

// Manually curated
const data = Papa.parse(raw('./tracks.csv'), { header: true }).data;

function recordToTrack(record: { [key: string]: string }): TrackSpec {
  return {
    name: record.Name,
    configuration: record.Configuration,
    classes: CAR_CLASSES.filter(carClass => !!record[carClass.name]),
  };
}

export const TRACKS: TrackSpec[] = data.map(recordToTrack);

export function getTrack(name: string, configuration: string): TrackSpec {
  const track = TRACKS.find(
    t => t.name === name && t.configuration === configuration,
  );
  if (!track) {
    throw new Error(`Unknown track: ${name} ${configuration}`);
  }
  return track;
}

export function tracksFor(carClass: CarClass): TrackSpec[] {
  return TRACKS.filter(t => canRaceOn(carClass, t));
}
