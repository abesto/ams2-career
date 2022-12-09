import * as React from 'react';
import { useSelector } from 'react-redux';

import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';

import { getCarClassesIn } from 'app/data/car_classes';
import { getAllDisciplines, getDiscipline } from 'app/data/disciplines';
import { selectSettings } from 'app/slices/SettingsSlice/selectors';
import * as xp from 'app/xp';
import { CarId } from 'types/Car';
import { CarClass, CarClassId, getCarClassId } from 'types/CarClass';
import { Discipline, DisciplineId, getDisciplineId } from 'types/Discipline';
import { RaceResult } from 'types/Race';
import { TrackId } from 'types/Track';

interface Props {}

export function XpGain(props: Props) {
  const [disciplineId, setDisciplineId] = React.useState(
    'Club' as DisciplineId,
  );
  const discipline = getDiscipline(disciplineId);
  const classes = getCarClassesIn(discipline);

  const [carClassId, setCarClassId] = React.useState(
    getCarClassId(classes[0]!),
  );
  if (!classes.some(c => getCarClassId(c) === carClassId)) {
    setCarClassId(getCarClassId(classes[0]!));
  }

  const [aiLevel, setAiLevel] = React.useState(100);
  const [position, setPosition] = React.useState(5);

  const settings = useSelector(selectSettings);

  const result: RaceResult = {
    position: position,
    simTime: 0,
    racedAt: 0,
    carId: (carClassId + '-Fake') as CarId,
    generatedAt: 0,
    aiLevel: aiLevel,
    trackId: 'Fake' as TrackId,
    carClassId: carClassId,
    playerLevel: 0,
  };

  return (
    <>
      <div>
        <Box>
          <em>Watch out, any changed Settings affect these calculations.</em>
        </Box>
        <FormControl sx={{ m: 1 }}>
          <FormLabel>Discipline</FormLabel>
          <Select
            value={disciplineId}
            onChange={(e, _) => setDisciplineId(e.target.value as DisciplineId)}
          >
            {getAllDisciplines().map((discipline: Discipline) => (
              <MenuItem
                value={getDisciplineId(discipline)}
                key={getDisciplineId(discipline)}
              >
                {discipline.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1 }}>
          <FormLabel>Car Class</FormLabel>
          <Select
            value={carClassId}
            onChange={(e, _) => setCarClassId(e.target.value as CarClassId)}
          >
            {classes.map((carClass: CarClass) => (
              <MenuItem
                value={getCarClassId(carClass)}
                key={getCarClassId(carClass)}
              >
                {carClass.name} [grade={carClass.grade}]
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1 }}>
          <FormLabel>AI Level</FormLabel>
          <TextField
            type="number"
            value={aiLevel}
            onChange={e => setAiLevel(parseInt(e.target.value, 10))}
          />
        </FormControl>

        <FormControl sx={{ m: 1 }}>
          <FormLabel>Finishing Position</FormLabel>
          <TextField
            type="number"
            value={position}
            onChange={e => setPosition(parseInt(e.target.value, 10))}
          />
        </FormControl>
      </div>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Discipline</TableCell>
            <TableCell>Base</TableCell>
            <TableCell>Grade Multiplier</TableCell>
            <TableCell>AI Multiplier</TableCell>
            <TableCell>Position Multiplier</TableCell>
            <TableCell>Cross Discipline Multiplier</TableCell>
            <TableCell>Vehicle Multiplier</TableCell>
            <TableCell>Final XP</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {getAllDisciplines().map((thisDiscipline: Discipline) => (
            <TableRow key={thisDiscipline.name}>
              <TableCell>{thisDiscipline.name}</TableCell>
              <TableCell>{xp.getBaseXpGain()}</TableCell>
              <TableCell>{xp.getGradeMultiplier(result)}</TableCell>
              <TableCell>{xp.getAIMultiplier(result)}</TableCell>
              <TableCell>
                {xp.getPositionMultiplier(result, settings)}
              </TableCell>
              <TableCell>
                {xp.getCrossDisciplineMultiplier(
                  getDisciplineId(thisDiscipline),
                  result,
                  settings,
                )}
              </TableCell>
              <TableCell>{xp.getVehicleMultiplier(result)}</TableCell>
              <TableCell>
                {xp.xpGain(getDisciplineId(thisDiscipline), result, settings)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
