import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { useWelcomeSlice } from 'app/slices/WelcomeSlice';
import { selectWelcome } from 'app/slices/WelcomeSlice/selectors';

type Props = {
  forceShow: boolean;
  onClose?: () => void;
};

export function Welcome(props: Props) {
  const { forceShow, onClose } = props;
  const [closed, setClosed] = React.useState(false);
  const dispatch = useDispatch();
  const { actions } = useWelcomeSlice();
  const welcome = useSelector(selectWelcome);

  function handleClose() {
    setClosed(true);
    onClose?.();
  }

  return (
    <Dialog
      open={forceShow || (!closed && !welcome.hideWelcome)}
      onClose={handleClose}
    >
      <DialogTitle>
        Welcome to <code>ams2-career</code>!
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          You can find documentation for this application on{' '}
          <a href="https://github.com/abesto/ams2-career/wiki">our wiki</a>.
          Please make sure to read the section on{' '}
          <a href="https://github.com/abesto/ams2-career/wiki/Saving-Your-Progress">
            Saving Your Progress
          </a>
          ! If you have any questions, ideas, or suggestions, please check out
          the{' '}
          <a href="https://github.com/abesto/ams2-career/wiki/Issues,-Ideas,-Feature-Requests">
            Issues, Ideas, Feature Requests
          </a>{' '}
          page.
        </DialogContentText>
        <DialogContentText>Good luck and be safe!</DialogContentText>
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
