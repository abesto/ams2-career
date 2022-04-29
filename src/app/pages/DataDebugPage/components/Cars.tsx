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

import { getCarClass } from 'app/data/car_classes';
import { getDiscipline } from 'app/data/disciplines';
import { Car, CarId, getCarId } from 'types/Car';

interface Props {
  cars: Car[];
  onHover: (car: CarId | null) => void;
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
            {cars.map((car: Car) => {
              const carClass = getCarClass(car.carClassId);
              const discipline = getDiscipline(carClass.disciplineId);
              const carId = getCarId(car);
              return (
                <TableRow
                  key={carId}
                  onMouseEnter={() => onHover(carId)}
                  onMouseLeave={() => onHover(null)}
                  hover={true}
                >
                  <TableCell>{car.name}</TableCell>
                  <TableCell>{discipline.name}</TableCell>
                  <TableCell>{carClass.name}</TableCell>
                  <TableCell>{carClass.grade}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
