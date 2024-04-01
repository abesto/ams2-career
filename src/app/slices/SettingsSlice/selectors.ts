import { createSelector } from '@reduxjs/toolkit';

import initialState from './initialState';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.settings || initialState;

export const selectSettings = createSelector([selectSlice], state => state);
