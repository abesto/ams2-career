import { getAllDisciplines, getDiscipline } from 'app/data/disciplines';
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

export interface EnrichedCareerData extends CareerState {
  progress: Progress;
}

export function enrich(state: CareerState): EnrichedCareerData {
  const data = {
    ...state,
    progress: {},
  };

  const xp: { [key: DisciplineId]: number } = {};

  for (const discipline of getAllDisciplines()) {
    xp[discipline.name] = 0;
  }

  for (const raceResult of state.raceResults) {
    const discipline = getDisciplineOfRace(raceResult);
    xp[getDisciplineId(discipline)] += xpGain(raceResult);
  }

  Object.entries(xp).forEach(([disciplineName, totalXp]) => {
    const discipline = getDiscipline(disciplineName);
    data.progress[disciplineName] = totalXpToProgress(discipline, totalXp);
  });

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

  // TODO add manual AI level baseline adjustment (replace '95' here)
  return races.map(r => adjustment(r.position)).reduce((a, b) => a + b, 95);
}
