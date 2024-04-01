import { MainPageState } from './types';

const initialState: MainPageState = {
  raceOptions: [],
  selectedRaceIndex: 0,
  selectedCars: {},
  aiAdjustment: {
    global: 0,
    discipline: {},
    carClass: {},
    car: {},
  },
};

export default initialState;
