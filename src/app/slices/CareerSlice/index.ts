import { backup } from 'store/saveload';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { CareerState } from './types';

import { AIAdjustmentInstance } from 'app/pages/MainPage/slice/types';
import { RaceResult } from 'types/Race';

export const initialState: CareerState = {
  raceResults: [],
};

const slice = createSlice({
  name: 'career',
  initialState,
  reducers: {
    recordRaceResult(
      state,
      action: PayloadAction<{
        raceResult: RaceResult;
        aiAdjustment: AIAdjustmentInstance;
      }>,
    ) {
      state.raceResults.push(action.payload.raceResult);
    },
    resetCareer(state, action: PayloadAction<void>) {
      state.raceResults = [];
      backup('reset');
    },
  },
});

export const { actions: careerActions } = slice;

export const useCareerSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};
