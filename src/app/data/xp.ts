import Papa from 'papaparse';
import raw from 'raw.macro';

import { DisciplineId } from 'types/Discipline';

const GRADE_MULTIPLIERS: Map<DisciplineId, Map<number, number>> = new Map();
const CROSS_DISCIPLINE_MULTIPLIERS: Map<
  DisciplineId,
  Map<DisciplineId, number>
> = new Map();

// Load grade multipliers
for (const row of Papa.parse(raw('./xp_grade.csv')).data) {
  const disciplineId = row[0] as DisciplineId;
  GRADE_MULTIPLIERS.set(disciplineId, new Map());
  for (let grade = 1; grade < row.length; grade++) {
    GRADE_MULTIPLIERS.get(disciplineId)!.set(grade, parseFloat(row[grade]));
  }
}

// Load cross-discipline multipliers
for (const row of Papa.parse(raw('./xp_cross_discipline.csv'), { header: true })
  .data) {
  const fromId = row.source as DisciplineId;
  const map: Map<DisciplineId, number> = new Map();
  for (const [toId, multiplier] of Object.entries(row)) {
    map.set(toId as DisciplineId, parseFloat(multiplier as string));
  }
  CROSS_DISCIPLINE_MULTIPLIERS.set(fromId, map);
}

export function getGradeMultiplier(
  disciplineId: DisciplineId,
  grade: number,
): number {
  const disciplineMultipliers = GRADE_MULTIPLIERS.get(disciplineId);
  if (!disciplineMultipliers) {
    throw new Error(`Unknown discipline: ${disciplineId}`);
  }
  const multiplier = disciplineMultipliers.get(grade);
  if (!multiplier) {
    throw new Error(`Unknown grade: ${grade}`);
  }
  return multiplier;
}

export function getCrossDisciplineMultiplier(
  fromId: DisciplineId,
  toId: DisciplineId,
): number {
  const map = CROSS_DISCIPLINE_MULTIPLIERS.get(fromId);
  if (!map) {
    throw new Error(`Unknown discipline: ${fromId}`);
  }
  const multiplier = map.get(toId);
  if (!multiplier) {
    throw new Error(`Unknown discipline: ${toId}`);
  }
  return multiplier;
}
