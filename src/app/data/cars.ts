import Papa from 'papaparse';

import { Car, CarId, getCarId } from '../../types/Car';
import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import { Discipline } from '../../types/Discipline';
import { getCarClass, getCarClassesByName } from './car_classes';
import { getDiscipline } from './disciplines';
import { getTrackIdsFor } from './tracks';
import type { TrackId } from '../../types/Track';
import carsCsv from './cars.csv?raw';
import gameCarsCsv from './game_cars.csv?raw';

type Record = {
  car: string;
  class: string;
  discipline: string;
  year: string;
};

type GameRecord = {
  game_id: string;
  canonical_id: string;
  'Vehicle Name': string;
  'Vehicle Year': string;
  'Vehicle Class': string;
  'AI ONLY': string;
  aero_variant: 'standard' | 'low-drag' | 'high-downforce';
  meta_class: string;
  has_headlights: string;
  downforce_variant: 'standard' | 'low';
  'Vehicle Variant High Downforce Track': string;
};

const data: Record[] = Papa.parse(carsCsv, { header: true }).data;
const gameData: GameRecord[] = Papa.parse(gameCarsCsv, { header: true }).data;

function recordToLegacyCars(record: Record): Car[] {
  return getCarClassesByName(record.class).map(carClass => ({
    name: record.car,
    carClassId: getCarClassId(carClass),
    year:
      parseInt(record.year.trim().replace(/\*/g, '').split('-')[0]) ||
      new Date().getFullYear() - 10,
  }));
}

function gameRecordToCars(record: GameRecord): Car[] {
  if (/^(true|1)$/i.test(record['AI ONLY'] || '')) return [];
  return getCarClassesByName(record.meta_class).map(carClass => ({
    name: record['Vehicle Name'],
    carClassId: getCarClassId(carClass),
    year: parseInt(record['Vehicle Year'], 10) || new Date().getFullYear() - 10,
    gameId: `${record.canonical_id}-${getCarClassId(carClass)}`,
    gameClass: record['Vehicle Class'],
    headlights: record.has_headlights === 'true',
    downforceVariant: 'standard',
    hasDedicatedHighDownforceVariant:
      record['Vehicle Variant High Downforce Track'] !== '',
  }));
}

const CARS: { [key: CarId]: Car } = Object.fromEntries(
  gameData
    .flatMap(gameRecordToCars)
    .filter(car => getTrackIdsFor(getCarClassOfCar(car)).length > 0)
    .map(car => [getCarId(car), car]),
);

const LEGACY_CARS: { [key: CarId]: Car } = Object.fromEntries(
  data.flatMap(recordToLegacyCars).map((car: Car) => [getCarId(car), car]),
);

export function getCarsInClass(
  what: CarClass | CarClassId,
  downforceVariant?: 'standard' | 'low',
): Car[] {
  const carClass = getCarClass(what);
  return Object.values(CARS).filter(
    c =>
      c.carClassId === getCarClassId(carClass) &&
      (!downforceVariant || c.downforceVariant === downforceVariant),
  );
}

export function getCarsInClassAtTrack(
  what: CarClass | CarClassId,
  trackId: TrackId,
): Car[] {
  return getCarsInClass(what).filter(car =>
    getTrackIdsFor(car).includes(trackId),
  );
}

export function canRaceAtNight(what: Car | CarClass): boolean {
  if (
    what.hasOwnProperty('carClassId') &&
    (what as Car).headlights !== undefined
  ) {
    return (what as Car).headlights!;
  }
  let carClass = what.hasOwnProperty('carClassId')
    ? getCarClassOfCar(what as Car)
    : (what as CarClass);
  return carClass.headlights;
}

export function getCarClassOfCar(car: Car): CarClass {
  return getCarClass(car.carClassId);
}

export function getDisciplineOfCar(car: Car): Discipline {
  return getDiscipline(getCarClassOfCar(car).disciplineId);
}

export function getCar(carId: CarId): Car {
  if (!CARS[carId] && !LEGACY_CARS[carId]) {
    throw new Error(`Unknown car: ${carId}`);
  }
  return CARS[carId] || LEGACY_CARS[carId];
}

export function getAllCars(): Car[] {
  return Object.values(CARS);
}
