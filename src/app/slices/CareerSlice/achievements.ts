import { impl, Variant } from '@practical-fp/union-types';

import { SettingsState } from '../SettingsSlice/types';
import { GradeUp, RaceOutcome } from './types';

import { getCarClass } from 'app/data/car_classes';
import { checkDisciplineId, getAllDisciplines } from 'app/data/disciplines';
import { formatXp, lowestGrade, xpGain, xpNeededForLevelUpTo } from 'app/xp';
import { CarClassId } from 'types/CarClass';
import { DisciplineId, getDisciplineId } from 'types/Discipline';
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

export type AchievementProgress =
  | Variant<
      'Progress',
      {
        current: number;
        max: number;
        formattedCurrent?: string;
        formattedMax?: string;
      }
    >
  | Variant<'Unlocked', { timestamp: number }>;
const { Progress, Unlocked } = impl<AchievementProgress>();

interface Result<A> {
  acc: A;
  progress: number;
}

interface Proc {
  process: (result: RaceResult, outcomes: RaceOutcome[]) => AchievementProgress;
  readonly progressMax: number;
}

function proc<A>(
  initialAcc: A,
  progressMax: number,
  f: (a: A, r: RaceResult, o: RaceOutcome[]) => Result<A>,
): Proc {
  let acc = initialAcc;
  return {
    progressMax,
    process: (r, o) => {
      const result = f(acc, r, o);
      if (result.progress >= progressMax) {
        return Unlocked({ timestamp: r.racedAt });
      } else {
        acc = result.acc;
        return Progress({ current: result.progress, max: progressMax });
      }
    },
  };
}

function procUniqueTrackCount(n: number): Proc {
  return proc(new Set<TrackId>(), n, (tracks, result) => {
    tracks.add(result.trackId);
    return { acc: tracks, progress: tracks.size };
  });
}

function procUniqueCarClasses(n: number): Proc {
  return proc(new Set<CarClassId>(), n, (carClasses, result) => {
    carClasses.add(result.carClassId);
    return { acc: carClasses, progress: carClasses.size };
  });
}

function procNDisciplinesToGrade(n: number, grade: number): Proc {
  return proc(
    new Set<DisciplineId>(),
    n,
    (disciplines, _raceResult, outcomes) => {
      outcomes
        .filter(GradeUp.is)
        .filter(o => o.value.newGrade === grade)
        .forEach(outcome => disciplines.add(outcome.value.disciplineId));
      return { acc: disciplines, progress: disciplines.size };
    },
  );
}

function procGradeA(disciplineIdStr: string): Proc {
  // Maaaybe progress here should be how many grades there are until reaching A, but maybe that's confusing.
  // For now, this is one where progress will be zero until it's unlocked.
  const disciplineId = checkDisciplineId(disciplineIdStr);
  return proc(null, 1, (_s, _r, outcomes) => {
    return {
      acc: null,
      progress: outcomes
        .filter(GradeUp.is)
        .some(
          o => o.value.disciplineId === disciplineId && o.value.newGrade === 1,
        )
        ? 1
        : 0,
    };
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
  formatNumber?: (n: number) => string;
}

export interface Achievement extends AchievementBase {
  progress: AchievementProgress;
}

export function isUnlocked(achievement: Achievement): boolean {
  return Unlocked.is(achievement.progress);
}

function makeSpec(settings: SettingsState): SpecItem[] {
  const spec: SpecItem[] = [
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
      proc: proc(
        new Set<DisciplineId>(),
        getAllDisciplines().length,
        (disciplines, _result, outcomes) => {
          outcomes.filter(GradeUp.is).forEach(outcome => {
            disciplines.add(outcome.value.disciplineId);
          });
          return { acc: disciplines, progress: disciplines.size };
        },
      ),
    },
    {
      name: "Whitman's Sampler",
      level: Bronze,
      description: 'Complete one race in all disciplines',
      proc: proc(
        new Set<DisciplineId>(),
        getAllDisciplines().length,
        (disciplines, result) => {
          disciplines.add(getCarClass(result.carClassId).disciplineId);
          return { acc: disciplines, progress: disciplines.size };
        },
      ),
    },
    {
      name: 'Robby Gordon!',
      level: Gold,
      description: 'Win a race in 3 disciplines',
      proc: proc(new Set<DisciplineId>(), 3, (disciplines, result) => {
        if (result.position === 1) {
          disciplines.add(getCarClass(result.carClassId).disciplineId);
        }
        return { acc: disciplines, progress: disciplines.size };
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
      proc: procGradeA('Open Wheel'),
    },
    {
      name: 'Welcome to La Sarthe',
      level: Gold,
      description: 'Level up Endurance to Grade A',
      proc: procGradeA('Endurance'),
    },
    {
      name: 'More Power than Brains',
      level: Silver,
      description: 'Level up GT to Grade A',
      proc: procGradeA('GT'),
    },
    {
      name: 'Tin Top Titan',
      level: Silver,
      description: 'Level up Touring to Grade A',
      proc: procGradeA('Touring'),
    },
    {
      name: 'Modern Classic',
      level: Silver,
      description: 'Level up Vintage to Grade A',
      proc: procGradeA('Vintage'),
    },
  ];

  // Master each discipline
  for (const discipline of getAllDisciplines()) {
    const disciplineId = getDisciplineId(discipline);
    let maxXp = 0;
    for (let grade = lowestGrade(discipline) - 1; grade >= 0; grade--) {
      maxXp += xpNeededForLevelUpTo(disciplineId, grade);
    }
    spec.push({
      name: `Hall of Fame: ${discipline.name}`,
      level: Platinum,
      description: `Achieve maximum XP in ${discipline.name}`,
      formatNumber: n => formatXp(n).toString(),
      proc: proc(0, maxXp, (xp, result) => {
        const newXp = xp + xpGain(disciplineId, result, settings);
        return { acc: newXp, progress: newXp };
      }),
    });
  }

  return spec;
}

function formatProgress(progress: AchievementProgress, spec: SpecItem) {
  if (spec.formatNumber && Progress.is(progress)) {
    progress.value.formattedCurrent = spec.formatNumber(progress.value.current);
    progress.value.formattedMax = spec.formatNumber(progress.value.max);
  }
}

export const prepareAchievements = (settings: SettingsState) => {
  const specs: SpecItem[] = makeSpec(settings);
  const progresses: Map<AchievementId, AchievementProgress> = new Map();

  for (const spec of specs) {
    progresses.set(
      spec.name,
      Progress({ current: 0, max: spec.proc.progressMax }),
    );
  }

  function toAchievement(specItem: SpecItem): Achievement {
    const progress = progresses.get(specItem.name)!;
    return {
      name: specItem.name,
      level: specItem.level,
      description: specItem.description,
      progress,
    };
  }

  function process(
    raceResult: RaceResult,
    outcomes: RaceOutcome[],
  ): Achievement[] {
    const ret: Achievement[] = [];

    for (const spec of specs) {
      const oldProgress = progresses.get(spec.name);
      if (oldProgress !== undefined && Unlocked.is(oldProgress)) {
        continue;
      }

      const newProgress = spec.proc.process(raceResult, outcomes);
      formatProgress(newProgress, spec);
      progresses.set(spec.name, newProgress);
      if (Unlocked.is(newProgress)) {
        ret.push(toAchievement(spec));
      }
    }
    return ret;
  }

  function finalize(): Achievement[] {
    return specs.map(toAchievement);
  }

  return { process, finalize };
};
