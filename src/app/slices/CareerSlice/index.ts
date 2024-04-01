import { backup } from 'store/saveload';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    resetCareer(state) {
      state.raceResults = [];
      backup('reset');
    },
    // Used only for analytics
    achievementUnlocked() {},
  },
});

export const { recordRaceResult, resetCareer, achievementUnlocked } =
  slice.actions;
export default slice.reducer;
