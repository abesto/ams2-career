import { ConnectivityState } from './types';

const initialState: ConnectivityState = {
  online: navigator.onLine,
};

export default initialState;
