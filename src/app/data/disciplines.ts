import { Discipline } from 'types/Discipline';

const names = ['Endurance', 'GT', 'Open Wheel'];

export const DISCIPLINES: Discipline[] = names.map(name => ({
  name,
}));

export function getDiscipline(name: string): Discipline {
  const discipline = DISCIPLINES.find(d => d.name === name);
  if (!discipline) {
    throw new Error(`Unknown discipline: ${name}`);
  }
  return discipline;
}
