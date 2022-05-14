import { ADT, refinement } from 'ts-adt';

import { RaceOutcome } from './types';

import { getCarClass } from 'app/data/car_classes';
import { getAllDisciplines } from 'app/data/disciplines';
import { CarClassId } from 'types/CarClass';
import { DisciplineId } from 'types/Discipline';
import { RaceResult } from 'types/Race';
import { TrackId } from 'types/Track';

export enum AchievementLevel {
  Bronze,
  Silver,
  Gold,
  Platinum,
}
const Bronze = AchievementLevel.Bronze;
const Silver = AchievementLevel.Silver;
const Gold = AchievementLevel.Gold;
const Platinum = AchievementLevel.Platinum;

type Result<S> = ADT<{
  Next: { state: S };
  Done: {};
}>;

function next<S>(state: S): Result<S> {
  return { _type: 'Next', state };
}

function done<S>(): Result<S> {
  return { _type: 'Done' };
}

type Proc = (result: RaceResult, outcomes: RaceOutcome[]) => boolean;

function proc<S>(
  initial: S,
  f: (s: S, r: RaceResult, o: RaceOutcome[]) => Result<S>,
): Proc {
  let state = initial;
  return (r, o) => {
    const result = f(state, r, o);
    if (refinement('Next')(result)) {
      state = result.state;
      return false;
    }
    return true;
  };
}

function procUniqueTrackCount(n: number): Proc {
  return proc(
    new Set<TrackId>(),
    (tracks: Set<TrackId>, result: RaceResult) => {
      tracks.add(result.trackId);
      if (tracks.size >= n) {
        return done();
      }
      return next(tracks);
    },
  );
}

function procUniqueCarClasses(n: number): Proc {
  return proc(
    new Set<CarClassId>(),
    (carClasses: Set<CarClassId>, result: RaceResult) => {
      carClasses.add(result.carClassId);
      if (carClasses.size >= n) {
        return done();
      }
      return next(carClasses);
    },
  );
}

function procNDisciplinesToGrade(n: number, grade: number): Proc {
  return proc(
    new Set<DisciplineId>(),
    (disciplines: Set<DisciplineId>, _, outcomes: RaceOutcome[]) => {
      for (const outcome of outcomes) {
        if (refinement('GradeUp')(outcome)) {
          if (outcome.newGrade === grade) {
            disciplines.add(outcome.disciplineId);
          }
        }
      }
      if (disciplines.size >= n) {
        return done();
      }
      return next(disciplines);
    },
  );
}

function procGradeA(disciplineId: DisciplineId): Proc {
  return proc(null, (_s, _r, outcomes) => {
    for (const outcome of outcomes) {
      if (refinement('GradeUp')(outcome)) {
        if (outcome.newGrade === 1 && outcome.disciplineId === disciplineId) {
          return done();
        }
      }
    }
    return next(null);
  });
}

export type AchievementId = string;

interface AchievementBase {
  name: AchievementId;
  level: AchievementLevel;
  description: string;
}

interface SpecItem extends AchievementBase {
  proc: Proc;
}

export interface Achievement extends AchievementBase {
  unlocked: boolean;
}

