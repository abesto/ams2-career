import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { CareerState } from './types';

import { RaceResult } from 'types/Race';

export const initialState: CareerState = {
  raceResults: [],
};

const slice = createSlice({
  name: 'career',
  initialState,
  reducers: {
    recordRaceResult(state, action: PayloadAction<{ raceResult: RaceResult }>) {
      state.raceResults.push(action.payload.raceResult);
    },
    resetCareer(state, action: PayloadAction<void>) {
      state.raceResults = [];
    },
  },
});

export const { actions: careerActions } = slice;

export const useCareerSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};
