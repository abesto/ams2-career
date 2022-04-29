import * as React from 'react';
import GitInfo from 'react-git-info/macro';

import { Link, Typography } from '@mui/material';

export function VersionInfo() {
  const gitInfo = GitInfo();
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
      {gitInfo.commit.date}{' '}
      <Link
        color="inherit"
        underline="hover"
        target="_blank"
        href={`https://github.com/abesto/ams2-career/commit/${gitInfo.commit.hash}`}
      >
        {gitInfo.commit.hash}
      </Link>
    </Typography>
  );
}
