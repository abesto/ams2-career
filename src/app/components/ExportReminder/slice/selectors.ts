import { createSelector } from '@reduxjs/toolkit';

import initialState from './initialState';

import { selectCareer } from 'app/slices/CareerSlice/selectors';
import { RootState } from 'types';

const selectSlice = (state: RootState) => state.exportReminder || initialState;

export const selectExportReminder = createSelector(
  [selectSlice],
  state => state,
  { devModeChecks: { identityFunctionCheck: 'never' } },
);

export const selectRacesSinceLastExport = createSelector(
  [selectExportReminder, selectCareer],
  (reminder, career) => {
    if (!reminder.lastExport) {
      return career.raceResults.length;
    }
    return career.raceResults.filter(r => r.racedAt > reminder.lastExport!)
      .length;
  },
);
