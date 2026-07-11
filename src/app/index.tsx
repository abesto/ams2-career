/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import { parser as parseChangelog } from 'keep-a-changelog';
import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import {
  BrowserRouter,
  Link as RouterLink,
  Route,
  Routes,
  useLocation,
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
  Stack,
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

import changelogText from '../../CHANGELOG.md?raw';

type ToolbarButtonProps<D extends React.ElementType> = IconButtonProps<D> & {
  icon: React.ReactNode;
  label: string;
};

function ToolbarButton<D extends React.ElementType>(
  props: ToolbarButtonProps<D>,
) {
  const target = props.href ? '_blank' : undefined;

  return (
    <Tooltip title={props.label}>
      <IconButton
        component={props.component}
        aria-label={props.label}
        target={target}
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
  const location = useLocation();

  // Hook up the connectivity checker
  React.useEffect(() => {
    window.addEventListener('online', () => {
      dispatch(connectivityActions.update(true));
    });
    window.addEventListener('offline', () => {
      dispatch(connectivityActions.update(false));
    });
  }, [dispatch, connectivityActions]);

  // Send analytics about page views
  usePageViews();

  const changelog = parseChangelog(changelogText);

  return (
    <HelmetProvider>
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
      <Changelog changelog={changelog} />
      <OurCookieConsent />

      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="sticky">
          <Container
            maxWidth={false}
            sx={{ maxWidth: 1760, px: { xs: 2, sm: 3 } }}
          >
            <Toolbar
              disableGutters
              sx={{
                minHeight: 72,
                gap: 2,
                flexWrap: 'wrap',
                py: 1.5,
              }}
            >
              <Box sx={{ mr: { xs: 0, md: 1 } }}>
                <Typography variant="subtitle1">AMS2 Career</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(248, 250, 252, 0.72)' }}
                >
                  Career companion for Automobilista 2
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Button
                  color="inherit"
                  variant={location.pathname === '/' ? 'contained' : 'text'}
                  component={RouterLink}
                  to="/"
                  sx={{
                    color: 'inherit',
                    ...(location.pathname === '/'
                      ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.16)',
                        }
                      : {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }),
                  }}
                >
                  Go Race!
                </Button>
                <Button
                  color="inherit"
                  variant={
                    location.pathname === '/career' ? 'contained' : 'text'
                  }
                  component={RouterLink}
                  to="/career"
                  sx={{
                    color: 'inherit',
                    ...(location.pathname === '/career'
                      ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.16)',
                        }
                      : {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }),
                  }}
                >
                  Career
                </Button>
                <Button
                  color="inherit"
                  variant={
                    location.pathname === '/settings' ? 'contained' : 'text'
                  }
                  component={RouterLink}
                  to="/settings"
                  sx={{
                    color: 'inherit',
                    ...(location.pathname === '/settings'
                      ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.16)',
                        }
                      : {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }),
                  }}
                >
                  Settings
                </Button>
              </Stack>

              <Stack direction="row" spacing={0.5} sx={{ ml: { md: 1 } }}>
                <Export color="inherit" size="small" />
                <Import color="inherit" size="small" />
              </Stack>

              <Box sx={{ flexGrow: 1 }} />

              <Stack direction="row" spacing={0.5}>
                <ToolbarButton
                  label="Help"
                  icon={<HelpIcon />}
                  onClick={() => setForceWelcome(true)}
                />
                <ToolbarButton
                  label="Wiki (new tab)"
                  icon={<MenuBookIcon />}
                  component="a"
                  href="https://github.com/abesto/ams2-career/wiki"
                />
                <ToolbarButton
                  label="GitHub (new tab)"
                  icon={<GitHubIcon />}
                  component="a"
                  href="https://github.com/abesto/ams2-career/"
                />
                <ToolbarButton
                  label="Data Debugger"
                  icon={<DataObjectIcon />}
                  component={RouterLink}
                  to="/debug"
                  target=""
                />
              </Stack>
            </Toolbar>
          </Container>
        </AppBar>

        <Container
          maxWidth={false}
          sx={{ maxWidth: 1760, px: { xs: 2, sm: 3 }, py: { xs: 3, md: 4 } }}
        >
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
      </Box>
    </HelmetProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
}
