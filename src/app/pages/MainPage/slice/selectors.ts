import { getCarsInClass } from 'app/data/cars';
import { RootState } from 'types';
import { getCarId } from 'types/Car';

import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './';

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
