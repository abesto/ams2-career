import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';

import { PayloadAction } from '@reduxjs/toolkit';

import { WelcomeState } from './types';

export const initialState: WelcomeState = {
  hideWelcome: false,
};

const slice = createSlice({
  name: 'welcome',
  initialState,
  reducers: {
    hide(state, action: PayloadAction<void>) {
      state.hideWelcome = true;
    },
  },
});

export const { actions: welcomeActions } = slice;

export const useWelcomeSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useWelcomeSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
