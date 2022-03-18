import { getAllCarClasses, getCarClassesIn } from './car_classes';
import { getAllCars } from './cars';
import { getAllDisciplines } from './disciplines';
import { getCarClassIdsWithDefinedTracks } from './tracks';
import {
  getCrossDisciplineMultiplier,
  getGradeMultiplier,
  getPrestigeMultiplier,
  xpNeededForLevelUpTo,
} from './xp';

import { getCarClassId } from 'types/CarClass';
import { getDisciplineId } from 'types/Discipline';

type Result = Generator<string, void, void>;

function* verifyCarToCarClass(): Result {
  const carClasses = getAllCarClasses();
  for (const car of getAllCars()) {
    if (!carClasses.some(c => getCarClassId(c) === car.carClassId)) {
      yield `Unknown car class: ${car.carClassId} for car ${car.name}`;
    }
  }
}

function* verifyCarClassToDiscipline(): Result {
  const disciplines = getAllDisciplines();
  for (const carClass of getAllCarClasses()) {
    if (!disciplines.some(d => getDisciplineId(d) === carClass.disciplineId)) {
      yield `Unknown discipline: ${carClass.disciplineId} for car class ${carClass.name}`;
    }
  }
}

function* verifyAllClassesDefinedForTracks(): Result {
  const knownCarClassIds = getCarClassIdsWithDefinedTracks();
  for (const carClass of getAllCarClasses()) {
    if (!knownCarClassIds.includes(getCarClassId(carClass))) {
      yield `No tracks defined for car class ${carClass.name}`;
    }
  }
}

function* verifyXpCrossDisciplineMultipliers(): Result {
  for (const discipline0 of getAllDisciplines()) {
    for (const discilpine1 of getAllDisciplines()) {
      try {
        getCrossDisciplineMultiplier(
          getDisciplineId(discipline0),
          getDisciplineId(discilpine1),
        );
      } catch (e: any) {
        yield e.message;
      }
    }
  }
}

function* verifyGrades(): Result {
  for (const discipline of getAllDisciplines()) {
    const grades = new Set(getCarClassesIn(discipline).map(c => c.grade));

    for (const grade of grades) {
      try {
        getGradeMultiplier(getDisciplineId(discipline), grade);
      } catch (e: any) {
        yield `getGradeMultiplier: ${e.message}`;
      }
    }

    grades.delete(Math.max(...grades));
    for (const grade of grades) {
      try {
        xpNeededForLevelUpTo(getDisciplineId(discipline), grade);
      } catch (e: any) {
        yield `xpNeededForLevelUp: ${e.message}`;
      }
    }
  }
}

function* verifyPrestige(): Result {
  for (const discipline of getAllDisciplines()) {
    try {
      getPrestigeMultiplier(getDisciplineId(discipline));
    } catch (e: any) {
      yield e.message;
    }
  }
}

export function* checkConsistency(): Result {
  yield* verifyCarToCarClass();
  yield* verifyCarClassToDiscipline();
  yield* verifyAllClassesDefinedForTracks();
  yield* verifyXpCrossDisciplineMultipliers();
  yield* verifyGrades();
  yield* verifyPrestige();
}
