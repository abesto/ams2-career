import { getCarClass, getCarClassesIn } from './data/car_classes';
import * as xpData from './data/xp';

import { Discipline, DisciplineId, getDisciplineId } from 'types/Discipline';
import { RaceResult } from 'types/Race';

export function getAIMultiplier(result: RaceResult): number {
  return result.aiLevel * 0.01;
}

export function getPositionMultiplier(result: RaceResult): number {
  return Math.max(0.9, 1.04 - 0.01 * result.position);
}

export function getBaseXpGain(): number {
  return 10;
}

export function getGradeMultiplier(result: RaceResult): number {
  const carClass = getCarClass(result.carClassId);
  return xpData.getGradeMultiplier(carClass.disciplineId, carClass.grade);
}

export function getCrossDisciplineMultiplier(
  targetDisciplineId: DisciplineId,
  result: RaceResult,
): number {
  const carClass = getCarClass(result.carClassId);
  return xpData.getCrossDisciplineMultiplier(
    carClass.disciplineId,
    targetDisciplineId,
  );
}

function getPrestigeMultiplier(result: RaceResult): number {
  const carClass = getCarClass(result.carClassId);
  return xpData.getPrestigeMultiplier(carClass.disciplineId);
}

export function getVehicleMultiplier(result: RaceResult): number {
  return getPrestigeMultiplier(result) * getGradeMultiplier(result);
}

export function xpGain(
  targetDisciplineId: DisciplineId,
  result: RaceResult,
): number {
  return (
    getBaseXpGain() *
    getGradeMultiplier(result) *
    getAIMultiplier(result) *
    getPositionMultiplier(result) *
    getCrossDisciplineMultiplier(targetDisciplineId, result) *
    getVehicleMultiplier(result)
  );
}

export interface DisciplineProgress {
  readonly totalXp: number;
  readonly xpInLevel: number;
  readonly level: number;
}

export function lowestGrade(discipline: Discipline): number {
  return getCarClassesIn(discipline)
    .map(cls => cls.grade)
    .reduce((max, level) => Math.max(max, level), 0);
}

export function totalXpToProgress(
  discipline: Discipline,
  totalXp: number,
): DisciplineProgress {
  let level = lowestGrade(discipline);
  let xpInLevel = totalXp;
  const disciplineId = getDisciplineId(discipline);
  while (
    level > 1 &&
    xpInLevel >= xpData.xpNeededForLevelUpTo(disciplineId, level - 1)
  ) {
    level -= 1;
    xpInLevel -= xpData.xpNeededForLevelUpTo(disciplineId, level);
  }

  return {
    totalXp,
    xpInLevel,
    level,
  };
}

export const xpNeededForLevelUpTo = xpData.xpNeededForLevelUpTo;

export function formatXp(n: number): number {
  return Math.round(n * 100);
}

export function formatGrade(grade: number): string {
  return ' ABCDEFGHIJKL'[grade];
}
