import * as React from 'react';
import { Provider } from 'react-redux';

import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

import { configureAppStore } from '../store/configureStore';
import { appTheme } from './theme';

export function render(
  ui: React.ReactElement,
  { store = configureAppStore(), ...renderOptions } = {},
) {
  function Wrapper({ children }: React.PropsWithChildren) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={appTheme}>{children}</ThemeProvider>
      </Provider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}
