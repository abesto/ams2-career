export interface Discipline {
  readonly name: string;
}

export type DisciplineId = string;

export function getDisciplineId(discipline: Discipline): DisciplineId {
  return discipline.name;
}

export function disciplineEquals(a: Discipline, b: Discipline) {
  return getDisciplineId(a) === getDisciplineId(b);
}
