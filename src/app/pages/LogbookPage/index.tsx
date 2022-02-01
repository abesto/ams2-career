import { selectCareer } from 'app/slice/selectors';
import * as React from 'react';
import { useSelector } from 'react-redux';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface Props {}

export function LogbookPage(props: Props) {
  const career = useSelector(selectCareer);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Discipline</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Car</TableCell>
            <TableCell>Track</TableCell>
            <TableCell>Configuration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {career.raceResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(result.racedAt).toString()}</TableCell>
              <TableCell>{result.position}</TableCell>
              <TableCell>{result.car.class.discipline.name}</TableCell>
              <TableCell>{result.car.class.name}</TableCell>
              <TableCell>{result.car.name}</TableCell>
              <TableCell>{result.track.name}</TableCell>
              <TableCell>{result.track.configuration}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
