import * as React from 'react';
import { useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Input from '@mui/material/Input';

import { Export } from 'app/components/Export';
import { selectRacesSinceLastExport } from 'app/components/ExportReminder/slice/selectors';
import { pluralWithNumber } from 'app/plural';

interface Props {
  onClose: () => void;
  onReset: () => void;
}

export function ResetCareerDialog(props: DialogProps & Props) {
  const racesSinceLastExport = useSelector(selectRacesSinceLastExport);
  const [verification, setVerification] = React.useState('');

  function handleVerificationChange(e) {
    setVerification(e.target.value);
  }

  function handleReset() {
    if (verification !== 'reset') {
      alert('Incorrect verification string');
      return;
    }
    props.onClose();
    props.onReset();
  }

  return (
    <Dialog {...props}>
      <DialogTitle>Reset Career</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will reset your career.{' '}
          {racesSinceLastExport > 0 ? (
            <strong>
              {pluralWithNumber(racesSinceLastExport, 'race')} recorded since
              the last time you downloaded your career. You may want to download
              it now before proceeding:
            </strong>
          ) : (
            'You may want to download your current career before proceeding:'
          )}
          <Export />
          This is a dangerous operation. Enter <strong>reset</strong> below,
          then click the "Reset" button to continue.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Input
          autoFocus
          fullWidth
          onChange={handleVerificationChange}
          sx={{ mt: 3 }}
        />
        <Button onClick={() => props.onClose()}>Cancel</Button>
        <Button color="error" onClick={() => handleReset()}>
          Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
}
