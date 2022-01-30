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
  Switch,
  Route,
  BrowserRouter,
  Link as RouterLink,
} from 'react-router-dom';

import { MainPage } from './pages/MainPage';
import { DataDebugPage } from './pages/DataDebugPage';
import { NotFoundPage } from './components/NotFoundPage';
import { useTranslation } from 'react-i18next';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';

export function App() {
  const { i18n } = useTranslation();
  return (
    <BrowserRouter>
      <Helmet
        titleTemplate="%s - AMS2 Career"
        htmlAttributes={{ lang: i18n.language }}
      >
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
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              <Button
                color="inherit"
                size="large"
                component={RouterLink}
                to="/"
              >
                Home
              </Button>
            </Typography>
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
          <Route component={NotFoundPage} />
        </Switch>
      </Container>
    </BrowserRouter>
  );
}
