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

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { Export } from './components/Export';
import { ExportReminder } from './components/ExportReminder';
import { Import } from './components/Import';
import { NotFoundPage } from './components/NotFoundPage';
import { CareerPage } from './pages/CareerPage';
import { DataDebugPage } from './pages/DataDebugPage';
import { MainPage } from './pages/MainPage';

export function App() {
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

            <Button
              color="inherit"
              size="small"
              component={RouterLink}
              to="/debug"
            >
              Data Debugger
            </Button>
          </Toolbar>
        </AppBar>

        <Switch>
          <Route exact path="/" component={MainPage} />
          <Route exact path="/debug" component={DataDebugPage} />
          <Route exact path="/career" component={CareerPage} />
          <Route component={NotFoundPage} />
        </Switch>

        <ExportReminder />
      </Container>
    </BrowserRouter>
  );
}
