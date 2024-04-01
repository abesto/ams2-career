import { createSlice } from '@reduxjs/toolkit';

import { WelcomeState } from './types';

export const initialState: WelcomeState = {
  hideWelcome: false,
};

const slice = createSlice({
  name: 'welcome',
  initialState,
  reducers: {
    hide(state) {
      state.hideWelcome = true;
    },
    show(state) {
      state.hideWelcome = false;
    },
  },
});

export const { hide, show } = slice.actions;
export default slice.reducer;
