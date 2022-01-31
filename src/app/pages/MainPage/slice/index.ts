import { DISCIPLINES } from 'app/data/disciplines';
import { Progress } from 'app/slice/types';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { racegen } from '../racegen';
import { MainPageState } from './types';

export const initialState: MainPageState = {
  raceOptions: [],
};

const slice = createSlice({
  name: 'mainPage',
  initialState,
  reducers: {
    generateRaces(
      state,
      action: PayloadAction<{ levels: { [key: string]: number } }>,
    ) {
      const { levels } = action.payload;
      state.raceOptions = DISCIPLINES.flatMap(d => racegen(d, levels[d.name]));
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
