import dayjs from 'dayjs';
import saveAs from 'file-saver';
import * as React from 'react';
import { useStore } from 'react-redux';
import { serialize } from 'store/saveload';

import DownloadIcon from '@mui/icons-material/Download';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

function filename(): string {
  return dayjs().format('YYYY-MM-DD-HH-mm-ss') + '.ams2career';
}

export function Export(props: IconButtonProps) {
  const store = useStore();
  return (
    <Tooltip title="Export">
      <IconButton
        onClick={() =>
          saveAs(
            new Blob([serialize(store.getState())], {
              type: 'application/octet-stream',
            }),
            filename(),
          )
        }
        {...props}
      >
        <DownloadIcon />
      </IconButton>
    </Tooltip>
  );
}
