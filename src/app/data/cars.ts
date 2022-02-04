import Papa from 'papaparse';
import raw from 'raw.macro';
import { Car, CarId, getCarId } from 'types/Car';
import { CarClass, getCarClassId } from 'types/CarClass';
import { Discipline } from 'types/Discipline';

import { getCarClass, getCarClassesByName } from './car_classes';
import { getDiscipline } from './disciplines';
import { getTrackIdsFor } from './tracks';

// Dumped from the official car list
const data = Papa.parse(
  raw('./AMS2 v.1.3.2.1 - Extended Car Info v1.0.30.csv'),
  { header: true },
).data;

function recordToCars(record: { [key: string]: string }): Car[] {
  return getCarClassesByName(record.class).map(carClass => ({
    name: record.name,
    carClassId: getCarClassId(carClass),
    headlights: record.headlights.trim() === 'Y',
    year:
      parseInt(record.year.trim().replace(/\*/g, '').split('-')[0]) ||
      new Date().getFullYear() - 5,
  }));
}

const CARS: { [key: CarId]: Car } = Object.fromEntries(
  data
    .flatMap(recordToCars)
    .filter(
      (car: Car) => car && getTrackIdsFor(getCarClassOfCar(car)).length > 0,
    )
    .map((car: Car) => [getCarId(car), car]),
);

export function carsIn(carClass: CarClass): Car[] {
  return Object.values(CARS).filter(
    c => c.carClassId === getCarClassId(carClass),
  );
}

export function canRaceAtNight(car: Car): boolean {
  return carsIn(getCarClassOfCar(car)).every(c => c.headlights);
}

export function getCarClassOfCar(car: Car): CarClass {
  return getCarClass(car.carClassId);
}

export function getDisciplineOfCar(car: Car): Discipline {
  return getDiscipline(getCarClassOfCar(car).disciplineId);
}

export function getCar(carId: CarId): Car {
  if (!CARS[carId]) {
    throw new Error(`Unknown car: ${carId}`);
  }
  return CARS[carId];
}

export function getAllCars(): Car[] {
  return Object.values(CARS);
}
