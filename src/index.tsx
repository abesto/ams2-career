/**
 * index.tsx
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
// Initialize languages
import './locales/i18n';

// Import root app
import { App } from 'app';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import reportWebVitals from 'reportWebVitals';
import { configureAppStore } from 'store/configureStore';

import Button from '@mui/material/Button';

const store = configureAppStore();
const MOUNT_NODE = document.getElementById('root') as HTMLElement;

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

// Hot reloadable translation json files
if (module.hot) {
  module.hot.accept(['./locales/i18n'], () => {
    // No need to render the App again because i18next works with the hooks
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
