import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import Papa from 'papaparse';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import gameCarsCsv from 'app/data/game_cars.csv?raw';
import gameClassMappingCsv from 'app/data/game_class_mapping.csv?raw';

type CsvRow = Record<string, string>;

type CarRecord = CsvRow & {
  game_id: string;
  discipline: string;
  meta_class: string;
  'Vehicle Class': string;
};

type ClassMapping = {
  game_class: string;
  grade: string;
};

type Group = {
  discipline: string;
  metaClass: string;
  grade: string;
  cars: CarRecord[];
};

const parseOptions = { header: true, skipEmptyLines: true } as const;

const cars = Papa.parse<CarRecord>(gameCarsCsv, parseOptions).data;
const classMappings = Papa.parse<ClassMapping>(
  gameClassMappingCsv,
  parseOptions,
).data;

const gradeByGameClass = new Map(
  classMappings.map(mapping => [mapping.game_class, mapping.grade]),
);

const groups: Group[] = cars
  .map(car => ({
    car,
    grade: gradeByGameClass.get(car['Vehicle Class']) ?? 'Unassigned',
  }))
  .reduce<Group[]>((result, { car, grade }) => {
    let group = result.find(
      item =>
        item.discipline === car.discipline &&
        item.metaClass === car.meta_class &&
        item.grade === grade,
    );
    if (!group) {
      group = {
        discipline: car.discipline,
        metaClass: car.meta_class,
        grade,
        cars: [],
      };
      result.push(group);
    }
    group.cars.push(car);
    return result;
  }, [])
  .sort((left, right) =>
    `${left.discipline}${left.metaClass}${left.grade}`.localeCompare(
      `${right.discipline}${right.metaClass}${right.grade}`,
    ),
  );

const detailFields = [
  ['Display name', 'Vehicle Name'],
  ['Manufacturer', 'VehicleManufacturer'],
  ['Model', 'VehicleModel'],
  ['Year', 'Vehicle Year'],
  ['Game class', 'Vehicle Class'],
  ['Game group', 'Vehicle Group'],
  ['Shape', 'Vehicle Shape'],
  ['Physics model', 'Vehicle Physics Model'],
  ['DLC', 'DLC ID'],
  ['Source ID', 'game_id'],
] as const;

function valueFor(car: CarRecord, key: string): string {
  return car[key] || 'Not specified';
}

function CarDetails({ car }: { car: CarRecord }) {
  const headlights = car.has_headlights === 'true';
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Chip
          icon={headlights ? <CheckIcon /> : <CloseIcon />}
          color={headlights ? 'success' : 'default'}
          label={headlights ? 'Has headlights' : 'No headlights'}
        />
        <Chip label={`Meta class: ${car.meta_class}`} />
        <Chip
          label={`Grade: ${gradeByGameClass.get(car['Vehicle Class']) ?? 'Unassigned'}`}
        />
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {detailFields.map(([label, key]) => (
          <Box key={key}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {valueFor(car, key)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Divider />
      <Typography variant="caption" color="text.secondary">
        Headlight source: {valueFor(car, 'headlights_source')} · XLASTID:{' '}
        {valueFor(car, 'XLASTID')}
      </Typography>
    </Stack>
  );
}

function CarAccordion({ car }: { car: CarRecord }) {
  return (
    <Accordion
      disableGutters
      variant="outlined"
      sx={{ '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {valueFor(car, 'Vehicle Name')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {valueFor(car, 'VehicleManufacturer')}{' '}
            {valueFor(car, 'VehicleModel')} · {valueFor(car, 'Vehicle Year')} ·{' '}
            {valueFor(car, 'Vehicle Class')}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <CarDetails car={car} />
      </AccordionDetails>
    </Accordion>
  );
}

export function CarExplorerPage() {
  const [filter, setFilter] = React.useState('');
  const [discipline, setDiscipline] = React.useState('all');

  const disciplines = [
    ...new Set(groups.map(group => group.discipline)),
  ].sort();
  const filteredGroups = groups
    .map(group => ({
      ...group,
      cars: group.cars.filter(car => {
        const search = filter.toLowerCase();
        return (
          (!search ||
            [
              car['Vehicle Name'],
              car.VehicleManufacturer,
              car.VehicleModel,
              car['Vehicle Class'],
              car.meta_class,
              car.game_id,
            ]
              .join(' ')
              .toLowerCase()
              .includes(search)) &&
          (discipline === 'all' || car.discipline === discipline)
        );
      }),
    }))
    .filter(group => group.cars.length > 0);

  return (
    <>
      <Helmet>
        <title>Cars</title>
      </Helmet>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Cars
          </Typography>
          <Typography color="text.secondary">
            Canonical Automobilista 2 vehicles grouped by discipline, meta
            class, and grade. Expand a car to inspect extracted game metadata.
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search cars"
              value={filter}
              onChange={event => setFilter(event.target.value)}
              placeholder="Name, manufacturer, class, or source ID"
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: { sm: 220 } }}>
              <InputLabel id="car-discipline-label">Discipline</InputLabel>
              <Select
                labelId="car-discipline-label"
                value={discipline}
                label="Discipline"
                onChange={event => setDiscipline(event.target.value)}
              >
                <MenuItem value="all">All disciplines</MenuItem>
                {disciplines.map(item => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1.5 }}
          >
            Showing{' '}
            {filteredGroups.reduce(
              (count, group) => count + group.cars.length,
              0,
            )}{' '}
            of {cars.length} canonical cars
          </Typography>
        </Paper>

        {filteredGroups.map(group => {
          const groupKey = `${group.discipline}/${group.metaClass}/${group.grade}`;
          return (
            <Box key={groupKey}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {group.discipline} / {group.metaClass} / Grade {group.grade}
              </Typography>
              <Stack spacing={1}>
                {group.cars
                  .sort((left, right) =>
                    valueFor(left, 'Vehicle Name').localeCompare(
                      valueFor(right, 'Vehicle Name'),
                    ),
                  )
                  .map(car => (
                    <CarAccordion key={car.game_id} car={car} />
                  ))}
              </Stack>
            </Box>
          );
        })}
        {filteredGroups.length === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography>No cars match the current filters.</Typography>
          </Paper>
        )}
      </Stack>
    </>
  );
}
