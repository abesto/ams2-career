import { CarSpec } from 'types/CarSpec';
import { TrackSpec } from 'types/TrackSpec';

/* --- STATE --- */
export interface DataDebugPageSliceState {
  hoveredCar: CarSpec | null;
  hoveredTrack: TrackSpec | null;
}
