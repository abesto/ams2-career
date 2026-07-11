import * as React from 'react';
import { Provider } from 'react-redux';

import { render as rtlRender } from '@testing-library/react';

import { configureAppStore } from '../store/configureStore';

export function render(
  ui: React.ReactElement,
  { store = configureAppStore(), ...renderOptions } = {},
) {
  function Wrapper({ children }: React.PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}
