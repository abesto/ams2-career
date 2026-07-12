import { getAllCars } from './cars';
import { getTracksFor } from './tracks';
import { getCarClassesByName } from './car_classes';

describe('downforce compatibility', () => {
  it('only exposes tracks with the same downforce variant as a car', () => {
    const lowCars = getAllCars().filter(car => car.downforceVariant === 'low');
    expect(lowCars).toHaveLength(0);

    for (const car of getAllCars()) {
      for (const track of getTracksFor(car)) {
        expect(track.downforceVariant).toBe(car.downforceVariant);
      }
    }
  });

  it('does not expose AI-only safety cars', () => {
    const carNames = getAllCars().map(car => car.name);
    expect(carNames).not.toContain('Puma GTB SC');
    expect(carNames).not.toContain('BMW M4 SC');
  });

  it('does not put non-karts on kart layouts', () => {
    const gt3Tracks = getTracksFor(getCarClassesByName('GT3')[0]);
    const kartTracks = getTracksFor(getCarClassesByName('Karting 125CC')[0]);

    expect(gt3Tracks.map(track => track.gameId)).not.toContain(
      'InterlagosKart1-48',
    );
    expect(kartTracks.map(track => track.gameId)).toContain(
      'InterlagosKart1-48',
    );
  });

  it('does not put prototypes on point-to-point road stages', () => {
    const prototypeTracks = getTracksFor(getCarClassesByName('P1')[0]);

    expect(prototypeTracks.map(track => track.gameId)).not.toContain(
      'California_Highway_Full-14',
    );
  });

  it('keeps base cars with AI-only aero variants selectable', () => {
    const formulaUltimate = getAllCars().find(
      car => car.name === 'Formula Ultimate Hybrid Gen3',
    );
    expect(formulaUltimate).toBeDefined();
    expect(
      formulaUltimate &&
        getTracksFor(formulaUltimate).some(
          track => track.gameId === 'Bannochbrae1-5',
        ),
    ).toBe(true);
  });
});
