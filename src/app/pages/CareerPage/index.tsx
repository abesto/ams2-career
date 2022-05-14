import dayjs from 'dayjs';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { matchP } from 'ts-adt';

import {
  Box,
  Button,
  Grid,
  Paper as MUIPaper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import { DisciplineProgress } from '../../components/DisciplineProgress';
import { useMainPageSlice } from '../MainPage/slice';
import { ResetCareerDialog } from './components/ResetCareerDialog';

import { AchievementIcon } from 'app/components/AchievementIcon';
import { getCarClass } from 'app/data/car_classes';
import { getCar } from 'app/data/cars';
import { getAllDisciplines, getDiscipline } from 'app/data/disciplines';
import { getTrack } from 'app/data/tracks';
import { useCareerSlice } from 'app/slices/CareerSlice';
import { Achievement } from 'app/slices/CareerSlice/achievements';
import { selectCareer } from 'app/slices/CareerSlice/selectors';
import { EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { useWelcomeSlice } from 'app/slices/WelcomeSlice';
import { formatGrade } from 'app/xp';

interface Props {}

const Paper = styled(MUIPaper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
}));

function DisciplineProgressGrid(props: { career: EnrichedCareerData }) {
  return (
    <Grid item container spacing={1}>
      {getAllDisciplines().map(discipline => (
        <Grid item xs={12} lg={4} key={discipline.name}>
          <Paper>
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
    <Grid container spacing={2} justifyContent="space-around">
      {achievements.map(achievement => (
        <Grid item sx={{ textAlign: 'center' }} key={achievement.name}>
          <Paper sx={{ backgroundColor: '#fafafa' }}>
            <AchievementIcon
              level={achievement.level}
              unlocked={achievement.unlocked}
              fontSize="large"
            />
            <Typography
              variant="h6"
              sx={{ color: achievement.unlocked ? 'black' : 'gray' }}
            >
              {achievement.name}
            </Typography>
            <Typography variant="body2">{achievement.description}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

function AchievementUnlocked(props: { achievement: Achievement }) {
  const { achievement } = props;
  return (
    <Tooltip title={achievement.description}>
      <Box
        sx={{ borderBottom: 'dotted 2px gray', cursor: 'pointer' }}
        component="span"
      >
        {achievement.name}
      </Box>
    </Tooltip>
  );
}

function Logbook(props: { career: EnrichedCareerData }) {
  return (
    <TableContainer>
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
          {props.career.raceResults.map((result, index) => {
            const track = getTrack(result.trackId);
            const car = getCar(result.carId);
            const carClass = getCarClass(car.carClassId);
            const discipline = getDiscipline(carClass.disciplineId);
            const outcomes = props.career.outcomes[index];
            return (
              <TableRow key={index} hover={true}>
                <TableCell>
                  {dayjs(result.racedAt).format('YYYY-MM-DD HH:mm')}
                </TableCell>
                <TableCell>
                  {dayjs(result.simTime).format('YYYY-MM-DD HH:mm')}
                </TableCell>
                <TableCell>{result.position}</TableCell>
                <TableCell>{result.aiLevel}</TableCell>
                <TableCell>{discipline.name}</TableCell>
                <TableCell>{carClass.name}</TableCell>
                <TableCell>{car.name}</TableCell>
                <TableCell>{track.name}</TableCell>
                <TableCell>{track.configuration}</TableCell>
                <TableCell>
                  {outcomes
                    .map(
                      matchP(
                        {
                          GradeUp: o => (
                            <Box>
                              {o.disciplineId} leveled up to grade{' '}
                              {formatGrade(o.newGrade)}
                            </Box>
                          ),
                          AchievementUnlocked: achievement => (
                            <AchievementUnlocked achievement={achievement} />
                          ),
                        },
                        () => null,
                      ),
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

  return (
    <>
      <Helmet>
        <title>Career</title>
      </Helmet>

      <Paper>
        <Typography variant="h4" sx={{ my: 2 }}>
          Achievements
        </Typography>
        <Achievements achievements={career.achievements} />
      </Paper>

      <Paper sx={{ my: 5 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Career Progress
        </Typography>
        <DisciplineProgressGrid career={career} />
        <ResetCareer
          onReset={() => {
            dispatch(careerActions.resetCareer());
            dispatch(mainPageActions.reset());
            dispatch(welcomeActions.show());
          }}
        />
      </Paper>

      <Typography variant="h4" sx={{ my: 2 }}>
        Logbook
      </Typography>
      <Logbook career={career} />
    </>
  );
}
