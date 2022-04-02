import dayjs from 'dayjs';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useMainPageSlice } from '../slice';
import { selectAIAdjustment } from '../slice/selectors';

import { DisciplineProgress } from 'app/components/DisciplineProgress';
import { getCarClass } from 'app/data/car_classes';
import { getCar, getCarsInClass } from 'app/data/cars';
import { getTrack } from 'app/data/tracks';
import { EnrichedCareerData } from 'app/slices/CareerSlice/types';
import { CarId, getCarId } from 'types/Car';
import { getCarClassId } from 'types/CarClass';
import { getDisciplineId } from 'types/Discipline';
import { getDisciplineOfRace, Race } from 'types/Race';

interface Props {
  race: Race;
  career: EnrichedCareerData;
  currentCarId: CarId | null;
  onCarSelect: (carId: CarId) => void;
  onRecord: (aiLevel: number, position: number) => void;
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

interface AIAdjustmentProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function AIAdjustment(props: AIAdjustmentProps) {
  const { label, value, onChange } = props;
  return (
    <>
      <Grid item>+</Grid>
      <Grid item>
        <TextField
          sx={{ width: Math.max(10, label.length * 1.1).toString() + 'ch' }}
          label={label}
          type="number"
          size="small"
          value={value}
          onChange={e => {
            onChange(Number(e.target.value));
          }}
        />
      </Grid>
    </>
  );
}

export function GoRacing(props: Props) {
  const { race, career, currentCarId, onCarSelect, onRecord } = props;

  const { actions } = useMainPageSlice();
  const dispatch = useDispatch();
  const aiAdjustment = useSelector(selectAIAdjustment);
  let adjustedAI = race.aiLevel;
  if (aiAdjustment) {
    adjustedAI +=
      aiAdjustment.car +
      aiAdjustment.carClass +
      aiAdjustment.discipline +
      aiAdjustment.global;
  }

  const [position, setPosition] = React.useState(1);

  function handlePosition(position: number) {
    if (position < 1) {
      setPosition(1);
    } else {
      setPosition(position);
    }
  }

  const track = getTrack(race.trackId);
  const carClass = getCarClass(race.carClassId);
  const discipline = getDisciplineOfRace(race);

  function handleCarSelectChange(e) {
    onCarSelect(e.target.value);
  }

  return (
    <>
      <DisciplineProgress discipline={discipline} career={career} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Simulator Settings
      </Typography>
      <Grid container spacing={2}>
        <Item label="Class">{carClass.name}</Item>
        <Item label="Track">{track.name}</Item>
        <Item label="Configuration">{track.configuration}</Item>
        <Item label="Race Length">
          {carClass.raceLength} {carClass.raceLengthUnit}
        </Item>
        <Item label="Simulator Time">
          {dayjs(race.simTime).format('YYYY-MM-DD HH:mm')}
        </Item>
      </Grid>
      <Typography
        variant="h6"
        sx={{ mt: 2, display: 'flex', alignItems: 'center' }}
      >
        AI Strength{' '}
        <Tooltip title="This app automatically adjusts AI strength by discipline based on your results, but you can further customize it globally, by discipline, car class, or even car with the fields below. These settings are persisted in the save.">
          <InfoIcon fontSize="small" />
        </Tooltip>
      </Typography>
      <Grid container spacing={1} alignItems="center">
        <Item label="Based on past results">{race.aiLevel}</Item>
        <AIAdjustment
          label="Global"
          value={aiAdjustment?.global || 0}
          onChange={value => dispatch(actions.adjustAIGlobal(value))}
        />
        <AIAdjustment
          label={discipline.name}
          value={aiAdjustment?.discipline || 0}
          onChange={value =>
            dispatch(
              actions.adjustAIDiscipline({
                id: getDisciplineId(discipline),
                value,
              }),
            )
          }
        />
        <AIAdjustment
          label={carClass.name}
          value={aiAdjustment?.carClass || 0}
          onChange={value =>
            dispatch(
              actions.adjustAICarClass({
                id: getCarClassId(carClass),
                value,
              }),
            )
          }
        />
        <AIAdjustment
          label={getCar(currentCarId!).name}
          value={aiAdjustment?.car || 0}
          onChange={value =>
            dispatch(
              actions.adjustAICar({
                id: currentCarId!,
                value,
              }),
            )
          }
        />
        <Grid item>=</Grid>
        <Item label="Final AI Strength">{adjustedAI}</Item>
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ my: 2 }}>
          How did it go?
        </Typography>
        <FormControl>
          <InputLabel id="car-select">Your Car</InputLabel>
          <Select
            labelId="car-select"
            value={currentCarId}
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
          onChange={e => handlePosition(parseInt(e.target.value))}
          sx={{ mx: 1 }}
        />
        <Button
          size="large"
          variant="contained"
          sx={{ py: 1.75 }}
          onClick={() => onRecord(adjustedAI, position)}
        >
          Record
        </Button>
      </Box>
    </>
  );
}
