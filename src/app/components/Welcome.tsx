import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import { useWelcomeSlice } from 'app/slices/WelcomeSlice';
import { selectWelcome } from 'app/slices/WelcomeSlice/selectors';

export function Welcome() {
  const [closed, setClosed] = React.useState(false);
  const dispatch = useDispatch();
  const { actions } = useWelcomeSlice();
  const welcome = useSelector(selectWelcome);

  function handleClose() {
    setClosed(true);
  }

  return (
    <Dialog open={!closed && !welcome.hideWelcome} onClose={handleClose}>
      <DialogTitle>
        Welcome to <code>ams2-career</code>!
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography variant="body1">
            You can find documentation for this application on{' '}
            <a href="https://github.com/abesto/ams2-career/wiki">our wiki</a>.
            Please make sure to read the section on{' '}
            <a href="https://github.com/abesto/ams2-career/wiki/Saving-Your-Progress">
              Saving Your Progress
            </a>
            !
          </Typography>
          <Typography variant="body1">
            If you have any questions, ideas, or suggestions, please check out
            the{' '}
            <a href="https://github.com/abesto/ams2-career/wiki/Issues,-Ideas,-Feature-Requests">
              Issues, Ideas, Feature Requests
            </a>{' '}
            page.
          </Typography>
        </DialogContentText>
        <DialogActions>
          <Button onClick={handleClose}>Got it!</Button>
          <Button onClick={() => dispatch(actions.hide())}>
            Don't show again
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
