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
  return DISCIPLINES.find(d => d.name === checkDisciplineId(name))!;
}

export function getAllDisciplines(): Discipline[] {
  return Object.values(DISCIPLINES);
}

export function checkDisciplineId(id: string | DisciplineId): DisciplineId {
  const discipline = DISCIPLINES.find(d => d.name === id);
  if (!discipline) {
    throw new Error(`Unknown discipline: ${id}`);
  }
  return id as DisciplineId;
}
