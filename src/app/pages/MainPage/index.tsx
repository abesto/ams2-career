import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GoRacing } from './components/GoRacing';
import { RaceOptions } from './components/RaceOptions';
import { useMainPageSlice } from './slice';
import {
  selectCurrentCarId,
  selectMainPage,
  selectSelectedRace,
} from './slice/selectors';

import { useCareerSlice } from 'app/slice';
import { selectCareer } from 'app/slice/selectors';
import { CarId } from 'types/Car';
import { RaceResult } from 'types/Race';

interface Props {}

export function MainPage(props: Props) {
  useCareerSlice();
  const { actions: mainPageActions } = useMainPageSlice();
  const { actions: careerActions } = useCareerSlice();

  const dispatch = useDispatch();
  const career = useSelector(selectCareer);
  const slice = useSelector(selectMainPage);
  const selectedRace = useSelector(selectSelectedRace);
  const currentCarId = useSelector(selectCurrentCarId);

  if (slice.raceOptions.length === 0) {
    dispatch(mainPageActions.generateRaces({ career }));
  }

  function recordResult(carId: CarId, position: number) {
    const raceResult: RaceResult = {
      ...selectedRace!,
      position,
      carId,
      racedAt: new Date().getTime(),
    };
    dispatch(careerActions.recordRaceResult({ raceResult }));
    dispatch(mainPageActions.reset());
  }

  return (
    <>
      <Helmet>
        <title>Go Race!</title>
      </Helmet>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <GridItem>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Pick a Race
            </Typography>
            <RaceOptions
              races={slice.raceOptions}
              onSelect={index => dispatch(mainPageActions.selectRace(index))}
              selectedRaceIndex={slice.selectedRaceIndex}
            />
          </GridItem>
        </Grid>
        <Grid item xs={12} lg={6}>
          <GridItem>
            {selectedRace !== null && (
              <>
                <Typography variant="h4" sx={{ mt: 3 }}>
                  Go Racing!
                </Typography>
                <GoRacing
                  race={selectedRace!}
                  career={career}
                  currentCarId={currentCarId!}
                  onRecord={position => recordResult(currentCarId!, position)}
                  onCarSelect={carId =>
                    dispatch(
                      mainPageActions.selectCar({
                        carClassId: selectedRace!.carClassId,
                        carId,
                      }),
                    )
                  }
                />
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
