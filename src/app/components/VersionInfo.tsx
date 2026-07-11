import * as React from 'react';

import { Link, Typography } from '@mui/material';

import { buildInfo } from '../../buildInfo';

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
      {!import.meta.env.PROD ? (
        'dev'
      ) : (
        <>
          {buildInfo.commit.date}{' '}
          <Link
            color="inherit"
            underline="hover"
            target="_blank"
            href={`https://github.com/abesto/ams2-career/commit/${buildInfo.commit.hash}`}
          >
            {buildInfo.commit.hash}
          </Link>
        </>
      )}
    </Typography>
  );
}
