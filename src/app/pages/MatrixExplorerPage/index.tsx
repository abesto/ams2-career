import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { getAllCars, getCarClassOfCar } from 'app/data/cars';
import { getAllCarClasses, getDisciplineOfCarClass } from 'app/data/car_classes';
import { getTracksFor, getAllTracks } from 'app/data/tracks';
import { canRaceOn } from 'types/Track';
import { Car, getCarId } from 'types/Car';
import { CarClass, getCarClassId } from 'types/CarClass';
import { getTrackId, Track } from 'types/Track';

const cars = getAllCars();
const tracks = getAllTracks();
const carClasses = getAllCarClasses().sort((left, right) =>
  `${left.disciplineId}/${left.grade}/${left.name}`.localeCompare(
    `${right.disciplineId}/${right.grade}/${right.name}`,
  ),
);

function downforceLabel(value?: string): string {
  return value === 'low' ? 'Low downforce' : 'Standard downforce';
}

function DownforceChip({ value }: { value?: string }) {
  const low = value === 'low';
  return (
    <Chip
      size="small"
      color={low ? 'warning' : 'default'}
      variant={low ? 'filled' : 'outlined'}
      label={downforceLabel(value)}
    />
  );
}

function CarRow({ car }: { car: Car }) {
  const carClass = getCarClassOfCar(car);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {car.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {carClass.name} · {getDisciplineOfCarClass(carClass).name} · {car.year}
        </Typography>
      </Box>
      <DownforceChip value={car.downforceVariant} />
    </Box>
  );
}

function TrackRow({ track }: { track: Track }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {track.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {track.configuration || 'Default configuration'}
        </Typography>
      </Box>
      <DownforceChip value={track.downforceVariant} />
    </Box>
  );
}

function ResultList({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <Chip size="small" label={count} />
      </Box>
      <Box sx={{ maxHeight: 560, overflow: 'auto' }}>{children}</Box>
    </Paper>
  );
}

export function MatrixExplorerPage() {
  const [classId, setClassId] = React.useState('');
  const [carId, setCarId] = React.useState('');
  const [trackId, setTrackId] = React.useState('');

  const selectedClass = carClasses.find(item => getCarClassId(item) === classId);
  const selectedCar = cars.find(item => getCarId(item) === carId);
  const selectedTrack = tracks.find(item => getTrackId(item) === trackId);

  const classCars = selectedClass
    ? cars.filter(car => car.carClassId === getCarClassId(selectedClass))
    : [];
  const selectedClassTracks = selectedClass ? getTracksFor(selectedClass) : [];
  const selectedCarTracks = selectedCar ? getTracksFor(selectedCar) : [];
  const compatibleCars = selectedTrack
    ? cars.filter(car => canRaceOn(car, selectedTrack))
    : [];
  const tracksToShow = selectedCar ? selectedCarTracks : selectedClassTracks;

  const groupedTracks = {
    standard: tracksToShow.filter(track => track.downforceVariant !== 'low'),
    low: tracksToShow.filter(track => track.downforceVariant === 'low'),
  };
  const groupedCars = {
    standard: compatibleCars.filter(car => car.downforceVariant !== 'low'),
    low: compatibleCars.filter(car => car.downforceVariant === 'low'),
  };

  return (
    <>
      <Helmet>
        <title>Compatibility Matrix</title>
      </Helmet>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Car / Track Matrix
          </Typography>
          <Typography color="text.secondary">
            Explore which canonical Automobilista 2 cars and tracks can be used
            together. Low-downforce variants only match low-downforce tracks.
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="matrix-class-label">Meta class</InputLabel>
              <Select
                labelId="matrix-class-label"
                value={classId}
                label="Meta class"
                onChange={event => {
                  setClassId(event.target.value);
                  setCarId('');
                }}
              >
                <MenuItem value="">Select a meta class</MenuItem>
                {carClasses.map(item => (
                  <MenuItem key={getCarClassId(item)} value={getCarClassId(item)}>
                    {item.disciplineId} / Grade {item.grade} / {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="matrix-car-label">Car</InputLabel>
              <Select
                labelId="matrix-car-label"
                value={carId}
                label="Car"
                onChange={event => {
                  const nextCarId = event.target.value;
                  const nextCar = cars.find(car => getCarId(car) === nextCarId);
                  setCarId(nextCarId);
                  if (nextCar) setClassId(nextCar.carClassId);
                }}
              >
                <MenuItem value="">Select a car</MenuItem>
                {cars.map(car => (
                  <MenuItem key={getCarId(car)} value={getCarId(car)}>
                    {car.name} ({getCarClassOfCar(car).name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="matrix-track-label">Track</InputLabel>
              <Select
                labelId="matrix-track-label"
                value={trackId}
                label="Track"
                onChange={event => setTrackId(event.target.value)}
              >
                <MenuItem value="">Select a track</MenuItem>
                {tracks.map(track => (
                  <MenuItem key={getTrackId(track)} value={getTrackId(track)}>
                    {track.name} / {track.configuration || 'Default'} ({downforceLabel(track.downforceVariant)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Select a class or car to inspect compatible tracks; select a track
            to inspect every compatible car.
          </Typography>
        </Paper>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <ResultList title="Compatible tracks" count={tracksToShow.length}>
            {tracksToShow.length === 0 ? (
              <Typography color="text.secondary">Select a meta class or car.</Typography>
            ) : (
              <Stack spacing={2}>
                {groupedTracks.standard.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">Standard</Typography>
                      <DownforceChip value="standard" />
                    </Box>
                    {groupedTracks.standard.map(track => (
                      <TrackRow key={getTrackId(track)} track={track} />
                    ))}
                  </Box>
                )}
                {groupedTracks.low.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">Low downforce</Typography>
                      <DownforceChip value="low" />
                    </Box>
                    {groupedTracks.low.map(track => (
                      <TrackRow key={getTrackId(track)} track={track} />
                    ))}
                  </Box>
                )}
              </Stack>
            )}
          </ResultList>
          <ResultList title="Compatible cars" count={compatibleCars.length}>
            {compatibleCars.length === 0 ? (
              <Typography color="text.secondary">Select a track.</Typography>
            ) : (
              <Stack spacing={2}>
                {groupedCars.standard.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">Standard</Typography>
                      <DownforceChip value="standard" />
                    </Box>
                    {groupedCars.standard.map(car => (
                      <CarRow key={getCarId(car)} car={car} />
                    ))}
                  </Box>
                )}
                {groupedCars.low.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">Low downforce</Typography>
                      <DownforceChip value="low" />
                    </Box>
                    {groupedCars.low.map(car => (
                      <CarRow key={getCarId(car)} car={car} />
                    ))}
                  </Box>
                )}
              </Stack>
            )}
          </ResultList>
        </Stack>

        {selectedClass && (
          <Typography variant="caption" color="text.secondary">
            {selectedClass.name} · {getDisciplineOfCarClass(selectedClass).name} · Grade {selectedClass.grade} · {classCars.length} cars
          </Typography>
        )}
      </Stack>
    </>
  );
}
