import { RootState } from 'types';
import { initialState } from '.';

export const selectChangelog = (state: RootState) =>
  state.changelog || initialState;
