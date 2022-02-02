import { CarSpec } from './CarSpec';
import { TrackSpec } from './TrackSpec';

export interface Race {
  readonly generatedAt: number; // JS timestamp
  readonly simtime: number;
  readonly car: CarSpec;
  readonly track: TrackSpec;
}

export interface RaceResult extends Race {
  readonly racedAt: number; // JS timestamp
  readonly position: number;
}
