import Papa from 'papaparse';
import raw from 'raw.macro';

import { Car, CarId, getCarId } from '../../types/Car';
import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import { Discipline } from '../../types/Discipline';
import { getCarClass, getCarClassesByName } from './car_classes';
import { getDiscipline } from './disciplines';
import { getTrackIdsFor } from './tracks';

type Record = {
  car: string;
  class: string;
  discipline: string;
  year: string;
};

const data: Record[] = Papa.parse(raw('./cars.csv'), { header: true }).data;

function recordToCars(record: Record): Car[] {
  return getCarClassesByName(record.class).map(carClass => ({
    name: record.car,
    carClassId: getCarClassId(carClass),
    year:
      parseInt(record.year.trim().replace(/\*/g, '').split('-')[0]) ||
      new Date().getFullYear() - 10,
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

export function getCarsInClass(what: CarClass | CarClassId): Car[] {
  const carClass = getCarClass(what);
  return Object.values(CARS).filter(
    c => c.carClassId === getCarClassId(carClass),
  );
}

export function canRaceAtNight(what: Car | CarClass): boolean {
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
  if (!CARS[carId]) {
    throw new Error(`Unknown car: ${carId}`);
  }
  return CARS[carId];
}

export function getAllCars(): Car[] {
  return Object.values(CARS);
}
