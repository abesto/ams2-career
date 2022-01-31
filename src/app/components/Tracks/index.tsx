import * as React from 'react';
import { trackEquals, trackKey, TrackSpec } from 'types/TrackSpec';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface Props {
  tracks: TrackSpec[];
  onMouseEnter: (car: TrackSpec) => void;
  onMouseLeave: (car: TrackSpec) => void;
  highlightTrack: TrackSpec | null;
}

export function Tracks(props: Props) {
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
            {props.tracks.map((track: TrackSpec) => (
              <TableRow
                key={trackKey(track)}
                onMouseEnter={() => props.onMouseEnter(track)}
                onMouseLeave={() => props.onMouseLeave(track)}
                hover={trackEquals(track, props.highlightTrack)}
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
