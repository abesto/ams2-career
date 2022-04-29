import * as React from 'react';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { getTrackId, Track, TrackId } from 'types/Track';

interface Props {
  tracks: Track[];
  onHover: (track: TrackId | null) => void;
}

export function Tracks(props: Props) {
  const { tracks, onHover } = props;

  return (
    <div>
      <h2>Tracks</h2>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Configuration</TableCell>
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
