import React from 'react';
import * as GitInfo from '~build/git';

import { Link, Typography } from '@mui/material';

export function VersionInfo() {
  return (
    <Typography
      className="version-info"
      variant="body2"
      sx={{
        textAlign: 'right',
        padding: '0.3rem',
        fontSize: '0.8em',
        color: 'lightGray',
      }}
    >
      {process.env.NODE_ENV !== 'production' ? (
        'dev'
      ) : (
        <>
          {GitInfo.committerDate}{' '}
          <Link
            color="inherit"
            underline="hover"
            target="_blank"
            href={`https://github.com/abesto/ams2-career/commit/${GitInfo.sha}`}
          >
            {GitInfo.sha}
          </Link>
        </>
      )}
    </Typography>
  );
}
