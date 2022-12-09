import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { SettingsState } from './types';

export const initialState: SettingsState = {
  crossDisciplineGainsEnabled: true,
  xpMultiplier: 1.0,
  canRegenerateRaces: false,
  positionXpMultiplier: 1.0,
};

const slice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetCrossDisciplineGainsEnabled(state, action: PayloadAction<void>) {
      state.crossDisciplineGainsEnabled =
        initialState.crossDisciplineGainsEnabled;
    },
    setCrossDisciplineGainsEnabled(state, action: PayloadAction<boolean>) {
      state.crossDisciplineGainsEnabled = action.payload;
    },
    resetXpMultiplier(state, action: PayloadAction<void>) {
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
    resetPositionXpMultiplier(state, action: PayloadAction<void>) {
      state.positionXpMultiplier = initialState.positionXpMultiplier;
    },
  },
});

export const { actions: settingsActions } = slice;

export const useSettingsSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useSettingsSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
