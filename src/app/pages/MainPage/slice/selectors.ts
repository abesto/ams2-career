import { RootState } from 'types';

import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './';

const selectSlice = (state: RootState) => state.mainPage || initialState;

export const selectMainPage = createSelector([selectSlice], state => state);
