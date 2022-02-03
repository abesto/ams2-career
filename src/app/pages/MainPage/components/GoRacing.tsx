import { getCar } from 'app/data/cars';
import { getTrack } from 'app/data/tracks';
import dayjs from 'dayjs';
import * as React from 'react';
import { Race } from 'types/Race';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface Props {
  race: Race;
  onRecord: (position: number) => void;
}

export function GoRacing(props: Props) {
  const { race } = props;
  const [position, setPosition] = React.useState(5);

  const track = getTrack(race.trackId);
  const car = getCar(race.carId);

  return (
    <>
      <dl>
        <dt>Track</dt>
        <dd>{track.name}</dd>
        <dt>Configuration</dt>
        <dd>{track.configuration}</dd>
        <dt>Car</dt>
        <dd>{car.name}</dd>
        <dt>Sim Time</dt>
        <dd>{dayjs(race.simTime).format('YYYY-MM-DD HH:mm')}</dd>
        <dt>AI Strength</dt>
        <dd>{race.aiLevel}</dd>
      </dl>
      <Box>
        <TextField
          label="Finishing position"
          type="number"
          value={position}
          onChange={e => setPosition(parseInt(e.target.value))}
        />
        <Button
          size="large"
          variant="contained"
          sx={{ ml: 1 }}
          onClick={() => props.onRecord(position)}
        >
          Record
        </Button>
      </Box>
    </>
  );
}
