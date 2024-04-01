import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import initialState from './initialState';

const slice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetCrossDisciplineGainsEnabled(state) {
      state.crossDisciplineGainsEnabled =
        initialState.crossDisciplineGainsEnabled;
    },
    setCrossDisciplineGainsEnabled(state, action: PayloadAction<boolean>) {
      state.crossDisciplineGainsEnabled = action.payload;
    },
    resetXpMultiplier(state) {
      state.xpMultiplier = initialState.xpMultiplier;
    },
    setXpMultiplier(state, action: PayloadAction<number>) {
      state.xpMultiplier = action.payload;
    },
    setCanRegenerateRaces(state, action: PayloadAction<boolean>) {
      state.canRegenerateRaces = action.payload;
    },
    setPositionXpMultiplier(state, action: PayloadAction<number>) {
      state.positionXpMultiplier = action.payload;
    },
    resetPositionXpMultiplier(state) {
      state.positionXpMultiplier = initialState.positionXpMultiplier;
    },
  },
});

export const {
  resetCrossDisciplineGainsEnabled,
  setCrossDisciplineGainsEnabled,
  resetXpMultiplier,
  setXpMultiplier,
  setCanRegenerateRaces,
  setPositionXpMultiplier,
  resetPositionXpMultiplier,
} = slice.actions;
export default slice.reducer;
