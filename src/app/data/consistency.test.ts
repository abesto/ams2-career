import { checkConsistency } from './consistency';

describe('data', () => {
  it('passes all consistency checks', () => {
    expect([...checkConsistency()]).toHaveLength(0);
  });
});
