export interface Discipline {
  readonly name: string;
}

export type DisciplineId = string & { __brand: 'DisciplineId' };

export function getDisciplineId(discipline: Discipline): DisciplineId {
  return discipline.name as DisciplineId;
}

export function disciplineEquals(a: Discipline, b: Discipline) {
  return getDisciplineId(a) === getDisciplineId(b);
}
