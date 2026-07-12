import * as React from 'react';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { findCarClass } from 'app/data/car_classes';
import { getDiscipline } from 'app/data/disciplines';
import { findTrack } from 'app/data/tracks';
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
    <TableContainer
      sx={{
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
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
            const carClass = findCarClass(race.carClassId);
            if (!carClass) return null;
            const discipline = getDiscipline(carClass.disciplineId);
            const track = findTrack(race.trackId);
            if (!track) return null;
            const selected = index === props.selectedRaceIndex;
            return (
              <TableRow
                key={`${getCarClassId(carClass)}-${race.trackId}-${index}`}
                hover={true}
                selected={selected}
                onClick={() => props.onSelect(index)}
                sx={{
                  cursor: 'pointer',
                  '& td': {
                    transition: 'background-color 120ms ease',
                  },
                  '&.Mui-selected td': {
                    backgroundColor: 'rgba(31, 79, 143, 0.08)',
                  },
                  '&.Mui-selected:hover td': {
                    backgroundColor: 'rgba(31, 79, 143, 0.12)',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: selected ? 700 : 500 }}>
                  {discipline.name}
                </TableCell>
                <TableCell>{formatGrade(carClass.grade, true)}</TableCell>
                <TableCell>{carClass.name}</TableCell>
                <TableCell>
                  <Box sx={{ fontWeight: 500 }}>{track.name}</Box>
                </TableCell>
                <TableCell>{track.configuration ?? 'Standard'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
