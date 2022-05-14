import * as React from 'react';
import { refinement } from 'ts-adt';

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

import { AchievementIcon } from 'app/components/AchievementIcon';
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

  const raceIndex = career.raceResults.length - 1;
  const race = career.raceResults[raceIndex];
  const carClass = getCarClass(race.carClassId);
  const disciplineId = carClass.disciplineId;
  const discipline = getDiscipline(disciplineId);
  const track = getTrack(race.trackId);

  const outcomes = career.outcomes[raceIndex];
  const xpGains = outcomes.filter(refinement('XpGain'));
  const mainXpGained =
    xpGains.find(g => g.disciplineId === disciplineId)?.amount ?? 0;
  const otherXpGains = xpGains.filter(
    g => g.disciplineId !== disciplineId && formatXp(g.amount) > 0,
  );

  const gradeUps = outcomes.filter(refinement('GradeUp'));
  const mainGradeUp = gradeUps.find(g => g.disciplineId === disciplineId);
  const otherGradeUps = gradeUps.filter(g => g.disciplineId !== disciplineId);

  const after = career.progress[disciplineId];
  const before = totalXpToProgress(discipline, after.totalXp - mainXpGained);

  const achievements = outcomes.filter(refinement('AchievementUnlocked'));

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
        {achievements.map(achievement => (
          <DialogContentText key={achievement.name}>
            <AchievementIcon level={achievement.level} unlocked={true} />{' '}
            <strong>{achievement.name}</strong>: {achievement.description}
          </DialogContentText>
        ))}
        <DialogContentText>
          With this result you've gained {formatXp(mainXpGained)} XP in{' '}
          {discipline.name}.
        </DialogContentText>
        {mainGradeUp && (
          <DialogContentText>
            Congratulations, you've advanced to Grade{' '}
            {formatGrade(mainGradeUp.newGrade)} in{' '}
            {getDiscipline(mainGradeUp.disciplineId).name}!
          </DialogContentText>
        )}
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
        <DialogContentText sx={{ mt: 3 }}>
          {otherXpGains.length > 0 &&
            `Your experience carries over somewhat into other racing disciplines: you also gained ${otherXpGains
              .map(
                g =>
                  `${formatXp(g.amount)} XP in ${
                    getDiscipline(g.disciplineId).name
                  }`,
              )
              .join(', ')}`}
          .
        </DialogContentText>
        {otherGradeUps.map((gradeUp, i) => (
          <DialogContentText key={i}>
            Congratulations, you've advanced to Grade{' '}
            {formatGrade(gradeUp.newGrade)} in{' '}
            {getDiscipline(gradeUp.disciplineId).name}!
          </DialogContentText>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
