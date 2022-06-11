import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

const selectSlice = (state: RootState) => state.settings || initialState;

export const selectSettings = createSelector([selectSlice], state => state);
