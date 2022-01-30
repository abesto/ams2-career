import { CarClass } from 'types/CarClass';
import { Discipline } from 'types/Discipline';
import { getDiscipline } from './disciplines';

const classes = {
  GT: {
    0: ['Ginetta G40 Cup', 'GT5'],
    1: ['GT4'],
    2: ['GT3'],
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

export function getCarClass(name: string): CarClass {
  const carClass = CAR_CLASSES.find(c => c.name === name);
  if (!carClass) {
    throw new Error(`Unknown car class: ${name}`);
  }
  return carClass;
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
