import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './';

import {
  getCar,
  getCarClassOfCar,
  getCarsInClass,
  getDisciplineOfCar,
} from 'app/data/cars';
import { RootState } from 'types';
import { getCarId } from 'types/Car';
import { getCarClassId } from 'types/CarClass';
import { getDisciplineId } from 'types/Discipline';

const selectSlice = (state: RootState) => state.mainPage || initialState;

export const selectMainPage = createSelector([selectSlice], state => state);

export const selectSelectedRace = createSelector([selectMainPage], state =>
  state.selectedRaceIndex === null
    ? null
    : state.raceOptions[state.selectedRaceIndex],
);

export const selectSelectedCars = createSelector(
  [selectMainPage],
  state => state.selectedCars,
);

export const selectCurrentCarId = createSelector(
  [selectSelectedCars, selectSelectedRace],
  (cars, race) =>
    race
      ? cars[race.carClassId] || getCarId(getCarsInClass(race.carClassId)[0])
      : null,
);

export const selectAIAdjustment = createSelector(
  [selectMainPage, selectCurrentCarId],
  (state, currentCarId) => {
    if (currentCarId === null) {
      return null;
    }
    const car = getCar(currentCarId);
    const carClassId = getCarClassId(getCarClassOfCar(car));
    const disciplineId = getDisciplineId(getDisciplineOfCar(car));
    return {
      global: state.aiAdjustment.global,
      discipline: state.aiAdjustment.discipline[disciplineId] || 0,
      carClass: state.aiAdjustment.carClass[carClassId] || 0,
      car: state.aiAdjustment.car[currentCarId] || 0,
    };
  },
);
