import { versionForNewSaves } from 'store/saveload';

import { SaveMetaState } from './types';

const initialState: SaveMetaState = {
  timestamp: Date.now(),
  version: versionForNewSaves(),
};

export default initialState;
