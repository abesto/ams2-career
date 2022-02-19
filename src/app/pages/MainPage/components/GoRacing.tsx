import dayjs from 'dayjs';
import * as React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DisciplineProgress } from 'app/components/DisciplineProgress';
import { getCarClass } from 'app/data/car_classes';
import { getCarsInClass } from 'app/data/cars';
import { getTrack } from 'app/data/tracks';
import { EnrichedCareerData } from 'app/slice/types';
import { CarId, getCarId } from 'types/Car';
import { getDisciplineOfRace, Race } from 'types/Race';

interface Props {
  race: Race;
  career: EnrichedCareerData;
  currentCarId: CarId | null;
  onCarSelect: (carId: CarId) => void;
  onRecord: (position: number) => void;
}

function Item({ label, children }) {
  return (
    <Grid item>
      <Stack
        direction="row"
        sx={{
          border: 1,
          borderColor: 'grey.500',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="button"
          sx={{
            px: 1,
            py: 0.75,
            borderRight: 1,
            borderColor: 'grey.500',
            backgroundColor: 'grey.200',
            borderRadius: 2,
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ px: 1, py: 1 }}>
          {children}
        </Typography>
      </Stack>
    </Grid>
  );
}

export function GoRacing(props: Props) {
  const { race, career } = props;
  const [position, setPosition] = React.useState(1);

  const track = getTrack(race.trackId);

  function handleCarSelectChange(e) {
    props.onCarSelect(e.target.value);
  }

  return (
    <>
      <DisciplineProgress
        discipline={getDisciplineOfRace(race)}
        career={career}
      />

      <Typography variant="h6" sx={{ my: 2 }}>
        Simulator Settings
      </Typography>
      <Grid container spacing={2}>
        <Item label="Class">{getCarClass(race.carClassId).name}</Item>
        <Item label="Track">{track.name}</Item>
        <Item label="Configuration">{track.configuration}</Item>
        <Item label="Simulator Time">
          {dayjs(race.simTime).format('YYYY-MM-DD HH:mm')}
        </Item>
        <Item label="AI Strength">{race.aiLevel}</Item>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ my: 2 }}>
          How did it go?
        </Typography>
        <FormControl>
          <InputLabel id="car-select">Your Car</InputLabel>
          <Select
            labelId="car-select"
            value={props.currentCarId}
            onChange={handleCarSelectChange}
            label="Your Car"
          >
            {getCarsInClass(race.carClassId).map(car => (
              <MenuItem key={getCarId(car)} value={getCarId(car)}>
                {car.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Finishing position"
          type="number"
          value={position}
          onChange={e => setPosition(parseInt(e.target.value))}
          sx={{ mx: 1 }}
        />
        <Button
          size="large"
          variant="contained"
          sx={{ py: 1.75 }}
          onClick={() => props.onRecord(position)}
        >
          Record
        </Button>
      </Box>
    </>
  );
}
