import { formatTrackLabel, getTrackLabels } from './trackNames';

describe('track labels', () => {
  it('formats engine identifiers into readable labels', () => {
    expect(formatTrackLabel('Nurburgring_GP_2020')).toBe('Nurburgring GP 2020');
    expect(formatTrackLabel('California_Highway_Stage2')).toBe(
      'California Highway Stage 2',
    );
    expect(formatTrackLabel('Hockenheim_RX')).toBe('Hockenheim Rallycross');
  });

  it('does not repeat track names in configuration labels', () => {
    expect(
      getTrackLabels({
        name: 'California_Highway_Full',
        variation: 'Full',
        category: 'California_Highway',
      }),
    ).toEqual({
      name: 'California Highway',
      configuration: 'Full',
      category: 'California Highway',
    });
  });

  it('uses the track category when the game does not provide one', () => {
    expect(getTrackLabels({ name: 'Tykki_RX', variation: 'Tykki_RX' })).toEqual(
      {
        name: 'Tykki Rallycross',
        configuration: '',
        category: 'Tykki Rallycross',
      },
    );
  });

  it('groups year-specific Spa configurations under the game circuit name', () => {
    expect(
      getTrackLabels({
        name: 'Spa_Francorchamps_1993',
        variation: 'Spa_Francorchamps_1993',
        category: 'Spa_Francorchamps_1993',
      }),
    ).toEqual({
      name: 'Spa Francorchamps',
      configuration: '1993',
      category: 'Spa Francorchamps',
    });
  });

  it('uses the proper Nürburgring spelling for abbreviated game groups', () => {
    expect(
      getTrackLabels({
        name: 'Nurb_1971_Nords',
        variation: 'Nurb_1971_Nords',
        category: 'Nurb_1971',
      }),
    ).toMatchObject({
      name: 'Nürburgring',
      category: 'Nürburgring',
      configuration: '1971 Nords',
    });
  });

  it('removes the game family prefix from Nürburgring configurations', () => {
    expect(
      getTrackLabels({
        name: 'Nurb_GP_2020',
        variation: 'Nurb_GP_2020',
        category: 'Nurburgring_2020',
      }),
    ).toMatchObject({
      name: 'Nürburgring',
      configuration: 'GP 2020',
    });
  });

  it('removes the abbreviated prefix from generated Nürburgring configurations', () => {
    expect(
      getTrackLabels({
        name: 'Nurb_GP_2020',
        category: 'Nurburgring_2020',
        displayConfiguration: 'Nurb GP 2020',
      }),
    ).toMatchObject({
      name: 'Nürburgring',
      configuration: 'GP 2020',
    });
  });
});
