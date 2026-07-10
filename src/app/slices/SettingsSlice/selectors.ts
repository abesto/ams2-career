import { RootState } from 'types';
import { initialState } from '.';

export const selectSettings = (state: RootState) =>
  state.settings || initialState;
