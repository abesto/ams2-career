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
      name: 'California Highway Full',
      configuration: '',
      category: 'California Highway',
    });
  });

  it('uses the track category when the game does not provide one', () => {
    expect(
      getTrackLabels({ name: 'Tykki_RX', variation: 'Tykki_RX' }),
    ).toEqual({
      name: 'Tykki Rallycross',
      configuration: '',
      category: 'Tykki Rallycross',
    });
  });
});
