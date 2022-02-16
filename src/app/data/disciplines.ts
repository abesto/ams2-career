import Papa from 'papaparse';
import raw from 'raw.macro';

import { Discipline, DisciplineId } from '../../types/Discipline';

type Record = {
  class: string;
  discipline: DisciplineId;
  grade: number;
};

const data: Record[] = Papa.parse(raw('./car_classes.csv'), {
  header: true,
  dynamicTyping: true,
}).data;

const DISCIPLINES: Discipline[] = data
  .map(record => record.discipline)
  .filter(x => x)
  .filter((v, i, a) => a.indexOf(v) === i)
  .map(name => ({ name }));

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
