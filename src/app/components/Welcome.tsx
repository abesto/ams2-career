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
import { blue } from '@mui/material/colors';

import { useWelcomeSlice } from 'app/slices/WelcomeSlice';
import { selectWelcome } from 'app/slices/WelcomeSlice/selectors';

type Props = {
  forceShow: boolean;
  onClose?: () => void;
};

const Page1 = () => (
  <>
    <DialogContentText
      sx={{
        border: 1,
        borderColor: 'info.main',
        bgcolor: blue[50],
        borderRadius: 5,
        color: 'text.primary',
        p: 3,
        mb: 3,
      }}
    >
      You can find documentation for this application on{' '}
      <a href="https://github.com/abesto/ams2-career/wiki">our wiki</a>. Please
      make sure to read the section on{' '}
      <a href="https://github.com/abesto/ams2-career/wiki/Saving-Your-Progress">
        Saving Your Progress
      </a>
      ! If you have any questions, ideas, or suggestions, please check out the{' '}
      <a href="https://github.com/abesto/ams2-career/wiki/Issues,-Ideas,-Feature-Requests">
        Issues, Ideas, Feature Requests
      </a>{' '}
      page. You can view this message later by clicking the help icon in the top
      right.
    </DialogContentText>

    <DialogContentText sx={{ mb: 1 }}>
      On the <strong>Go Racing</strong> tab, you can review your list of
      potential offers. While you start at the lowest levels of each motorsports
      discipline, you gain XP for each race in which you participate.
    </DialogContentText>

    <DialogContentText sx={{ mb: 1 }}>
      The right of the dashboard will display your current progress in the
      selected discipline as well as the suggested settings to be used in the
      race.
    </DialogContentText>

    <DialogContentText sx={{ mb: 1 }}>
      A note on the <strong>AI strength</strong>: one of the goals of this
      simulator is ensuring that you have fun and competitive races. You do not
      need to win every race at 101 AI level to progress! If you find you need
      to bump the AI up (or down) to get a fair challenge, then you can log
      those adjustments into the simulator to ensure that future races are
      better calibrated. You can apportion that increase (or decrease) to ALL
      cars, one DISCIPLINE, one CLASS, or one CAR, whichever you think best
      represents the AI balancing needed.
    </DialogContentText>

    <DialogContentText>
      Also note that the simulator will compare your result to the AI level and
      adjust it for further balancing in that car. These adjustments are per
      car, so use the "Global" adjustment to have future offers reflect a better
      starting AI level.
    </DialogContentText>
  </>
);

const Page2 = () => (
  <>
    <DialogContentText sx={{ mb: 1 }}>
      When the race has been completed and the champagne (or tears) has dried
      from your overalls, enter the car your drove and the result achieved.
    </DialogContentText>
    <DialogContentText sx={{ mb: 1 }}>
      The model will analyze your performance and the car in which it was
      achieved and will calculate and apply XP points across all disciplines
      (but most prominently in the discipline raced).
    </DialogContentText>
    <DialogContentText sx={{ mb: 1 }}>
      The Career tab will display your statistics and progress across all
      disciplines, as well as a full race log for reference.
    </DialogContentText>
    <DialogContentText sx={{ mb: 1 }}>
      Also, you can export your career save to protect it against accidental
      loss. Or to transport to another computer, browser, or device (did we
      mention this works on tablets and phones!?).
    </DialogContentText>
    <DialogContentText sx={{ mb: 1 }}>
      Pro tip: Don't forget to take advantage of AMS2's brilliant weather and
      day/night progression system by altering the session conditions in game.
    </DialogContentText>
    <DialogContentText>Good luck and be safe!</DialogContentText>
  </>
);

export function Welcome(props: Props) {
  const { forceShow, onClose } = props;
  const [page, setPage] = React.useState(0);
  const [closed, setClosed] = React.useState(false);
  const dispatch = useDispatch();
  const { actions } = useWelcomeSlice();
  const welcome = useSelector(selectWelcome);

  const pages = [Page1, Page2];
  const Page = pages[page];

  function handleClose() {
    setClosed(true);
    onClose?.();
  }

  const open = forceShow || (!closed && !welcome.hideWelcome);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      onTransitionEnd={() => open || setPage(0)}
    >
      <DialogTitle>
        Welcome to the Automobilista 2 Career Simulator!
      </DialogTitle>
      <DialogContent>
        <Page />
        <DialogActions>
          {page > 0 && (
            <Button onClick={() => setPage(page - 1)} variant="text">
              Back
            </Button>
          )}
          {page < pages.length - 1 && (
            <Button onClick={() => setPage(page + 1)} variant="outlined">
              Next
            </Button>
          )}
          {page === pages.length - 1 && (
            <>
              <Button
                onClick={() => dispatch(actions.hide())}
                color="error"
                variant="text"
              >
                Don't show again
              </Button>
              <Button onClick={handleClose} variant="outlined">
                Got it!
              </Button>
            </>
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
