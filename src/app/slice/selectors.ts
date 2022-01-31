import { RootState } from 'types';

import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './';
import { enrich } from './types';

const selectSlice = (state: RootState) => state.career || initialState;

export const selectCareer = createSelector([selectSlice], enrich);
