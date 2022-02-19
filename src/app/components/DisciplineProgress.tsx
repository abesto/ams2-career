import * as React from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';

import { ChipArray } from 'app/components/ChipArray';
import { getCarClassesAt, getCarClassesIn } from 'app/data/car_classes';
import { pluralWithNumber } from 'app/plural';
import { aiLevel, EnrichedCareerData } from 'app/slice/types';
import { maxLevel, xpNeededForLevelUpTo } from 'app/xp';
import { Discipline, disciplineEquals } from 'types/Discipline';
import { getDisciplineOfRace } from 'types/Race';

interface Props {
  discipline: Discipline;
  career: EnrichedCareerData;
}

export function DisciplineProgress(props: Props) {
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
    <>
      <Typography variant="h6" component="span">
        {discipline.name}
      </Typography>

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
    </>
  );
}
