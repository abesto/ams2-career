import { selectCareer } from 'app/slice/selectors';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { DISCIPLINES } from 'app/data/disciplines';
import { Discipline } from 'types/Discipline';
import { useCareerSlice } from 'app/slice';
import { maxLevel, xpNeededForLevelUpTo, XpProgress } from 'app/xp';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { styled } from '@mui/material';
import { classesAt, classesIn } from 'app/data/car_classes';
import { racegen } from './racegen';
import { Race } from 'types/Race';
import { RaceOptions } from 'app/components/RaceOptions';

interface Props {}

function Xp(props: { discipline: Discipline; progress: XpProgress }) {
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
  const { actions } = useCareerSlice();
  const career = useSelector(selectCareer);

  const races: Race[] = DISCIPLINES.flatMap(discipline =>
    racegen(discipline, career.progress.get(discipline)!.level),
  );

  // TODO move these out into components; here for fast prototyping
  return (
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
          <RaceOptions races={races} />
        </GridItem>
      </Grid>
    </Grid>
  );
}

const GridItem = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
}));
