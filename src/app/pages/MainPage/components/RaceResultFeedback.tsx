import * as React from 'react';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';

import { AchievementIcon } from 'app/components/AchievementIcon';
import {
  getCarClass,
  getCarClassesAt,
  getCarClassesIn,
} from 'app/data/car_classes';
import { getDiscipline } from 'app/data/disciplines';
import { getTrack } from 'app/data/tracks';
import {
  AchievementUnlocked,
  EnrichedCareerData,
  GradeUp,
  XpGain,
} from 'app/slices/CareerSlice/types';
import {
  formatGrade,
  formatXp,
  totalXpToProgress,
  xpNeededForLevelUpTo,
} from 'app/xp';
import { DisciplineId } from 'types/Discipline';

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
  const xpGains = outcomes.filter(XpGain.is).map(x => x.value);
  const mainXpGained =
    xpGains.find(g => g.disciplineId === disciplineId)?.amount ?? 0;
  const otherXpGains = xpGains.filter(
    g => g.disciplineId !== disciplineId && formatXp(g.amount) > 0,
  );

  const gradeUps = outcomes.filter(GradeUp.is).map(x => x.value);
  const mainGradeUp = gradeUps.find(g => g.disciplineId === disciplineId);
  const otherGradeUps = gradeUps.filter(g => g.disciplineId !== disciplineId);

  const after = career.progress[disciplineId];
  const before = totalXpToProgress(discipline, after.totalXp - mainXpGained);

  const achievements = outcomes
    .filter(AchievementUnlocked.is)
    .map(x => x.value);

  // This shares a fair amount of code with DisciplineProgress, but duplicating
  // it seems less complex than adding a bunch of conditions in what's already a
  // complex component

  const levels = getCarClassesIn(discipline)
    .map(carClass => carClass.grade)
    .filter((v, i, a) => a.indexOf(v) === i);
  levels.sort();
  levels.reverse();

  const xpToNextLevel =
    after.level === 0
      ? 0
      : xpNeededForLevelUpTo(carClass.disciplineId, after.level - 1);

  const gradeUpMessage = (
    gradeUp:
      | {
          disciplineId: DisciplineId;
          newGrade: number;
        }
      | undefined,
  ) => {
    if (!gradeUp) {
      return null;
    }
    const name = getDiscipline(gradeUp.disciplineId).name;
    if (gradeUp.newGrade === 0) {
      return `Congratulations, you've mastered ${name}!`;
    }
    return `Congratulations, you've advanced to ${formatGrade(
      gradeUp.newGrade,
      true,
    )} in ${name}!`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Race Results: P{race.position}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'grey.50',
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              {carClass.name} at {track.name}
            </Typography>
            <Typography color="text.secondary">
              {track.configuration ?? 'Standard'} configuration
            </Typography>
          </Box>

          {achievements.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Unlocked this race
              </Typography>
              <Stack spacing={1}>
                {achievements.map(achievement => (
                  <Box
                    key={achievement.name}
                    sx={{
                      display: 'flex',
                      gap: 1.25,
                      alignItems: 'flex-start',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1.25,
                    }}
                  >
                    <AchievementIcon
                      level={achievement.level}
                      unlocked={true}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {achievement.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              Discipline progress
            </Typography>
            <Typography color="text.secondary">
              You gained {formatXp(mainXpGained)} XP in {discipline.name}.
            </Typography>
          </Box>

          {mainGradeUp && (
            <Typography sx={{ fontWeight: 600 }}>
              {gradeUpMessage(mainGradeUp)}
            </Typography>
          )}
          {before.level > 0 && (
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Stepper
                sx={{
                  mb: 2,
                  overflowX: 'auto',
                  '& .MuiStepLabel-label': {
                    fontSize: '0.78rem',
                  },
                }}
                activeStep={levels.length - before.level}
                alternativeLabel
              >
                {levels.map(level => (
                  <Step
                    key={level}
                    active={level === before.level || level === after.level}
                  >
                    <StepLabel icon={formatGrade(level, false)}>
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
            </Box>
          )}
          {(otherXpGains.length > 0 || otherGradeUps.length > 0) && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Other progress
              </Typography>
              {otherXpGains.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: 'wrap' }}
                >
                  {otherXpGains.map(g => (
                    <Chip
                      key={g.disciplineId}
                      label={`+${formatXp(g.amount)} ${getDiscipline(g.disciplineId).name}`}
                    />
                  ))}
                </Stack>
              )}
              {otherGradeUps.map((gradeUp, i) => (
                <Typography key={i} sx={{ mt: 1.5 }}>
                  {gradeUpMessage(gradeUp)}
                </Typography>
              ))}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
