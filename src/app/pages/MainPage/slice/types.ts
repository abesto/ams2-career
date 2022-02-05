import { CarId } from 'types/Car';
import { CarClassId } from 'types/CarClass';
import { Race } from 'types/Race';

/* --- STATE --- */
export interface MainPageState {
  raceOptions: Race[];
  selectedRaceIndex: number | null;
  selectedCars: { [key: CarClassId]: CarId };
}
