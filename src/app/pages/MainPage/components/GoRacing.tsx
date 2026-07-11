import dayjs from 'dayjs';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InfoIcon from '@mui/icons-material/Info';
import {
  Chip,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { useMainPageSlice } from '../slice';
import { selectAIAdjustment } from '../slice/selectors';
import { AIAdjustmentInstance } from '../slice/types';

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
  onRecord: (
    aiLevel: number,
    aiAdjustment: AIAdjustmentInstance | null,
    position: number,
  ) => void;
}

function Item({ label, children }) {
  return (
    <Grid size={{ xs: 12, sm: 6, xl: 'auto' }}>
      <Box
        sx={{
          height: '100%',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'grey.50',
          px: 1.5,
          py: 1.25,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 0.5,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {children}
        </Typography>
      </Box>
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
    <Grid size={{ xs: 12, sm: 6 }}>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          p: 1.5,
        }}
      >
        <TextField
          fullWidth
          label={label}
          type="number"
          size="small"
          value={value}
          onChange={e => {
            onChange(Number(e.target.value));
          }}
        />
      </Box>
    </Grid>
  );
}

export function GoRacing(props: Props) {
  const { race, career, currentCarId, onCarSelect, onRecord } = props;

  const { actions } = useMainPageSlice();
  const dispatch = useDispatch();
  const aiAdjustment = useSelector(selectAIAdjustment);
  const [position, setPosition] = React.useState(1);

  if (!race) {
    return null;
  }

  let adjustedAI = race.aiLevel;
  if (aiAdjustment) {
    adjustedAI +=
      aiAdjustment.car +
      aiAdjustment.carClass +
      aiAdjustment.discipline +
      aiAdjustment.global;
  }

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
    onCarSelect(e.target.value as CarId);
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          p: 2,
        }}
      >
        <DisciplineProgress discipline={discipline} career={career} />
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          Simulator settings
        </Typography>
        <Grid container spacing={1.5}>
          <Item label="Class">{carClass.name}</Item>
          <Item label="Track">{track.name}</Item>
          <Item label="Configuration">{track.configuration ?? 'Standard'}</Item>
          <Item label="Race Length">
            {carClass.raceLength} {carClass.raceLengthUnit}
          </Item>
          <Item label="Simulator Time">
            {dayjs(race.simTime).format('YYYY-MM-DD HH:mm')}
          </Item>
        </Grid>
      </Box>

      <Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', mb: 1.5 }}
        >
          <Typography variant="subtitle1">AI strength</Typography>
          <Tooltip title="This app automatically adjusts AI strength by discipline based on your results, but you can further customize it globally, by discipline, car class, or even car. These settings are persisted in the save.">
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Stack>
        <Grid container spacing={1.5}>
          <Grid size={12}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'grey.50',
                p: 1.5,
              }}
            >
              <Chip label={`Base: ${race.aiLevel}`} />
              <Typography color="text.secondary">+</Typography>
              <Chip label={`Global: ${aiAdjustment?.global || 0}`} />
              <Typography color="text.secondary">+</Typography>
              <Chip
                label={`${discipline.name}: ${aiAdjustment?.discipline || 0}`}
              />
              <Typography color="text.secondary">+</Typography>
              <Chip
                label={`${carClass.name}: ${aiAdjustment?.carClass || 0}`}
              />
              <Typography color="text.secondary">+</Typography>
              <Chip
                label={`${getCar(currentCarId!).name}: ${aiAdjustment?.car || 0}`}
              />
              <Typography color="text.secondary">=</Typography>
              <Chip
                label={`Final: ${adjustedAI}`}
                sx={{
                  fontWeight: 700,
                  backgroundColor: 'rgba(31, 79, 143, 0.12)',
                  border: 1,
                  borderColor: 'rgba(31, 79, 143, 0.22)',
                  color: 'primary.dark',
                  '& .MuiChip-label': {
                    color: 'inherit',
                  },
                }}
              />
            </Box>
          </Grid>
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
        </Grid>
      </Box>

      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          pt: 3,
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          Record your result
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Once the race is complete, log the car you used and your finishing
          position.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { sm: 'flex-start' } }}
        >
          <FormControl sx={{ minWidth: 220 }}>
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

          <FormControl sx={{ width: { xs: '100%', sm: 180 } }}>
            <TextField
              label="Finishing position"
              type="number"
              value={position}
              onChange={e => handlePosition(parseInt(e.target.value))}
            />
          </FormControl>
          <Button
            size="large"
            variant="contained"
            sx={{ minWidth: 140, py: 1.75 }}
            onClick={() => onRecord(adjustedAI, aiAdjustment, position)}
          >
            Record result
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