function makeSpec(): SpecItem[] {
  return [
    // Track count
    {
      name: 'Frequent Flyer',
      level: Bronze,
      description: 'Race on 10 Tracks',
      proc: procUniqueTrackCount(10),
    },
    {
      name: 'Road Warrior',
      level: Silver,
      description: 'Race on 20 Tracks',
      proc: procUniqueTrackCount(20),
    },
    {
      name: 'World Traveler',
      level: Gold,
      description: 'Race on 30 Tracks',
      proc: procUniqueTrackCount(30),
    },
    {
      name: 'Magellan',
      level: Platinum,
      description: 'Race on 40 Tracks',
      proc: procUniqueTrackCount(40),
    },
    // Variety
    {
      name: 'Moving Up',
      level: Bronze,
      description: 'Level up all disciplines at least one grade',
      proc: proc(new Set<DisciplineId>(), (disciplines, result) => {
        disciplines.add(getCarClass(result.carClassId).disciplineId);
        if (disciplines.size === getAllDisciplines().length) {
          return done();
        }
        return next(disciplines);
      }),
    },
    {
      name: "Whitman's Sampler",
      level: Bronze,
      description: 'Complete one race in all disciplines',
      proc: proc(new Set<DisciplineId>(), (disciplines, result) => {
        disciplines.add(getCarClass(result.carClassId).disciplineId);
        if (disciplines.size === getAllDisciplines().length) {
          return done();
        }
        return next(disciplines);
      }),
    },
    {
      name: 'Robby Gordon!',
      level: Gold,
      description: 'Win a race in 3 disciplines',
      proc: proc(new Set<DisciplineId>(), (disciplines, result) => {
        if (result.position === 1) {
          disciplines.add(getCarClass(result.carClassId).disciplineId);
        }
        if (disciplines.size >= 3) {
          return done();
        }
        return next(disciplines);
      }),
    },
    {
      name: "Can't Have Just One",
      level: Bronze,
      description: 'Race in 20 different classes',
      proc: procUniqueCarClasses(20),
    },
    {
      name: 'Juan Pablo Montoy-who?!',
      level: Silver,
      description: 'Race in 30 different classes',
      proc: procUniqueCarClasses(30),
    },
    {
      name: 'Kimi Raikkon-Nope!',
      level: Gold,
      description: 'Race in 40 different classes',
      proc: procUniqueCarClasses(40),
    },
    {
      name: 'Gotta Try Them All',
      level: Platinum,
      description: 'Race in 50 different classes',
      proc: procUniqueCarClasses(50),
    },
    // Level all disciplines
    {
      name: 'Vic Elford',
      level: Bronze,
      description: 'Level up 5 disciplines to Grade C',
      proc: procNDisciplinesToGrade(5, 3),
    },
    {
      name: 'Jacky Ickx',
      level: Silver,
      description: 'Level up 5 disciplines to Grade B',
      proc: procNDisciplinesToGrade(5, 2),
    },
    {
      name: 'Graham Hill',
      level: Gold,
      description: 'Level up 5 disciplines to Grade A',
      proc: procNDisciplinesToGrade(5, 1),
    },
    // Level one discipline to the top
    {
      name: 'Grand Prix Driver',
      level: Gold,
      description: 'Level up Open Wheel to Grade A',
      proc: procGradeA('Open Wheel' as DisciplineId),
    },
    {
      name: 'Welcome to La Sarthe',
      level: Gold,
      description: 'Level up Endurance to Grade A',
      proc: procGradeA('Endurance' as DisciplineId),
    },
    {
      name: 'More Power than Brains',
      level: Silver,
      description: 'Level up GT to Grade A',
      proc: procGradeA('GT' as DisciplineId),
    },
    {
      name: 'Tin Top Titan',
      level: Silver,
      description: 'Level up Touring to Grade A',
      proc: procGradeA('Touring' as DisciplineId),
    },
    {
      name: 'Modern Classic',
      level: Silver,
      description: 'Level up Vintage to Grade A',
      proc: procGradeA('Vintage' as DisciplineId),
    },
  ];
}

export const prepareAchievements = () => {
  const achievements: (Achievement & SpecItem)[] = [];

  function toAchievement(x: Achievement & SpecItem): Achievement {
    const { name, level, description, unlocked } = x;
    return { name, level, description, unlocked };
  }

  for (const item of makeSpec()) {
    achievements.push({
      name: item.name,
      level: item.level,
      description: item.description,
      unlocked: false,
      proc: item.proc,
    });
  }

  function process(result: RaceResult, outcomes: RaceOutcome[]): Achievement[] {
    const ret: Achievement[] = [];
    for (const achievement of achievements) {
      if (!achievement.unlocked && achievement.proc(result, outcomes)) {
        achievement.unlocked = true;
        ret.push(toAchievement(achievement));
      }
    }
    return ret;
  }

  function finalize(): Achievement[] {
    return achievements.map(toAchievement);
  }

  return { process, finalize };
};
