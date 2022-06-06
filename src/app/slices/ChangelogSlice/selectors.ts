import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

const selectSlice = (state: RootState) => state.changelog || initialState;

export const selectChangelog = createSelector([selectSlice], state => state);
