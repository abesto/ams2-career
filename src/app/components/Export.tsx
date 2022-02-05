import dayjs from 'dayjs';
import saveAs from 'file-saver';
import * as React from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { serialize } from 'store/saveload';

import DownloadIcon from '@mui/icons-material/Download';
import Badge from '@mui/material/Badge';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useExportReminderSlice } from './ExportReminder/slice';
import { selectRacesSinceLastExport } from './ExportReminder/slice/selectors';

function filename(): string {
  return dayjs().format('YYYY-MM-DD-HH-mm-ss') + '.ams2career';
}

export function Export(props: IconButtonProps) {
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
            new Blob([serialize(store.getState())], {
              type: 'application/octet-stream',
            }),
            filename(),
          );
        }}
        {...props}
      >
        <Badge badgeContent={racesSinceLastExport} max={10} color="info">
          <DownloadIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
