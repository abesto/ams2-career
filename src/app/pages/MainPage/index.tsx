import { RaceOptions } from 'app/components/RaceOptions';
import { classesAt, classesIn } from 'app/data/car_classes';
import { DISCIPLINES } from 'app/data/disciplines';
import { useCareerSlice } from 'app/slice';
import { selectCareer } from 'app/slice/selectors';
import { DisciplineProgress, maxLevel, xpNeededForLevelUpTo } from 'app/xp';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Discipline } from 'types/Discipline';

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

import { useMainPageSlice } from './slice';
import { selectMainPage } from './slice/selectors';

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
      <Stepper sx={{ m: 1 }}>
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
        value={progress.xpInLevel / xpToNextLevel}
        sx={{ mt: 2 }}
      />
      <Typography variant="body2">{`${progress.xpInLevel} / ${xpToNextLevel} XP to next category`}</Typography>
    </Box>
  );
}

export function MainPage(props: Props) {
  useCareerSlice();
  const { actions } = useMainPageSlice();
  const dispatch = useDispatch();
  const career = useSelector(selectCareer);
  const slice = useSelector(selectMainPage);

  // TODO move these out into components; here for fast prototyping
  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <Grid container spacing={2}>
        <Grid item xs={4}>
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
          </GridItem>
        </Grid>

        <Grid item xs={8}>
          <GridItem>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Pick a Race
            </Typography>
            <RaceOptions races={slice.raceOptions} />
            <Button
              onClick={() => {
                const levels: { [key: string]: number } = {};
                for (const [discipline, xp] of career.progress) {
                  levels[discipline.name] = xp.level;
                }
                dispatch(actions.generateRaces({ levels }));
              }}
            >
              Regenerate Race Options
            </Button>
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
