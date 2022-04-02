import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.welcome || initialState;

export const selectWelcome = createSelector([selectSlice], state => state);
