import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import Papa from 'papaparse';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

import gameTracksCsv from 'app/data/game_tracks.csv?raw';
import { getTrackLabels, TrackLabels } from 'app/data/trackNames';

type TrackRecord = Record<string, string> & {
  game_id: string;
  TrackName: string;
  ShortTrackName: string;
  Track_Variation: string;
  'Track Group': string;
  'Track Type': string;
  Location: string;
  Country: string;
  Year: string;
  Length: string;
  'Track Surface': string;
  Class: string;
  Downforce: string;
  downforce_variant: string;
  display_name?: string;
  display_configuration?: string;
  display_category?: string;
};

const parseOptions = { header: true, skipEmptyLines: true } as const;
const tracks = Papa.parse<TrackRecord>(gameTracksCsv, parseOptions).data;

const detailFields = [
  ['Display name', 'TrackName'],
  ['Short name', 'ShortTrackName'],
  ['Configuration', 'Track_Variation'],
  ['Year', 'Year'],
  ['Length (m)', 'Length'],
  ['Location', 'Location'],
  ['Country', 'Country'],
  ['Track type', 'Track Type'],
  ['Surface', 'Track Surface'],
  ['Group', 'Track Group'],
  ['Game class', 'Class'],
  ['Downforce', 'Downforce'],
  ['Allowed weather', 'Allowed Weather'],
  ['Allowed time of day', 'Allowed TimeOfDay'],
  ['Time-of-day group', 'TimeOfDay Group'],
  ['DLC', 'DLC ID'],
  ['Source ID', 'game_id'],
] as const;

function valueFor(track: TrackRecord, key: string): string {
  return track[key] || 'Not specified';
}

function labelsFor(track: TrackRecord): TrackLabels {
  return getTrackLabels({
    name: track.TrackName,
    shortName: track.ShortTrackName,
    variation: track.Track_Variation,
    category: track['Track Group'],
    displayName: track.display_name,
    displayConfiguration: track.display_configuration,
    displayCategory: track.display_category,
  });
}

function TrackDetails({ track }: { track: TrackRecord }) {
  const labels = labelsFor(track);
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Chip label={`Group: ${labels.category}`} />
        <Chip label={`Type: ${valueFor(track, 'Track Type')}`} />
        <Chip
          color={track.downforce_variant === 'low' ? 'warning' : 'default'}
          label={`Downforce: ${valueFor(track, 'downforce_variant')}`}
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
              {valueFor(track, key)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Divider />
      <Typography variant="caption" color="text.secondary">
        XLASTID: {valueFor(track, 'XLASTID')} · Scenegraph:{' '}
        {valueFor(track, 'ScenegraphFile')}
      </Typography>
    </Stack>
  );
}

function TrackAccordion({ track }: { track: TrackRecord }) {
  const labels = labelsFor(track);
  return (
    <Accordion
      disableGutters
      variant="outlined"
      sx={{ '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {labels.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {labels.configuration || 'Default configuration'} ·{' '}
            {valueFor(track, 'Location')} · {valueFor(track, 'Country')} ·{' '}
            {valueFor(track, 'Length')} m
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <TrackDetails track={track} />
      </AccordionDetails>
    </Accordion>
  );
}

function filterValue(track: TrackRecord, key: keyof TrackRecord): string {
  const labels = labelsFor(track);
  if (key === 'Track Group') return labels.category;
  return String(track[key] ?? '');
}

function optionsFor(key: keyof TrackRecord): string[] {
  const values: string[] = tracks
    .map(track => filterValue(track, key))
    .filter(Boolean);
  return [...new Set<string>(values)].sort((left, right) =>
    left.localeCompare(right),
  );
}

type FilterSpec = {
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  id: string;
  key: keyof TrackRecord;
};

export function TrackExplorerPage() {
  const [filter, setFilter] = React.useState('');
  const [group, setGroup] = React.useState('all');
  const [trackType, setTrackType] = React.useState('all');
  const [country, setCountry] = React.useState('all');
  const [downforce, setDownforce] = React.useState('all');

  const filterSpecs: FilterSpec[] = [
    {
      label: 'Track group',
      value: group,
      setValue: setGroup,
      id: 'track-group-filter',
      key: 'Track Group',
    },
    {
      label: 'Track type',
      value: trackType,
      setValue: setTrackType,
      id: 'track-type-filter',
      key: 'Track Type',
    },
    {
      label: 'Country',
      value: country,
      setValue: setCountry,
      id: 'track-country-filter',
      key: 'Country',
    },
    {
      label: 'Downforce',
      value: downforce,
      setValue: setDownforce,
      id: 'track-downforce-filter',
      key: 'downforce_variant',
    },
  ];

  const filteredTracks = tracks
    .filter(track => {
      const search = filter.trim().toLowerCase();
      return (
        (!search ||
          [
            track.TrackName,
            track.ShortTrackName,
            track.Track_Variation,
            track['Track Group'],
            track['Track Type'],
            track.Location,
            track.Country,
            track.Class,
            track.game_id,
          ]
            .join(' ')
            .toLowerCase()
            .includes(search)) &&
        (group === 'all' || filterValue(track, 'Track Group') === group) &&
        (trackType === 'all' || track['Track Type'] === trackType) &&
        (country === 'all' || track.Country === country) &&
        (downforce === 'all' || track.downforce_variant === downforce)
      );
    })
    .sort((left, right) =>
      `${left['Track Group']}/${left.TrackName}/${left.Track_Variation}`.localeCompare(
        `${right['Track Group']}/${right.TrackName}/${right.Track_Variation}`,
      ),
    );

  return (
    <>
      <Helmet>
        <title>Tracks</title>
      </Helmet>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Tracks
          </Typography>
          <Typography color="text.secondary">
            Canonical Automobilista 2 track configurations grouped by game
            track group. Expand a record to inspect extracted metadata.
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Search tracks"
              value={filter}
              onChange={event => setFilter(event.target.value)}
              placeholder="Name, configuration, location, class, or source ID"
              size="small"
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {filterSpecs.map(({ label, value, setValue, id, key }) => (
                <FormControl key={id} size="small" fullWidth>
                  <InputLabel id={`${id}-label`}>{label}</InputLabel>
                  <Select
                    labelId={`${id}-label`}
                    value={value}
                    label={label}
                    onChange={event => setValue(event.target.value)}
                  >
                    <MenuItem value="all">All {label.toLowerCase()}s</MenuItem>
                    {optionsFor(key).map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1.5 }}
          >
            Showing {filteredTracks.length} of {tracks.length} canonical track
            configurations
          </Typography>
        </Paper>

        {filteredTracks.map(track => (
          <TrackAccordion key={track.game_id} track={track} />
        ))}
        {filteredTracks.length === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography>No tracks match the current filters.</Typography>
          </Paper>
        )}
      </Stack>
    </>
  );
}
