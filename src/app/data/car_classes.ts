import { CarClass, CarClassId, getCarClassId } from 'types/CarClass';
import { Discipline, DisciplineId, getDisciplineId } from 'types/Discipline';

import { getDiscipline } from './disciplines';

const classes = {
  GT: {
    0: ['Ginetta G40 Cup', 'GT5'],
    1: ['GT4'],
    2: ['GT3'],
    3: ['GTE'],
  },
  Endurance: {
    0: ['Gain XP in GT'],
    1: ['GT4'],
    2: ['GT3'],
    3: ['GTE'],
  },
  'Open Wheel': {
    0: ['Karting 125CC'],
    1: ['Formula Trainer'],
    2: ['F3'],
  },
};

export const CAR_CLASSES: { [key: CarClassId]: CarClass } = Object.fromEntries(
  Object.entries(classes).flatMap(([disciplineId, classes]) =>
    Object.entries(classes).flatMap(([level, names]) =>
      names.map(name => {
        getDiscipline(disciplineId as DisciplineId); // For the side-effect of exploding if there's an invalid disciplineId in `classes`
        const carClass = {
          disciplineId: disciplineId as DisciplineId,
          level: parseInt(level),
          name,
        };
        return [getCarClassId(carClass), carClass];
      }),
    ),
  ),
);

export function getCarClass(id: CarClassId): CarClass {
  const carClass = CAR_CLASSES[id];
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
