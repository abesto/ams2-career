/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import {
  BrowserRouter,
  Link as RouterLink,
  Route,
  Routes,
} from 'react-router-dom';

import {
  DataObject as DataObjectIcon,
  GitHub as GitHubIcon,
  Help as HelpIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  IconButtonProps,
  Link,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { usePageViews } from '../utils/analytics';
import { Changelog } from './components/Changelog';
import { Consistency } from './components/Consistency';
import { Export } from './components/Export';
import { ExportReminder } from './components/ExportReminder';
import { Import } from './components/Import';
import { NotFoundPage } from './components/NotFoundPage';
import { OurCookieConsent } from './components/OurCookieConsent';
import { VersionInfo } from './components/VersionInfo';
import { Welcome } from './components/Welcome';
import { CareerPage } from './pages/CareerPage';
import { DataDebugPage } from './pages/DataDebugPage';
import { MainPage } from './pages/MainPage';
import { SettingsPage } from './pages/SettingsPage';
import { useConnectivitySlice } from './slices/ConnectivitySlice';

type ToolbarButtonProps<D extends React.ElementType> = IconButtonProps<D> & {
  icon: React.ReactNode;
  label: string;
};

function ToolbarButton<D extends React.ElementType>(
  props: ToolbarButtonProps<D>,
) {
  return (
    <Tooltip title={props.label}>
      <IconButton
        component={props.component || Link}
        aria-label={props.label}
        target="_blank"
        color="inherit"
        {...props}
      >
        {props.icon}
      </IconButton>
    </Tooltip>
  );
}

function InnerApp() {
  const [forceWelcome, setForceWelcome] = React.useState(false);
  const { actions: connectivityActions } = useConnectivitySlice();
  const dispatch = useDispatch();

  // Hook up the connectivity checker
  React.useEffect(() => {
    window.addEventListener('online', () => {
      dispatch(connectivityActions.update(true));
    });
    window.addEventListener('offline', () => {
      dispatch(connectivityActions.update(false));
    });
  }, [dispatch, connectivityActions]);

  usePageViews();

  return (
    <>
      <Helmet titleTemplate="%s - AMS2 Career">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Helmet>
      <CssBaseline />

      <Consistency />
      <Welcome
        forceShow={forceWelcome}
        onClose={() => setForceWelcome(false)}
      />
      <Changelog />
      <OurCookieConsent />

      <Container maxWidth={false}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              <Button
                color="inherit"
                size="large"
                component={RouterLink}
                to="/"
              >
                Go Race!
              </Button>
            </Typography>

            <Button
              color="inherit"
              size="small"
              component={RouterLink}
              to="/career"
            >
              Career
            </Button>

            <Button
              color="inherit"
              size="small"
              component={RouterLink}
              to="/settings"
            >
              Settings
            </Button>

            <Export color="inherit" size="small" sx={{ ml: 2 }} />
            <Import color="inherit" size="small" />

            <Box sx={{ flexGrow: 1 }} />

            <ToolbarButton
              label="Help"
              icon={<HelpIcon />}
              component={Link}
              onClick={() => setForceWelcome(true)}
            />
            <ToolbarButton
              label="Wiki (new tab)"
              icon={<MenuBookIcon />}
              href="https://github.com/abesto/ams2-career/wiki"
            />
            <ToolbarButton
              label="GitHub (new tab)"
              icon={<GitHubIcon />}
              href="https://github.com/abesto/ams2-career/"
            />
            <ToolbarButton
              label="Data Debugger"
              icon={<DataObjectIcon />}
              component={RouterLink}
              to="/debug"
              target=""
            />
          </Toolbar>
        </AppBar>

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/debug" element={<DataDebugPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route element={<NotFoundPage />} />
        </Routes>

        <ExportReminder />
        <VersionInfo />
      </Container>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
}
