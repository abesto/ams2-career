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

import { getCarClass, getCarClassOfCar } from 'app/data/car_classes';
import { getDisciplineOfCar } from 'app/data/cars';
import { getDiscipline } from 'app/data/disciplines';
import { Car, CarId, getCarId } from 'types/Car';

interface Props {
  cars: Car[];
  onHover: (car: CarId | null) => void;
}

export function Cars(props: Props) {
  const { cars: allCars, onHover } = props;
  const [carFilter, setCarFilter] = React.useState('');
  const [disciplineFilter, setDisciplineFilter] = React.useState('');
  const [classFilter, setClassFilter] = React.useState('');

  const cars = allCars.filter(
    (car: Car) =>
      car.name.toLowerCase().includes(carFilter.toLowerCase()) &&
      getCarClassOfCar(car)
        .name.toLowerCase()
        .includes(classFilter.toLowerCase()) &&
      getDisciplineOfCar(car)
        .name.toLowerCase()
        .includes(disciplineFilter.toLowerCase()),
  );

  return (
    <div>
      <h2>Cars</h2>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TextField
                  label="Name"
                  value={carFilter}
                  onChange={e => setCarFilter(e.target.value)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <TextField
                  label="Discipline"
                  value={disciplineFilter}
                  onChange={e => setDisciplineFilter(e.target.value)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <TextField
                  label="Class"
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  size="small"
                />
              </TableCell>
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
