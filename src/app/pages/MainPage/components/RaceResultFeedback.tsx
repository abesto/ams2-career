import * as React from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';

import {
  getCarClass,
  getCarClassesAt,
  getCarClassesIn,
} from 'app/data/car_classes';
import { getDiscipline } from 'app/data/disciplines';
import { getTrack } from 'app/data/tracks';
import { EnrichedCareerData } from 'app/slices/CareerSlice/types';
import {
  formatGrade,
  formatXp,
  totalXpToProgress,
  xpGain,
  xpNeededForLevelUpTo,
} from 'app/xp';

interface Props {
  career: EnrichedCareerData;
  open: boolean;
  onClose: () => void;
}

export function RaceResultFeedback(props: Props) {
  const { open, onClose, career } = props;

  if (career.raceResults.length === 0) {
    return null;
  }

  const race = career.raceResults[career.raceResults.length - 1];
  const carClass = getCarClass(race.carClassId);
  const discipline = getDiscipline(carClass.disciplineId);
  const track = getTrack(race.trackId);

  const xpGained = xpGain(carClass.disciplineId, race);
  const after = career.progress[carClass.disciplineId];
  const before = totalXpToProgress(discipline, after.totalXp - xpGained);

  // This shares a fair amount of code with DisciplineProgress, but duplicating
  // it seems less complex than adding a bunch of conditions in what's already a
  // complex component

  const levels = getCarClassesIn(discipline)
    .map(carClass => carClass.grade)
    .filter((v, i, a) => a.indexOf(v) === i);
  levels.sort();
  levels.reverse();

  const xpToNextLevel =
    after.level === 1
      ? 0
      : xpNeededForLevelUpTo(carClass.disciplineId, after.level - 1);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        Race Results: P{race.position} {carClass.name} at {track.name}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          With this result you've gained {formatXp(xpGained)} XP in{' '}
          {discipline.name}.
          {before.level !== after.level &&
            ` Congratulations, you've advanced to Grade ${formatGrade(
              after.level,
            )} in ${discipline.name}!`}
        </DialogContentText>
        {before.level > 1 && (
          <>
            <Stepper
              sx={{ m: 1 }}
              activeStep={levels.length - before.level}
              alternativeLabel
            >
              {levels.map(level => (
                <Step
                  key={level}
                  active={level === before.level || level === after.level}
                >
                  <StepLabel icon={formatGrade(level)}>
                    {getCarClassesAt(discipline, level).map(carClass => (
                      <div key={carClass.name}>{carClass.name}</div>
                    ))}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {before.level === after.level && (
              <LinearProgress
                variant="buffer"
                value={(before.xpInLevel / xpToNextLevel) * 100}
                valueBuffer={(after.xpInLevel / xpToNextLevel) * 100}
                sx={{
                  mt: 2,
                  '& .MuiLinearProgress-dashed': { animation: 'none' },
                }}
              />
            )}
            {before.level !== after.level && (
              <LinearProgress
                variant="determinate"
                value={(after.xpInLevel / xpToNextLevel) * 100}
                sx={{ mt: 2 }}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
