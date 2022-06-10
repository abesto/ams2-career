import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { racegen } from '../racegen';
import { MainPageState } from './types';

import { getDisciplineOfCarClass } from 'app/data/car_classes';
import { getAllDisciplines } from 'app/data/disciplines';
import { EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { CarId } from 'types/Car';
import { CarClassId } from 'types/CarClass';
import { DisciplineId, getDisciplineId } from 'types/Discipline';

export const initialState: MainPageState = {
  raceOptions: [],
  selectedRaceIndex: 0,
  selectedCars: {},
  aiAdjustment: {
    global: 0,
    discipline: {},
    carClass: {},
    car: {},
  },
};

const slice = createSlice({
  name: 'mainPage',
  initialState,
  reducers: {
    generateRaces(
      state,
      action: PayloadAction<{ career: EnrichedCareerData }>,
    ) {
      const career = action.payload.career;
      state.raceOptions = getAllDisciplines().flatMap(d => racegen(d, career));
      state.selectedRaceIndex = 0;

      if (career.raceResults.length > 0) {
        // Select the same class as the last race by default
        const lastRace = career.raceResults[career.raceResults.length - 1];
        state.selectedRaceIndex = state.raceOptions.findIndex(
          option => option.carClassId === lastRace.carClassId,
        );
        // The same class is not available; must have leveled up. Let's still select the first race in the same discipline.
        if (state.selectedRaceIndex === -1) {
          state.selectedRaceIndex = state.raceOptions.findIndex(
            option =>
              getDisciplineId(getDisciplineOfCarClass(option.carClassId)) ===
              getDisciplineId(getDisciplineOfCarClass(lastRace.carClassId)),
          );
        }
        // This should never happen, but you know, just in case, let's not do dumb things.
        if (state.selectedRaceIndex === -1) {
          state.selectedRaceIndex = 0;
        }
      }
    },
    selectRace(state, action: PayloadAction<number>) {
      state.selectedRaceIndex = action.payload;
    },
    selectCar(
      state,
      action: PayloadAction<{ carClassId: CarClassId; carId: CarId }>,
    ) {
      state.selectedCars[action.payload.carClassId] = action.payload.carId;
    },
    reset(state, action: PayloadAction<void>) {
      state.raceOptions = [];
      state.selectedRaceIndex = 0;
    },
    adjustAIGlobal(state, action: PayloadAction<number>) {
      state.aiAdjustment.global = action.payload;
    },
    adjustAIDiscipline(
      state,
      action: PayloadAction<{ id: DisciplineId; value: number }>,
    ) {
      state.aiAdjustment.discipline[action.payload.id] = action.payload.value;
    },
    adjustAICarClass(
      state,
      action: PayloadAction<{ id: CarClassId; value: number }>,
    ) {
      state.aiAdjustment.carClass[action.payload.id] = action.payload.value;
    },
    adjustAICar(state, action: PayloadAction<{ id: CarId; value: number }>) {
      state.aiAdjustment.car[action.payload.id] = action.payload.value;
    },
  },
});

export const { actions: mainPageActions } = slice;

export const useMainPageSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useMainPageSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
