import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { getCarClass } from 'app/data/car_classes';
import { getDiscipline } from 'app/data/disciplines';
import { getTrack } from 'app/data/tracks';
import { formatGrade } from 'app/xp';
import { getCarClassId } from 'types/CarClass';
import { Race } from 'types/Race';

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
            <TableCell>Grade</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Track</TableCell>
            <TableCell>Configuration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.races.map((race, index) => {
            const carClass = getCarClass(race.carClassId);
            const discipline = getDiscipline(carClass.disciplineId);
            const track = getTrack(race.trackId);
            return (
              <TableRow
                key={getCarClassId(carClass)}
                hover={true}
                selected={index === props.selectedRaceIndex}
                onClick={() => props.onSelect(index)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{discipline.name}</TableCell>
                <TableCell>{formatGrade(carClass.grade, true)}</TableCell>
                <TableCell>{carClass.name}</TableCell>
                <TableCell>{track.name}</TableCell>
                <TableCell>{track.configuration}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
