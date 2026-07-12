import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';

import { CarExplorerPage } from '../CarExplorerPage';
import { MatrixExplorerPage } from '../MatrixExplorerPage';
import { TrackExplorerPage } from '../TrackExplorerPage';

export function GameDataPage() {
  const [tab, setTab] = React.useState(0);

  return (
    <>
      <Helmet>
        <title>Game Data</title>
      </Helmet>
      <Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Game Data
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Canonical Automobilista 2 cars, tracks, and their compatibility.
        </Typography>
        <Paper sx={{ overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab label="Cars" />
            <Tab label="Tracks" />
            <Tab label="Compatibility" />
          </Tabs>
          <Box sx={{ p: 3 }}>
            {tab === 0 && <CarExplorerPage />}
            {tab === 1 && <TrackExplorerPage />}
            {tab === 2 && <MatrixExplorerPage />}
          </Box>
        </Paper>
      </Box>
    </>
  );
}
