import Papa from 'papaparse';
import raw from 'raw.macro';

import { DisciplineId } from 'types/Discipline';

const GRADE_MULTIPLIERS: Map<DisciplineId, Map<number, number>> = new Map();
const CROSS_DISCIPLINE_MULTIPLIERS: Map<
  DisciplineId,
  Map<DisciplineId, number>
> = new Map();
const PRESTIGE: Map<DisciplineId, number> = new Map();
const LEVEL_UP: Map<DisciplineId, Map<number, number>> = new Map();

// Load grade multipliers
for (const row of Papa.parse(raw('./xp_grade_multiplier.csv')).data) {
  const disciplineId = row[0] as DisciplineId;
  GRADE_MULTIPLIERS.set(disciplineId, new Map());
  for (let grade = 1; grade < row.length; grade++) {
    GRADE_MULTIPLIERS.get(disciplineId)!.set(grade, parseFloat(row[grade]));
  }
}

// Load cross-discipline multipliers
for (const row of Papa.parse(raw('./xp_cross_discipline_multiplier.csv'), {
  header: true,
}).data) {
  const fromId = row.source as DisciplineId;
  const map: Map<DisciplineId, number> = new Map();
  for (const [toId, multiplier] of Object.entries(row)) {
    map.set(toId as DisciplineId, parseFloat(multiplier as string));
  }
  CROSS_DISCIPLINE_MULTIPLIERS.set(fromId, map);
}

// Load discipline prestige multipliers
for (const row of Papa.parse(raw('./xp_prestige.csv'), { header: true }).data) {
  const disciplineId = row.discipline as DisciplineId;
  PRESTIGE.set(disciplineId, parseFloat(row.prestige as string));
}

// Load class upgrade XP breakpoints
for (const row of Papa.parse(raw('./xp_grade_breakpoints.csv'), {
  header: true,
}).data) {
  const map: Map<number, number> = new Map();
  for (let i = 0; i in row; i++) {
    map.set(i, parseFloat(row[i]));
  }
  LEVEL_UP.set(row.discipline as DisciplineId, map);
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
    throw new Error(`Unknown grade: ${disciplineId} / ${grade}`);
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

export function getPrestigeMultiplier(id: DisciplineId): number {
  const multiplier = PRESTIGE.get(id);
  if (!multiplier) {
    throw new Error(`Unknown discipline: ${id}`);
  }
  return multiplier;
}

export function xpNeededForLevelUpTo(
  disciplineId: DisciplineId,
  grade: number,
): number {
  const map = LEVEL_UP.get(disciplineId);
  if (!map) {
    throw new Error(`Unknown discipline: ${disciplineId}`);
  }
  const xp = map.get(grade);
  if (!xp) {
    throw new Error(`Unknown grade: ${disciplineId} ${grade}`);
  }
  return xp;
}
