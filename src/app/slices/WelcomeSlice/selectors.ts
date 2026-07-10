import { initialState } from './';

import { RootState } from 'types';

export const selectWelcome = (state: RootState) =>
  state.welcome || initialState;
