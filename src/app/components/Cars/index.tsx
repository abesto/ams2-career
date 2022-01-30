import * as React from 'react';
import { carEquals, carKey, CarSpec } from 'types/CarSpec';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface Props {
  cars: CarSpec[];
  onMouseEnter: (car: CarSpec) => void;
  onMouseLeave: (car: CarSpec) => void;
  highlightCar: CarSpec | null;
}

export function Cars(props: Props) {
  return (
    <div>
      <h2>Cars</h2>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Discipline</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Class Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.cars.map((car: CarSpec) => (
              <TableRow
                key={carKey(car)}
                onMouseEnter={() => props.onMouseEnter(car)}
                onMouseLeave={() => props.onMouseLeave(car)}
                hover={carEquals(car, props.highlightCar)}
              >
                <TableCell>{car.name}</TableCell>
                <TableCell>{car.class.discipline.name}</TableCell>
                <TableCell>{car.class.name}</TableCell>
                <TableCell>{car.class.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
