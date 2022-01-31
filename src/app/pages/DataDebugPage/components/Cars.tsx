import * as React from 'react';
import { carKey, CarSpec } from 'types/CarSpec';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface Props {
  cars: CarSpec[];
  onHover: (car: CarSpec | null) => void;
}

export function Cars(props: Props) {
  const { cars, onHover } = props;

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
            {cars.map((car: CarSpec) => (
              <TableRow
                key={carKey(car)}
                onMouseEnter={() => onHover(car)}
                onMouseLeave={() => onHover(null)}
                hover={true}
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
