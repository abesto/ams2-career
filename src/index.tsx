/**
 * index.tsx
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

// Import root app
import { App } from 'app';
import { Export } from 'app/components/Export';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import reportWebVitals from 'reportWebVitals';
import { configureAppStore } from 'store/configureStore';

import Button from '@mui/material/Button';

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

ReactDOM.render(
  <Provider store={store}>
    <HelmetProvider>
      <React.StrictMode>
        <DropLocalStorageOnErrorBoundary>
          <App />
        </DropLocalStorageOnErrorBoundary>
      </React.StrictMode>
    </HelmetProvider>
  </Provider>,
  MOUNT_NODE,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
