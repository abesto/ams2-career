import { CARS } from 'app/data/cars';
import { TRACKS } from 'app/data/tracks';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { CarSpec } from 'types/CarSpec';
import { canRaceOn, TrackSpec } from 'types/TrackSpec';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { Cars } from './components/Cars';
import { Tracks } from './components/Tracks';

export function DataDebugPage() {
  const [hoveredCar, setHoveredCar] = React.useState<CarSpec | null>(null);
  const [hoveredTrack, setHoveredTrack] = React.useState<TrackSpec | null>(
    null,
  );

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
            <Cars cars={cars} onHover={setHoveredCar} />
          </Grid>
          <Grid item xs={4}>
            <Tracks tracks={tracks} onHover={setHoveredTrack} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
