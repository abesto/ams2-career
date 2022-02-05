import { getCarsInClass } from 'app/data/cars';
import { getTrack } from 'app/data/tracks';
import dayjs from 'dayjs';
import * as React from 'react';
import { CarId, getCarId } from 'types/Car';
import { Race } from 'types/Race';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

interface Props {
  race: Race;
  currentCarId: CarId | null;
  onCarSelect: (carId: CarId) => void;
  onRecord: (position: number) => void;
}

export function GoRacing(props: Props) {
  const { race } = props;
  const [position, setPosition] = React.useState(1);

  const track = getTrack(race.trackId);

  function handleCarSelectChange(e) {
    props.onCarSelect(e.target.value);
  }

  return (
    <>
      <dl>
        <dt>Track</dt>
        <dd>{track.name}</dd>
        <dt>Configuration</dt>
        <dd>{track.configuration}</dd>
        <dt>Sim Time</dt>
        <dd>{dayjs(race.simTime).format('YYYY-MM-DD HH:mm')}</dd>
        <dt>AI Strength</dt>
        <dd>{race.aiLevel}</dd>
      </dl>

      <Box>
        <FormControl>
          <InputLabel id="car-select">Car</InputLabel>
          <Select
            labelId="car-select"
            value={props.currentCarId}
            onChange={handleCarSelectChange}
            label="Car"
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
          onClick={() => props.onRecord(position)}
        >
          Record
        </Button>
      </Box>
    </>
  );
}
