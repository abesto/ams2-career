import { ADT } from 'ts-adt';

import { Achievement, prepareAchievements } from './achievements';

import { getAllDisciplines } from 'app/data/disciplines';
import { DisciplineProgress, totalXpToProgress, xpGain } from 'app/xp';
import {
  Discipline,
  disciplineEquals,
  DisciplineId,
  getDisciplineId,
} from 'types/Discipline';
import { getDisciplineOfRace, RaceResult } from 'types/Race';

/* --- STATE --- */
export interface CareerState {
  raceResults: RaceResult[];
}

export type Progress = { [key: string]: DisciplineProgress };

export type RaceOutcome = ADT<{
  XpGain: { disciplineId: DisciplineId; amount: number };
  GradeUp: { disciplineId: DisciplineId; newGrade: number };
  AchievementUnlocked: Achievement;
}>;

export interface EnrichedCareerData extends CareerState {
  progress: Progress;
  outcomes: RaceOutcome[][]; // First index matches outcomes to raceResults
  achievements: Achievement[];
}

export function enrich(state: CareerState): EnrichedCareerData {
  const data: EnrichedCareerData = {
    ...state,
    progress: {},
    outcomes: [],
    achievements: [],
  };
  const achievements = prepareAchievements();

  const xp: Map<DisciplineId, number> = new Map();

  for (const discipline of getAllDisciplines()) {
    data.progress[getDisciplineId(discipline)] = totalXpToProgress(
      discipline,
      0,
    );
  }

  for (const raceResult of state.raceResults) {
    const outcomes: RaceOutcome[] = [];

    for (const targetDiscipline of getAllDisciplines()) {
      const targetDisciplineId = getDisciplineId(targetDiscipline);
      const xpBefore = xp.get(targetDisciplineId) || 0;
      const progressBefore = totalXpToProgress(targetDiscipline, xpBefore);

      const gainedXp = xpGain(targetDisciplineId, raceResult);
      if (gainedXp === 0) {
        continue;
      }

      const xpAfter = xpBefore + gainedXp;
      const progressAfter = totalXpToProgress(targetDiscipline, xpAfter);
      xp.set(targetDisciplineId, xpAfter);
      outcomes.push({
        _type: 'XpGain',
        disciplineId: targetDisciplineId,
        amount: gainedXp,
      });
      data.progress[targetDisciplineId] = progressAfter;

      if (progressAfter.level < progressBefore.level) {
        outcomes.push({
          _type: 'GradeUp',
          disciplineId: targetDisciplineId,
          newGrade: progressAfter.level,
        });
      }
    }

    const unlockedAchievements = achievements.process(raceResult, outcomes);
    for (const achievement of unlockedAchievements) {
      outcomes.push({ _type: 'AchievementUnlocked', ...achievement });
    }

    data.outcomes.push(outcomes);
  }

  data.achievements = achievements.finalize();
  return data;
}

export function aiLevel(
  career: EnrichedCareerData,
  discipline: Discipline,
): number {
  const races = career.raceResults.filter(r =>
    disciplineEquals(getDisciplineOfRace(r), discipline),
  );
  function adjustment(position: number): number {
    if (position < 3) {
      return 1;
    }
    if (position > 16) {
      return -2;
    }
    if (position > 7) {
      return -1;
    }
    return 0;
  }

  return races.map(r => adjustment(r.position)).reduce((a, b) => a + b, 95);
}
