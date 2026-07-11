import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';

import { CarsAndTracks } from './components/CarsAndTracks';
import { SaveData } from './components/SaveData';
import { XpGain } from './components/XpGain';

export function DataDebugPage() {
  const [tab, setTab] = React.useState(0);

  return (
    <>
      <Helmet>
        <title>Data Debugger</title>
      </Helmet>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Data Debugger
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Internal tools for inspecting save data, XP calculations, and content
          tables.
        </Typography>

        <Paper sx={{ overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}>
            <Tab label="Save data" />
            <Tab label="XP Gain" />
            <Tab label="Cars / Tracks" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tab === 0 && <SaveData />}
            {tab === 1 && <XpGain />}
            {tab === 2 && <CarsAndTracks />}
          </Box>
        </Paper>
      </Box>
    </>
  );
}
