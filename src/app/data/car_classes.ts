import Papa from 'papaparse';
import raw from 'raw.macro';

import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import {
  Discipline,
  DisciplineId,
  getDisciplineId,
} from '../../types/Discipline';
import { getDiscipline } from './disciplines';

import { Car } from 'types/Car';

type Record = {
  class: string;
  discipline: DisciplineId;
  grade: number;
  headlights: number;
  race_length: number;
  race_length_unit: string;
};

const data: Record[] = Papa.parse(raw('./car_classes.csv'), {
  header: true,
  dynamicTyping: true,
}).data;

const CAR_CLASSES: { [key: CarClassId]: CarClass } = Object.fromEntries(
  data
    .map((record: Record) => {
      const carClass = {
        name: record.class as string,
        disciplineId: getDisciplineId(getDiscipline(record.discipline)),
        grade: record.grade,
        headlights: record.headlights > 0,
        raceLength: record.race_length,
        raceLengthUnit: record.race_length_unit,
      };
      return [getCarClassId(carClass), carClass];
    })
    .filter(([a, b]) => a && b),
);

export function getCarClass(id: CarClassId | CarClass): CarClass {
  if (id.hasOwnProperty('disciplineId')) {
    return id as CarClass;
  }
  const carClass = CAR_CLASSES[id as CarClassId];
  if (!carClass) {
    throw new Error(`Unknown car class: ${id}`);
  }
  return carClass;
}

export function getCarClassOfCar(car: Car): CarClass {
  return getCarClass(car.carClassId);
}

export function getCarClassesIn(discipline: Discipline): CarClass[] {
  return Object.values(CAR_CLASSES).filter(
    c => c.disciplineId === getDisciplineId(discipline),
  );
}

export function getCarClassesAt(
  discipline: Discipline,
  level: number,
): CarClass[] {
  return getCarClassesIn(discipline).filter(c => c.grade === level);
}

export function carClassExists(name: string): boolean {
  return Object.values(CAR_CLASSES).some(c => c.name === name);
}

export function getCarClassesByName(name: string): CarClass[] {
  return Object.values(CAR_CLASSES).filter(c => c.name === name);
}

export function getDisciplineOfCarClass(
  cls: CarClass | CarClassId,
): Discipline {
  return getDiscipline(getCarClass(cls).disciplineId);
}

export function getAllCarClasses(): CarClass[] {
  return Object.values(CAR_CLASSES);
}
