import { CarClass } from 'types/CarClass';
import { Discipline } from 'types/Discipline';

import { getDiscipline } from './disciplines';

const classes = {
  GT: {
    0: ['Ginetta G40 Cup', 'GT5'],
    1: ['GT4'],
    2: ['GT3'],
  },
  Endurance: {
    0: ['Gain XP in GT'],
    1: ['GT4'],
    2: ['GT3'],
  },
  'Open Wheel': {
    0: ['Karting 125CC'],
    1: ['Formula Trainer'],
    2: ['F3'],
  },
};

export const CAR_CLASSES: CarClass[] = Object.entries(classes).flatMap(
  ([discipline, classes]) =>
    Object.entries(classes).flatMap(([level, names]) =>
      names.map(name => ({
        name,
        level: Number(level),
        discipline: getDiscipline(discipline),
      })),
    ),
);

export function getCarClasses(name: string): CarClass[] {
  return CAR_CLASSES.filter(c => c.name === name);
}

export function classesIn(discipline: Discipline): CarClass[] {
  return CAR_CLASSES.filter(c => c.discipline === discipline);
}

export function classesAt(discipline: Discipline, level: number): CarClass[] {
  return classesIn(discipline).filter(c => c.level === level);
}

export function classExists(name: string): boolean {
  return CAR_CLASSES.some(c => c.name === name);
}

export function classKey(carClass: CarClass): string {
  return `${carClass.discipline.name}-${carClass.name}`;
}

export function classEquals(a: CarClass, b: CarClass): boolean {
  return classKey(a) === classKey(b);
}
