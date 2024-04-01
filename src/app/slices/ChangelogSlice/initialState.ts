import { ChangelogState } from './types';

const initialState: ChangelogState = {
  seenVersion: {
    raw: '0.0.0',
    major: 0,
    minor: 0,
    patch: 0,
  },
};

export default initialState;
