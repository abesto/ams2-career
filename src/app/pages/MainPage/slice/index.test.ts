import {
  getCarClassesByName,
  getDisciplineOfCarClass,
} from 'app/data/car_classes';
import { getCarClassId } from 'types/CarClass';
import { getDisciplineId } from 'types/Discipline';
import { vi } from 'vitest';

import { mainPageActions, mainPageReducer, initialState } from './';
import { racegen } from '../racegen';

vi.mock('../racegen', () => ({
  racegen: vi.fn(),
}));

const clubGt5 = getCarClassesByName('GT5')[0];
const gtGt5 = getCarClassesByName('GT5')[1];
const gt3 = getCarClassesByName('GT3')[0];
const clubGt5Id = getCarClassId(clubGt5);
const gtGt5Id = getCarClassId(gtGt5);
const gt3Id = getCarClassId(gt3);
const clubDisciplineId = getDisciplineId(getDisciplineOfCarClass(clubGt5));
const gtDisciplineId = getDisciplineId(getDisciplineOfCarClass(gtGt5));

function race(carClassId: string) {
  return {
    generatedAt: 1,
    simTime: 2,
    trackId: 'track' as any,
    carClassId: carClassId as any,
    playerLevel: 1,
    aiLevel: 95,
  };
}

describe('main page slice', () => {
  beforeEach(() => {
    vi.mocked(racegen).mockReset();
  });

  it('keeps the last raced class selected when it is still available', () => {
    vi.mocked(racegen).mockImplementation(discipline => {
      if (discipline.name === 'Club') {
        return [race(clubGt5Id)];
      }
      if (discipline.name === 'GT') {
        return [race(gt3Id)];
      }
      return [];
    });

    const state = mainPageReducer(
      initialState,
      mainPageActions.generateRaces({
        career: {
          raceResults: [
            {
              ...race(clubGt5Id),
              racedAt: 3,
              position: 1,
              carId: 'car' as any,
            },
          ],
        } as any,
      }),
    );

    expect(state.selectedRaceIndex).toBe(0);
  });

  it('falls back to the same discipline when the exact last class is unavailable', () => {
    vi.mocked(racegen).mockImplementation(discipline =>
      discipline.name === 'GT' ? [race(gt3Id)] : [],
    );

    const state = mainPageReducer(
      initialState,
      mainPageActions.generateRaces({
        career: {
          raceResults: [
            {
              ...race(gtGt5Id),
              racedAt: 3,
              position: 1,
              carId: 'car' as any,
            },
          ],
        } as any,
      }),
    );

    expect(state.raceOptions).toHaveLength(1);
    expect(state.selectedRaceIndex).toBe(0);
    expect(
      getDisciplineId(getDisciplineOfCarClass(state.raceOptions[0].carClassId)),
    ).toBe(gtDisciplineId);
  });

  it('falls back to the first race when the previous discipline is unavailable', () => {
    vi.mocked(racegen).mockImplementation(discipline =>
      discipline.name === 'Club' ? [race(clubGt5Id)] : [],
    );

    const state = mainPageReducer(
      initialState,
      mainPageActions.generateRaces({
        career: {
          raceResults: [
            {
              ...race(gtGt5Id),
              racedAt: 3,
              position: 1,
              carId: 'car' as any,
            },
          ],
        } as any,
      }),
    );

    expect(state.selectedRaceIndex).toBe(0);
    expect(
      getDisciplineId(getDisciplineOfCarClass(state.raceOptions[0].carClassId)),
    ).toBe(clubDisciplineId);
  });

  it('resets options and stores ai/car selections', () => {
    const selected = mainPageReducer(
      initialState,
      mainPageActions.selectCar({
        carClassId: 'class' as any,
        carId: 'car' as any,
      }),
    );
    const adjusted = mainPageReducer(
      selected,
      mainPageActions.adjustAIDiscipline({ id: 'GT' as any, value: 2 }),
    );
    const reset = mainPageReducer(adjusted, mainPageActions.reset());

    expect(selected.selectedCars['class' as any]).toBe('car');
    expect(adjusted.aiAdjustment.discipline['GT' as any]).toBe(2);
    expect(reset.raceOptions).toEqual([]);
    expect(reset.selectedRaceIndex).toBe(0);
  });
});
