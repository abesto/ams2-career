import * as React from 'react';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';

import { getTrackId, Track, TrackId } from 'types/Track';

interface Props {
  tracks: Track[];
  onHover: (track: TrackId | null) => void;
}

export function Tracks(props: Props) {
  const { tracks: allTracks, onHover } = props;
  const [nameFilter, setNameFilter] = React.useState('');
  const [configurationFilter, setConfigurationFilter] = React.useState('');

  const tracks = allTracks.filter(
    (track: Track) =>
      track.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      track.configuration
        .toLowerCase()
        .includes(configurationFilter.toLowerCase()),
  );

  return (
    <div>
      <h2>Tracks</h2>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TextField
                  label="Name"
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <TextField
                  label="Configuration"
                  value={configurationFilter}
                  onChange={e => setConfigurationFilter(e.target.value)}
                  size="small"
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tracks.map((track: Track) => (
              <TableRow
                key={getTrackId(track)}
                onMouseEnter={() => onHover(getTrackId(track))}
                onMouseLeave={() => onHover(null)}
                hover={true}
              >
                <TableCell>{track.name}</TableCell>
                <TableCell>{track.configuration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
