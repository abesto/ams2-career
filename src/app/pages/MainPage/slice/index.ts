import { getAllDisciplines } from 'app/data/disciplines';
import { EnrichedCareerData } from 'app/slice/types';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { racegen } from '../racegen';
import { MainPageState } from './types';

export const initialState: MainPageState = {
  raceOptions: [],
  selectedRaceIndex: null,
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
      state.selectedRaceIndex = null;
    },
    selectRace(state, action: PayloadAction<number>) {
      state.selectedRaceIndex = action.payload;
    },
    reset(state, action: PayloadAction<void>) {
      state.raceOptions = [];
      state.selectedRaceIndex = null;
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
