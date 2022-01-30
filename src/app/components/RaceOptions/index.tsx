import * as React from 'react';
import { Race } from 'types/Race';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { classKey } from 'app/data/car_classes';

interface Props {
  races: Race[];
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
          {props.races.map(race => (
            <TableRow key={classKey(race.car.class)}>
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
