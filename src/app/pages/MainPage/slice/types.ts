import { CarId } from 'types/Car';
import { CarClassId } from 'types/CarClass';
import { DisciplineId } from 'types/Discipline';
import { Race } from 'types/Race';

export interface AIAdjustment {
  global: number;
  discipline: { [key: DisciplineId]: number };
  carClass: { [key: CarClassId]: number };
  car: { [key: CarId]: number };
}

export interface AIAdjustmentInstance {
  global: number;
  discipline: number;
  carClass: number;
  car: number;
}

/* --- STATE --- */
export interface MainPageState {
  raceOptions: Race[];
  selectedRaceIndex: number | null;
  selectedCars: { [key: CarClassId]: CarId };
  aiAdjustment: AIAdjustment;
}
