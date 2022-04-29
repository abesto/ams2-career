import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { Box, Tab, Tabs } from '@mui/material';

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
        <h1>Data Debugger</h1>
        <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}>
          <Tab label="Save data" />
          <Tab label="XP Gain" />
          <Tab label="Cars / Tracks" />
        </Tabs>

        {tab === 0 && <SaveData />}
        {tab === 1 && <XpGain />}
        {tab === 2 && <CarsAndTracks />}
      </Box>
    </>
  );
}
