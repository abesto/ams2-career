import { DISCIPLINES } from 'app/data/disciplines';
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

  const xp: Map<Discipline, number> = new Map();

  for (const discipline of DISCIPLINES) {
    xp.set(discipline, 0);
  }

  for (const raceResult of state.raceResults) {
    const { discipline } = raceResult.car.class;
    xp.set(discipline, xp.get(discipline) || 0 + xpGain(raceResult));
  }

  xp.forEach((totalXp, discipline) => {
    data.progress.set(discipline, totalXpToProgress(discipline, totalXp));
  });

  return data;
}
