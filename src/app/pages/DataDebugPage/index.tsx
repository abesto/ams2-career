import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import { Cars } from 'app/components/Cars';
import { Tracks } from 'app/components/Tracks';
import { CARS } from 'app/data/cars';
import { TRACKS } from 'app/data/tracks';
import { CarSpec } from 'types/CarSpec';
import { canRaceOn, TrackSpec } from 'types/TrackSpec';

import { useDataDebugPageSliceSlice } from './slice';
import { selectDataDebugPageSlice } from './slice/selectors';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

export function DataDebugPage() {
  const { actions } = useDataDebugPageSliceSlice();
  const dispatch = useDispatch();

  const slice = useSelector(selectDataDebugPageSlice);
  const hoveredCar = slice.hoveredCar;
  const hoveredTrack = slice.hoveredTrack;

  const tracks = hoveredCar
    ? TRACKS.filter(track => canRaceOn(hoveredCar.class, track))
    : TRACKS;

  const cars = hoveredTrack
    ? CARS.filter(car => canRaceOn(car.class, hoveredTrack))
    : CARS;

  return (
    <>
      <Helmet>
        <title>Data Debugger</title>
      </Helmet>

      <Box sx={{ flexGrow: 1 }}>
        <h1>Data Debugger</h1>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Cars
              cars={cars}
              onMouseEnter={(car: CarSpec) => dispatch(actions.carEnter(car))}
              onMouseLeave={(car: CarSpec) => dispatch(actions.carLeave(car))}
              highlightCar={hoveredCar}
            />
          </Grid>
          <Grid item xs={4}>
            <Tracks
              tracks={tracks}
              onMouseEnter={(track: TrackSpec) =>
                dispatch(actions.trackEnter(track))
              }
              onMouseLeave={(track: TrackSpec) =>
                dispatch(actions.trackLeave(track))
              }
              highlightTrack={hoveredTrack}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
