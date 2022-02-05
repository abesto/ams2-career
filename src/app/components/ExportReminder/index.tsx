import { pluralWithNumber } from 'app/plural';
import * as React from 'react';
import { Beforeunload } from 'react-beforeunload';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';

import { Export } from '../Export';
import { useExportReminderSlice } from './slice';
import {
  selectExportReminder,
  selectRacesSinceLastExport,
} from './slice/selectors';

interface Props {}

export function ExportReminder(props: Props) {
  const racesSinceLastExport = useSelector(selectRacesSinceLastExport);
  const state = useSelector(selectExportReminder);
  const { actions } = useExportReminderSlice();
  const dispatch = useDispatch();

  return (
    <Beforeunload
      onBeforeunload={() =>
        racesSinceLastExport > 0
          ? `You recorded ${pluralWithNumber(
              racesSinceLastExport,
              'race',
            )} since the last time you exported your career. Are you sure you want to leave before grabbing a fresh export?`
          : null
      }
    >
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={racesSinceLastExport > 0 && !state.hideAlertForever}
      >
        <SnackbarContent
          message={
            <Box>
              <Export hideBadge color="inherit" />
              {pluralWithNumber(racesSinceLastExport, 'race')} recorded since
              the last time you exported your career.
            </Box>
          }
          action={
            <Button
              variant="text"
              onClick={() => dispatch(actions.hideAlertForever())}
            >
              Never show again
            </Button>
          }
        />
      </Snackbar>
    </Beforeunload>
  );
}
