import { classKey } from 'app/data/car_classes';
import * as React from 'react';
import { Race } from 'types/Race';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface Props {
  races: Race[];
  onSelect: (raceIndex: number) => void;
  selectedRaceIndex: null | number;
}

export function RaceOptions(props: Props) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Discipline</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Car</TableCell>
            <TableCell>Track</TableCell>
            <TableCell>Configuration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.races.map((race, index) => (
            <TableRow
              key={classKey(race.car.class)}
              hover={true}
              selected={index === props.selectedRaceIndex}
              onClick={() => props.onSelect(index)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{race.car.class.discipline.name}</TableCell>
              <TableCell>{race.car.class.name}</TableCell>
              <TableCell>{race.car.name}</TableCell>
              <TableCell>{race.track.name}</TableCell>
              <TableCell>{race.track.configuration}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
