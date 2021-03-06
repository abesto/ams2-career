import * as React from 'react';

import { Grid } from '@mui/material';

import { Cars } from './Cars';
import { Tracks } from './Tracks';

import {
  getAllCars,
  getCar,
  getCarClassOfCar,
  getDisciplineOfCar,
} from 'app/data/cars';
import { getAllTracks, getTracksFor } from 'app/data/tracks';
import { Car, CarId } from 'types/Car';
import { canRaceOn, getTrackId, Track, TrackId } from 'types/Track';

function compareFields(a: Car): any[] {
  const carClass = getCarClassOfCar(a);
  return [getDisciplineOfCar(a).name, carClass.grade, carClass.name, a.name];
}

const zip = (a: any[], b: any[]) => a.map((k, i) => [k, b[i]]);

function compareCars(a: Car, b: Car): number {
  for (const [ax, bx] of zip(compareFields(a), compareFields(b))) {
    if (ax < bx) {
      return -1;
    }
    if (ax > bx) {
      return 1;
    }
  }
  return 0;
}

function compareTracks(a: Track, b: Track): number {
  return getTrackId(a).localeCompare(getTrackId(b));
}

export function CarsAndTracks() {
  const [hoveredCarId, setHoveredCarId] = React.useState<CarId | null>(null);
  const [hoveredTrackId, setHoveredTrackId] = React.useState<TrackId | null>(
    null,
  );

  const tracks = hoveredCarId
    ? getTracksFor(getCar(hoveredCarId).carClassId)
    : getAllTracks();
  tracks.sort(compareTracks);

  const cars = hoveredTrackId
    ? getAllCars().filter((car: Car) =>
        canRaceOn(car.carClassId, hoveredTrackId),
      )
    : getAllCars();
  cars.sort(compareCars);

  return (
    <Grid container spacing={3}>
      <Grid item xs={8}>
        <Cars cars={cars} onHover={setHoveredCarId} />
      </Grid>
      <Grid item xs={4}>
        <Tracks tracks={tracks} onHover={setHoveredTrackId} />
      </Grid>
    </Grid>
  );
}
