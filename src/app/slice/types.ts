import { DISCIPLINES, getDiscipline } from 'app/data/disciplines';
import { DisciplineProgress, totalXpToProgress, xpGain } from 'app/xp';
import { Discipline } from 'types/Discipline';
import { RaceResult } from 'types/Race';

/* --- STATE --- */
export interface CareerState {
  raceResults: RaceResult[];
}

export type Progress = Map<Discipline, DisciplineProgress>;

export interface EnrichedCareerData extends CareerState {
  progress: Progress;
}

export function enrich(state: CareerState): EnrichedCareerData {
  const data = {
    ...state,
    progress: new Map(),
  };

  const xp: { [key: string]: number } = {};

  for (const discipline of DISCIPLINES) {
    xp[discipline.name] = 0;
  }

  for (const raceResult of state.raceResults) {
    const { discipline } = raceResult.car.class;
    xp[discipline.name] += xpGain(raceResult);
  }

  Object.entries(xp).forEach(([disciplineName, totalXp]) => {
    const discipline = getDiscipline(disciplineName);
    data.progress.set(discipline, totalXpToProgress(discipline, totalXp));
  });

  return data;
}
