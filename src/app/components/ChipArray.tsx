import * as React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

export const ChipArrayListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export function ChipArray(props: { strings: string[] }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        justifyContent: 'left',
        flexWrap: 'wrap',
        listStyle: 'none',
        p: 0.5,
        m: 0,
      }}
      component="ul"
    >
      {props.strings.map((s, i) => (
        <ChipArrayListItem key={i}>
          <Chip label={s} />
        </ChipArrayListItem>
      ))}
    </Box>
  );
}
