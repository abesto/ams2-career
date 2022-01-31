import { CarSpec } from 'types/CarSpec';
import { TrackSpec } from 'types/TrackSpec';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { DataDebugPageSliceState } from './types';

export const initialState: DataDebugPageSliceState = {
  hoveredCar: null,
  hoveredTrack: null,
};

const slice = createSlice({
  name: 'dataDebugPageSlice',
  initialState,
  reducers: {
    carEnter(state, action: PayloadAction<CarSpec>) {
      state.hoveredCar = action.payload;
    },
    carLeave(state, _action: PayloadAction<CarSpec>) {
      state.hoveredCar = null;
    },
    trackEnter(state, action: PayloadAction<TrackSpec>) {
      state.hoveredTrack = action.payload;
    },
    trackLeave(state, _action: PayloadAction<TrackSpec>) {
      state.hoveredTrack = null;
    },
  },
});

export const { actions: homePageSliceActions } = slice;

export const useDataDebugPageSliceSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};
