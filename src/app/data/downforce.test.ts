import { getAllCars } from './cars';
import { getTracksFor } from './tracks';

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
});
