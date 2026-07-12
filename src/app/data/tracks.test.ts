import { getTrack } from './tracks';
import type { TrackId } from '../../types/Track';

describe('game track configurations', () => {
  it('keeps a configuration separate from its parent circuit label', () => {
    expect(getTrack('California_Highway_Full-14' as TrackId)).toMatchObject({
      name: 'California Highway',
      configuration: 'Full',
    });
  });
});
