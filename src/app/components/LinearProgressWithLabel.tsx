import * as React from 'react';

import { Box, LinearProgress, Typography } from '@mui/material';

export function LinearProgressWithLabel(props: {
  max: number;
  current: number;
  label?: string;
}) {
  const { max, current } = props;
  const label = props.label || `${current} / ${max}`;
  const height = 20;

  return (
    <Box sx={{ position: 'relative' }}>
      <LinearProgress
        variant="determinate"
        style={{ height }}
        value={Math.round((current / max) * 100)}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          px: 1,
          whiteSpace: 'nowrap',
          borderRadius: 3,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
