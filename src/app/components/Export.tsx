import dayjs from 'dayjs';
import saveAs from 'file-saver';
import * as React from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { serialize } from 'store/saveload';

import { Download as DownloadIcon } from '@mui/icons-material';
import { Badge, IconButton, IconButtonProps, Tooltip } from '@mui/material';

import { RootState } from '../../types';
import { useExportReminderSlice } from './ExportReminder/slice';
import { selectRacesSinceLastExport } from './ExportReminder/slice/selectors';

function filename(): string {
  return dayjs().format('YYYY-MM-DD-HH-mm-ss') + '.ams2career';
}

interface Props {
  hideBadge?: boolean;
}

export function Export({
  hideBadge,
  ...iconButtonProps
}: IconButtonProps & Props) {
  const store = useStore();
  const { actions: exportReminderActions } = useExportReminderSlice();
  const racesSinceLastExport = useSelector(selectRacesSinceLastExport);
  const dispatch = useDispatch();

  return (
    <Tooltip title="Export">
      <IconButton
        onClick={() => {
          dispatch(exportReminderActions.recordExport());
          saveAs(
            new Blob([serialize(store.getState() as RootState)], {
              type: 'application/octet-stream',
            }),
            filename(),
          );
        }}
        {...iconButtonProps}
      >
        {hideBadge ? (
          <DownloadIcon />
        ) : (
          <Badge badgeContent={racesSinceLastExport} max={10} color="info">
            <DownloadIcon />
          </Badge>
        )}
      </IconButton>
    </Tooltip>
  );
}
