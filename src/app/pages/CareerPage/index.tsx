import dayjs from 'dayjs';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MUIPaper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { DisciplineProgress } from '../../components/DisciplineProgress';
import { useMainPageSlice } from '../MainPage/slice';
import { ResetCareerDialog } from './components/ResetCareerDialog';

import { getCarClass } from 'app/data/car_classes';
import { getCar } from 'app/data/cars';
import { getAllDisciplines, getDiscipline } from 'app/data/disciplines';
import { getTrack } from 'app/data/tracks';
import { useCareerSlice } from 'app/slices/CareerSlice';
import { selectCareer } from 'app/slices/CareerSlice/selectors';
import { EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { useWelcomeSlice } from 'app/slices/WelcomeSlice';

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
          </TableRow>
        </TableHead>
        <TableBody>
          {props.career.raceResults.map((result, index) => {
            const track = getTrack(result.trackId);
            const car = getCar(result.carId);
            const carClass = getCarClass(car.carClassId);
            const discipline = getDiscipline(carClass.disciplineId);
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
