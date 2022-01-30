import { CarSpec } from 'types/CarSpec';
import { TrackSpec } from 'types/TrackSpec';

/* --- STATE --- */
export interface HomePageSliceState {
  hoveredCar: CarSpec | null;
  hoveredTrack: TrackSpec | null;
}
