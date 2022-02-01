import { classesAt, classesIn } from 'app/data/car_classes';
import { DISCIPLINES } from 'app/data/disciplines';
import { useCareerSlice } from 'app/slice';
import { selectCareer } from 'app/slice/selectors';
import { DisciplineProgress, maxLevel, xpNeededForLevelUpTo } from 'app/xp';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Discipline } from 'types/Discipline';
import { RaceResult } from 'types/Race';

import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';

import { GoRacing } from './components/GoRacing';
import { RaceOptions } from './components/RaceOptions';
import { useMainPageSlice } from './slice';
import { selectMainPage, selectSelectedRace } from './slice/selectors';

interface Props {}

function Xp(props: { discipline: Discipline; progress: DisciplineProgress }) {
  const { discipline, progress } = props;
  if (maxLevel(discipline) === 0) {
    return null;
  }

  const xpToNextLevel = xpNeededForLevelUpTo(progress.level + 1);

  const levels = classesIn(discipline)
    .map(carClass => carClass.level)
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6">{discipline.name}</Typography>
      <Stepper sx={{ m: 1 }} activeStep={progress.level - 1}>
        {levels.map(level => (
          <Step key={level}>
            <StepLabel>
              {classesAt(discipline, level).map(carClass => (
                <div key={carClass.name}>{carClass.name}</div>
              ))}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <LinearProgress
        variant="determinate"
        value={(progress.xpInLevel / xpToNextLevel) * 100}
        sx={{ mt: 2 }}
      />
      <Typography variant="body2">{`${progress.xpInLevel} / ${xpToNextLevel} XP to next category`}</Typography>
    </Box>
  );
}

export function MainPage(props: Props) {
  useCareerSlice();
  const { actions: mainPageActions } = useMainPageSlice();
  const { actions: careerActions } = useCareerSlice();

  const dispatch = useDispatch();
  const career = useSelector(selectCareer);
  const slice = useSelector(selectMainPage);
  const selectedRace = useSelector(selectSelectedRace);

  function generateRaces() {
    const levels: { [key: string]: number } = {};
    for (const [discipline, xp] of career.progress) {
      levels[discipline.name] = xp.level;
    }
    dispatch(mainPageActions.generateRaces({ levels }));
  }

  function recordResult(position: number) {
    const raceResult: RaceResult = {
      ...selectedRace!,
      position,
      racedAt: new Date().getTime(),
    };
    dispatch(careerActions.recordRaceResult({ raceResult }));
    dispatch(mainPageActions.reset());
  }

  // TODO move these out into components; here for fast prototyping
  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <GridItem>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Career Progress
            </Typography>
            {DISCIPLINES.map(discipline => (
              <Xp
                key={discipline.name}
                discipline={discipline}
                progress={career.progress.get(discipline)!}
              />
            ))}
            <Button
              color="error"
              onClick={() => {
                dispatch(careerActions.resetCareer());
                dispatch(mainPageActions.reset());
              }}
            >
              Reset Career
            </Button>
          </GridItem>
        </Grid>

        <Grid item xs={12} lg={8}>
          <GridItem>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Pick a Race
            </Typography>
            <RaceOptions
              races={slice.raceOptions}
              onSelect={index => dispatch(mainPageActions.selectRace(index))}
              selectedRaceIndex={slice.selectedRaceIndex}
            />
            <Button onClick={generateRaces}>Generate Race Options</Button>
            {selectedRace !== null && (
              <>
                <Typography variant="h4" sx={{ mt: 3 }}>
                  Go Racing!
                </Typography>
                <GoRacing race={selectedRace!} onRecord={recordResult} />
              </>
            )}
          </GridItem>
        </Grid>
      </Grid>
    </>
  );
}

const GridItem = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
}));
