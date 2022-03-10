import { getCarClass, getCarClassesIn } from './data/car_classes';
import * as xpData from './data/xp';

import { Discipline, DisciplineId } from 'types/Discipline';
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
  return xpData.getGradeMultiplier(carClass.disciplineId, carClass.level);
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

export function xpGain(
  targetDisciplineId: DisciplineId,
  result: RaceResult,
): number {
  return (
    getBaseXpGain() *
    getGradeMultiplier(result) *
    getAIMultiplier(result) *
    getPositionMultiplier(result) *
    getCrossDisciplineMultiplier(targetDisciplineId, result)
  );
}

export function xpNeededForLevelUpTo(level: number): number {
  return Math.floor(2 ** (level - 2) * 100);
}

export interface DisciplineProgress {
  readonly totalXp: number;
  readonly xpInLevel: number;
  readonly level: number;
}

export function maxLevel(discipline: Discipline): number {
  return getCarClassesIn(discipline)
    .map(cls => cls.level)
    .reduce((max, level) => Math.max(max, level), 0);
}

export function totalXpToProgress(
  discipline: Discipline,
  totalXp: number,
): DisciplineProgress {
  let level = 1;
  let xpInLevel = totalXp;
  while (
    xpInLevel >= xpNeededForLevelUpTo(level + 1) &&
    level < maxLevel(discipline)
  ) {
    level += 1;
    xpInLevel -= xpNeededForLevelUpTo(level);
  }

  return {
    totalXp,
    xpInLevel,
    level,
  };
}
