import { getAllCars, getCarsInClassAtTrack } from './cars';
import { getTracksFor } from './tracks';
import { getCarClassesByName } from './car_classes';
import type { TrackId } from '../../types/Track';

describe('downforce compatibility', () => {
  it('only exposes tracks with the same downforce variant as a car', () => {
    const lowCars = getAllCars().filter(car => car.downforceVariant === 'low');
    expect(lowCars.length).toBeGreaterThan(0);

    for (const car of getAllCars()) {
      for (const track of getTracksFor(car)) {
        expect(track.downforceVariant).toBe(car.downforceVariant);
      }
    }
  });

  it('exposes high-downforce Formula HiTech cars, not base cars, at Montreal Historic 1991', () => {
    const formulaClassicG1 = getCarClassesByName('Formula Classic G1')[0];
    const montrealHistoric1991 = 'Montreal_Historic_1991-210' as TrackId;
    const cars = getCarsInClassAtTrack(formulaClassicG1, montrealHistoric1991);

    expect(cars.map(car => car.name)).toContain(
      'Formula HiTech Gen1 Model1 - High Downforce',
    );
    expect(cars.map(car => car.name)).not.toContain(
      'Formula HiTech Gen1 Model1',
    );

    const highDownforceCar = getAllCars().find(
      car => car.name === 'Formula HiTech Gen1 Model1 - High Downforce',
    )!;
    const baseCar = getAllCars().find(
      car => car.name === 'Formula HiTech Gen1 Model1',
    )!;
    expect(getTracksFor(highDownforceCar).map(track => track.gameId)).toContain(
      montrealHistoric1991,
    );
    expect(getTracksFor(baseCar).map(track => track.gameId)).not.toContain(
      montrealHistoric1991,
    );
  });
});
