import { createSelector } from '@reduxjs/toolkit';

import { selectSettings } from '../SettingsSlice/selectors';
import { initialState } from './';
import { enrich } from './types';

import { RootState } from 'types';

const selectSlice = (state: RootState) => state.career || initialState;

export const selectCareer = createSelector(
  [selectSlice, selectSettings],
  enrich,
);
