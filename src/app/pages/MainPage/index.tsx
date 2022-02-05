import { getCarClassesAt, getCarClassesIn } from 'app/data/car_classes';
import { getAllDisciplines } from 'app/data/disciplines';
import { pluralWithNumber } from 'app/plural';
import { useCareerSlice } from 'app/slice';
import { selectCareer } from 'app/slice/selectors';
import { aiLevel, EnrichedCareerData } from 'app/slice/types';
import { maxLevel, xpNeededForLevelUpTo } from 'app/xp';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Discipline, disciplineEquals } from 'types/Discipline';
import { getDisciplineOfRace, RaceResult } from 'types/Race';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GoRacing } from './components/GoRacing';
import { RaceOptions } from './components/RaceOptions';
import { ResetCareerDialog } from './components/ResetCareerDialog';
import { useMainPageSlice } from './slice';
import { selectMainPage, selectSelectedRace } from './slice/selectors';

interface Props {}

const ChipArrayListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

function ChipArray(props: { strings: string[] }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'left',
        flexWrap: 'wrap',
        listStyle: 'none',
        p: 0.5,
        m: 0,
      }}
      component="ul"
    >
      {props.strings.map((s, i) => (
        <ChipArrayListItem key={i}>
          <Chip label={s} />
        </ChipArrayListItem>
      ))}
    </Box>
  );
}

function DisciplineProgressDisplay(props: {
  discipline: Discipline;
  career: EnrichedCareerData;
}) {
  const { discipline, career } = props;
  const progress = career.progress[discipline.name];
  const races = career.raceResults.filter(r =>
    disciplineEquals(getDisciplineOfRace(r), discipline),
  );

  if (maxLevel(discipline) === 0) {
    return null;
  }

  const xpToNextLevel = xpNeededForLevelUpTo(progress.level + 1);

  const levels = getCarClassesIn(discipline)
    .map(carClass => carClass.level)
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <Paper sx={{ my: 2, p: 2 }}>
      <Typography variant="h6">{discipline.name}</Typography>

      <ChipArray
        strings={[
          `${races.length} starts`,
          pluralWithNumber(races.filter(r => r.position === 1).length, 'win'),
          pluralWithNumber(races.filter(r => r.position <= 3).length, 'podium'),
          `Average position: ${
            Math.round(
              (races.map(r => r.position).reduce((a, b) => a + b, 0) /
                races.length) *
                10,
            ) / 10 || 'N/A'
          }`,
          `AI Strength: ${aiLevel(career, discipline)}`,
        ]}
      />

      <Stepper sx={{ m: 1 }} activeStep={progress.level - 1}>
        {levels.map(level => (
          <Step key={level}>
            <StepLabel>
              {getCarClassesAt(discipline, level).map(carClass => (
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
    </Paper>
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

  const [resetDialogOpen, openResetDialog] = React.useState(false);

  function generateRaces() {
    const levels: { [key: string]: number } = {};
    for (const [disciplineName, xp] of Object.entries(career.progress)) {
      levels[disciplineName] = xp.level;
    }
    dispatch(mainPageActions.generateRaces({ career }));
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
            {getAllDisciplines().map(discipline => (
              <DisciplineProgressDisplay
                key={discipline.name}
                discipline={discipline}
                career={career}
              />
            ))}
            <Button color="error" onClick={() => openResetDialog(true)}>
              Reset Career
            </Button>
            <ResetCareerDialog
              open={resetDialogOpen}
              onClose={() => openResetDialog(false)}
              onReset={() => {
                dispatch(careerActions.resetCareer());
                dispatch(mainPageActions.reset());
              }}
            />
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
