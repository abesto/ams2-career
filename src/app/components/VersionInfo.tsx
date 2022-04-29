import * as React from 'react';
import GitInfo from 'react-git-info/macro';

import Typography from '@mui/material/Typography';

export function VersionInfo() {
  const gitInfo = GitInfo();
  return (
    <Typography
      className="version-info"
      variant="body2"
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        padding: '0.3rem',
        fontSize: '0.8em',
        color: 'gray',
      }}
    >
      {gitInfo.commit.date} {gitInfo.commit.hash}
    </Typography>
  );
}
