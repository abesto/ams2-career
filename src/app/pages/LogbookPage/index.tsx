import { getCarClass } from 'app/data/car_classes';
import { getCar } from 'app/data/cars';
import { getDiscipline } from 'app/data/disciplines';
import { getTrack } from 'app/data/tracks';
import { selectCareer } from 'app/slice/selectors';
import dayjs from 'dayjs';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
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
    <>
      <Helmet>
        <title>Logbook</title>
      </Helmet>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Raced At</TableCell>
              <TableCell>Sim Time</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>AI Strength</TableCell>
              <TableCell>Discipline</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Car</TableCell>
              <TableCell>Track</TableCell>
              <TableCell>Configuration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {career.raceResults.map((result, index) => {
              const track = getTrack(result.trackId);
              const car = getCar(result.carId);
              const carClass = getCarClass(car.carClassId);
              const discipline = getDiscipline(carClass.disciplineId);
              return (
                <TableRow key={index}>
                  <TableCell>
                    {dayjs(result.racedAt).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell>
                    {dayjs(result.simTime).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell>{result.position}</TableCell>
                  <TableCell>{result.aiLevel}</TableCell>
                  <TableCell>{discipline.name}</TableCell>
                  <TableCell>{carClass.name}</TableCell>
                  <TableCell>{car.name}</TableCell>
                  <TableCell>{track.name}</TableCell>
                  <TableCell>{track.configuration}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
