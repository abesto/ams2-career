import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { configureAppStore } from 'store/configureStore';

import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';

// Import root app
import { App } from 'app';
import { Export } from 'app/components/Export';
import { appTheme } from 'app/theme';

const store = configureAppStore();
const MOUNT_NODE = document.getElementById('root') as HTMLElement;

class ExportWithErrorBoundary extends React.Component<
  {},
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error(error);
    return { hasError: true };
  }

  public render() {
    return this.state.hasError ? (
      '(Failed to render export button)'
    ) : (
      <Export />
    );
  }
}

class DropLocalStorageOnErrorBoundary extends React.Component<
  { children?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error(error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <h1>Something went wrong.</h1>
          <p>
            It's very likely that your saved state is incompatible with the
            current version of the application. Click the button below to clear
            application state, then reload the page.
          </p>
          <p>You may try to download the current state here:</p>
          <ExportWithErrorBoundary />
          <p>
            You may try to manually download the saved state from the local
            storage of the browser (in the Storage tab of the developer tools).
          </p>
          <Button color="error" onClick={() => window.localStorage.clear()}>
            Clear state
          </Button>
        </>
      );
    }

    return this.props.children;
  }
}

const root = createRoot(MOUNT_NODE);
root.render(
  <Provider store={store}>
    <HelmetProvider>
      <ThemeProvider theme={appTheme}>
        <React.StrictMode>
          <DropLocalStorageOnErrorBoundary>
            <App />
          </DropLocalStorageOnErrorBoundary>
        </React.StrictMode>
      </ThemeProvider>
    </HelmetProvider>
  </Provider>,
);
