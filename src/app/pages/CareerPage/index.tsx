import dayjs from 'dayjs';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  matchExhaustive,
  matchWildcard,
  WILDCARD,
} from '@practical-fp/union-types';

import { DisciplineProgress } from '../../components/DisciplineProgress';
import { useMainPageSlice } from '../MainPage/slice';
import { ResetCareerDialog } from './components/ResetCareerDialog';

import { AchievementIcon } from 'app/components/AchievementIcon';
import { LinearProgressWithLabel } from 'app/components/LinearProgressWithLabel';
import { getCarClass } from 'app/data/car_classes';
import { getCar } from 'app/data/cars';
import { getAllDisciplines, getDiscipline } from 'app/data/disciplines';
import { getTrack } from 'app/data/tracks';
import { useCareerSlice } from 'app/slices/CareerSlice';
import { Achievement, isUnlocked } from 'app/slices/CareerSlice/achievements';
import { selectCareer } from 'app/slices/CareerSlice/selectors';
import { EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { useWelcomeSlice } from 'app/slices/WelcomeSlice';
import { formatGrade } from 'app/xp';

function formatTimestamp(ts: number): string {
  return dayjs(ts).format('YYYY-MM-DD HH:mm');
}

interface Props {}

function DisciplineProgressGrid(props: { career: EnrichedCareerData }) {
  return (
    <Grid container spacing={2}>
      {getAllDisciplines().map(discipline => (
        <Grid size={{ xs: 12, lg: 4 }} key={discipline.name}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <DisciplineProgress discipline={discipline} career={props.career} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

function ResetCareer(props: { onReset: () => void }) {
  const [resetDialogOpen, openResetDialog] = React.useState(false);

  return (
    <>
      <Button color="error" onClick={() => openResetDialog(true)}>
        Reset Career
      </Button>
      <ResetCareerDialog
        open={resetDialogOpen}
        onClose={() => openResetDialog(false)}
        onReset={props.onReset}
      />
    </>
  );
}

function Achievements(props: { achievements: Achievement[] }) {
  const { achievements } = props;
  return (
    <Grid container spacing={2} sx={{ justifyContent: 'space-around' }}>
      {achievements.map(achievement => (
        <Grid size="auto" sx={{ textAlign: 'center' }} key={achievement.name}>
          <Paper sx={{ backgroundColor: '#fafafa', p: 2, width: 250 }}>
            <AchievementIcon
              level={achievement.level}
              unlocked={isUnlocked(achievement)}
              fontSize="large"
            />
            <Typography
              variant="subtitle1"
              sx={{ color: isUnlocked(achievement) ? 'black' : 'gray' }}
            >
              {achievement.name}
            </Typography>
            <Typography variant="body2">{achievement.description}</Typography>
            {matchExhaustive(achievement.progress, {
              Unlocked: ({ timestamp }) => (
                <em>Unlocked: {formatTimestamp(timestamp)}</em>
              ),
              Progress: ({ current, max, formattedCurrent, formattedMax }) => (
                <LinearProgressWithLabel
                  max={max}
                  current={current}
                  label={`${formattedCurrent ?? current} / ${
                    formattedMax ?? max
                  }`}
                />
              ),
            })}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

function AchievementUnlocked(props: { achievement: Achievement }) {
  const { achievement } = props;
  return (
    <Box component="span">
      <AchievementIcon level={achievement.level} unlocked={true} />
      <strong>{achievement.name}</strong>: {achievement.description}
    </Box>
  );
}

function Logbook(props: { career: EnrichedCareerData }) {
  const entries = props.career.raceResults
    .map((result, index) => ({
      result,
      outcomes: props.career.outcomes[index],
    }))
    .reverse();
  return (
    <TableContainer sx={{ borderTop: 1, borderColor: 'divider' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Raced At</TableCell>
            <TableCell>Sim Time</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>AI Strength</TableCell>
            <TableCell>Discipline</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Car</TableCell>
            <TableCell>Track</TableCell>
            <TableCell>Configuration</TableCell>
            <TableCell>Milestones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map(({ result, outcomes }, index) => {
            const track = getTrack(result.trackId);
            const car = getCar(result.carId);
            const carClass = getCarClass(car.carClassId);
            const discipline = getDiscipline(carClass.disciplineId);
            return (
              <TableRow key={index} hover={true}>
                <TableCell>{formatTimestamp(result.racedAt)}</TableCell>
                <TableCell>{formatTimestamp(result.simTime)}</TableCell>
                <TableCell>{result.position}</TableCell>
                <TableCell>{result.aiLevel}</TableCell>
                <TableCell>{discipline.name}</TableCell>
                <TableCell>{carClass.name}</TableCell>
                <TableCell>{car.name}</TableCell>
                <TableCell>{track.name}</TableCell>
                <TableCell>{track.configuration}</TableCell>
                <TableCell>
                  {outcomes
                    .map(o =>
                      matchWildcard(o, {
                        GradeUp: o => (
                          <Box>
                            {o.disciplineId} leveled up to{' '}
                            {formatGrade(o.newGrade, true)}
                          </Box>
                        ),
                        AchievementUnlocked: achievement => (
                          <AchievementUnlocked achievement={achievement} />
                        ),
                        [WILDCARD]: () => null,
                      }),
                    )
                    .filter(x => x !== null)
                    .map((x, i) => (
                      <Box key={i}>{x}</Box>
                    ))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function CareerPage(props: Props) {
  const dispatch = useDispatch();
  const career = useSelector(selectCareer);
  const { actions: mainPageActions } = useMainPageSlice();
  const { actions: careerActions } = useCareerSlice();
  const { actions: welcomeActions } = useWelcomeSlice();
  const wins = career.raceResults.filter(r => r.position === 1).length;
  const podiums = career.raceResults.filter(r => r.position <= 3).length;

  return (
    <>
      <Helmet>
        <title>Career</title>
      </Helmet>

      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Career
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Track your progress, unlocked achievements, and complete race
            history across every discipline.
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Chip label={`${career.raceResults.length} starts`} />
            <Chip label={`${wins} wins`} />
            <Chip label={`${podiums} podiums`} />
          </Stack>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Achievements
          </Typography>
          <Achievements achievements={career.achievements} />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { sm: 'center' },
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                Career progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Promotion tracks and current standing in each discipline.
              </Typography>
            </Box>
            <ResetCareer
              onReset={() => {
                dispatch(careerActions.resetCareer());
                dispatch(mainPageActions.reset());
                dispatch(welcomeActions.show());
              }}
            />
          </Stack>
          <DisciplineProgressGrid career={career} />
        </Paper>

        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Logbook
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Full record of completed races, milestones, and discipline
              progression.
            </Typography>
          </Box>
          <Logbook career={career} />
        </Paper>
      </Stack>
    </>
  );
}
