import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { CareerState } from './types';

export const initialState: CareerState = {
  raceResults: [],
};

const slice = createSlice({
  name: 'career',
  initialState,
  reducers: {},
});

export const { actions: careerActions } = slice;

export const useCareerSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useCareerSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
