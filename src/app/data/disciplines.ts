import { Discipline, DisciplineId } from 'types/Discipline';

const names = ['Endurance', 'GT', 'Open Wheel'];

const DISCIPLINES: Discipline[] = names.map(name => ({
  name,
}));

export function getDiscipline(name: DisciplineId): Discipline {
  const discipline = DISCIPLINES.find(d => d.name === name);
  if (!discipline) {
    throw new Error(`Unknown discipline: ${name}`);
  }
  return discipline;
}

export function getAllDisciplines(): Discipline[] {
  return Object.values(DISCIPLINES);
}
