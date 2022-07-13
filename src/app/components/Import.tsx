import * as React from 'react';
import { useStore } from 'react-redux';
import { backup, loadStr } from 'store/saveload';

import { Upload as UploadIcon } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  IconButtonProps,
  Tooltip,
} from '@mui/material';

import { Export } from './Export';

export function Import(props: IconButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | undefined>();
  const store = useStore();

  function handleClose() {
    setOpen(false);
  }

  function handleLoad() {
    if (file === undefined) {
      alert('No file selected');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      backup('import');
      const data = loadStr(reader.result as string, true);
      if (data === undefined) {
        alert('Invalid file');
        return;
      }
      store.dispatch({
        type: 'LOAD',
        payload: data,
      });
      handleClose();
    };
    reader.readAsText(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0]);
  }

  return (
    <>
      <Tooltip title="Import">
        <IconButton onClick={() => setOpen(true)} {...props}>
          <UploadIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Import Career</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Click the button below or drag and drop a file to load a previously
            downloaded career. Watch out: this will overwrite your current
            career, and it will be lost! You may want to download your current
            career first:
            <Export />
          </DialogContentText>
          <input type="file" onChange={handleFileSelect} accept=".ams2career" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleLoad}>
            Load
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
