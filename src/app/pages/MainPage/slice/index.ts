import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { racegen } from '../racegen';
import { MainPageState } from './types';

import { getAllDisciplines } from 'app/data/disciplines';
import { EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { CarId } from 'types/Car';
import { CarClassId } from 'types/CarClass';
import { DisciplineId } from 'types/Discipline';

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
      state.raceOptions = getAllDisciplines().flatMap(d =>
        racegen(d, action.payload.career),
      );
      state.selectedRaceIndex = 0;
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
