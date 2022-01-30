import { Discipline } from 'types/Discipline';

const names = ['Endurance', 'GT', 'Open Wheel'];
const headlights = ['Endurance'];

export const DISCIPLINES: Discipline[] = names.map(name => ({
  name,
  headlights: headlights.includes(name),
}));

export function getDiscipline(name: string): Discipline {
  const discipline = DISCIPLINES.find(d => d.name === name);
  if (!discipline) {
    throw new Error(`Unknown discipline: ${name}`);
  }
  return discipline;
}
