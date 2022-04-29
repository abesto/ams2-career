/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BrowserRouter,
  Link as RouterLink,
  Route,
  Switch,
} from 'react-router-dom';

import DataObjectIcon from '@mui/icons-material/DataObject';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Consistency } from './components/Consistency';
import { Export } from './components/Export';
import { ExportReminder } from './components/ExportReminder';
import { Import } from './components/Import';
import { NotFoundPage } from './components/NotFoundPage';
import { VersionInfo } from './components/VersionInfo';
import { Welcome } from './components/Welcome';
import { CareerPage } from './pages/CareerPage';
import { DataDebugPage } from './pages/DataDebugPage';
import { MainPage } from './pages/MainPage';

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

export function App() {
  const [forceWelcome, setForceWelcome] = React.useState(false);

  return (
    <BrowserRouter>
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

        <Switch>
          <Route exact path="/" component={MainPage} />
          <Route exact path="/debug" component={DataDebugPage} />
          <Route exact path="/career" component={CareerPage} />
          <Route component={NotFoundPage} />
        </Switch>

        <ExportReminder />
        <VersionInfo />
      </Container>
    </BrowserRouter>
  );
}
