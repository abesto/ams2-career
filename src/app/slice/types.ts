import { DISCIPLINES } from 'app/data/disciplines';
import { xpGain, XpProgress, totalXpToProgress } from 'app/xp';
import { Discipline } from 'types/Discipline';
import { RaceResult } from 'types/Race';

/* --- STATE --- */
export interface CareerState {
  raceResults: RaceResult[];
}

export interface EnrichedCareerData extends CareerState {
  progress: Map<Discipline, XpProgress>;
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
