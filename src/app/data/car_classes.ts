import Papa from 'papaparse';
import raw from 'raw.macro';

import { CarClass, CarClassId, getCarClassId } from '../../types/CarClass';
import {
  Discipline,
  DisciplineId,
  getDisciplineId,
} from '../../types/Discipline';
import { getDiscipline } from './disciplines';

type Record = {
  class: string;
  discipline: DisciplineId;
  grade: number;
};

const data: Record[] = Papa.parse(raw('./car_classes.csv'), {
  header: true,
  dynamicTyping: true,
}).data;

export const CAR_CLASSES: { [key: CarClassId]: CarClass } = Object.fromEntries(
  data
    .map((record: Record) => {
      const carClass = {
        name: record.class as string,
        disciplineId: getDisciplineId(getDiscipline(record.discipline)),
        level: record.grade,
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

export function getCarClassesIn(discipline: Discipline): CarClass[] {
  return Object.values(CAR_CLASSES).filter(
    c => c.disciplineId === getDisciplineId(discipline),
  );
}

export function getCarClassesAt(
  discipline: Discipline,
  level: number,
): CarClass[] {
  return getCarClassesIn(discipline).filter(c => c.level === level);
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
