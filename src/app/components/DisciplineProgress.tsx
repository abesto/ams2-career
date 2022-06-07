import * as React from 'react';

import { Step, StepLabel, Stepper, Typography } from '@mui/material';

import { LinearProgressWithLabel } from './LinearProgressWithLabel';

import { ChipArray } from 'app/components/ChipArray';
import { getCarClassesAt, getCarClassesIn } from 'app/data/car_classes';
import { pluralWithNumber } from 'app/plural';
import { aiLevel, EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { formatGrade, formatXp, xpNeededForLevelUpTo } from 'app/xp';
import {
  Discipline,
  disciplineEquals,
  getDisciplineId,
} from 'types/Discipline';
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

  const xpToNextLevel =
    progress.level === 0
      ? 0
      : xpNeededForLevelUpTo(getDisciplineId(discipline), progress.level - 1);

  const levels = getCarClassesIn(discipline)
    .map(carClass => carClass.grade)
    .filter((v, i, a) => a.indexOf(v) === i);
  levels.sort();
  levels.reverse();

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

      <Stepper
        sx={{ m: 1 }}
        activeStep={levels.length - progress.level}
        alternativeLabel
      >
        {levels.map(level => (
          <Step key={level}>
            <StepLabel icon={formatGrade(level, false)}>
              {getCarClassesAt(discipline, level).map(carClass => (
                <div key={carClass.name}>{carClass.name}</div>
              ))}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {progress.level > 0 && (
        <LinearProgressWithLabel
          max={xpToNextLevel}
          current={progress.xpInLevel}
          label={`${formatXp(progress.xpInLevel)} / ${formatXp(
            xpToNextLevel,
          )} XP to ${formatGrade(
            levels[levels.length - progress.level + 1] || 0,
            true,
          )}`}
        />
      )}
    </>
  );
}
