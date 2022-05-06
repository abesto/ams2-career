import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { ConnectivityState } from './types';

export const initialState: ConnectivityState = {
  online: navigator.onLine,
};

const slice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    update(state, action: PayloadAction<boolean>) {
      state.online = action.payload;
    },
  },
});

export const { actions: connectivityActions } = slice;

export const useConnectivitySlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useConnectivitySlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
