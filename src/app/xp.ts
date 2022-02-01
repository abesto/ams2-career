import { Discipline } from 'types/Discipline';
import { RaceResult } from 'types/Race';

import { classesIn } from './data/car_classes';

// Simple placeholders for now

export function xpGain(result: RaceResult): number {
  return 25;
}

export function xpNeededForLevelUpTo(level: number): number {
  return 100 * (level - 1);
}

export interface DisciplineProgress {
  readonly totalXp: number;
  readonly xpInLevel: number;
  readonly level: number;
}

export function maxLevel(discipline: Discipline): number {
  return classesIn(discipline)
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
