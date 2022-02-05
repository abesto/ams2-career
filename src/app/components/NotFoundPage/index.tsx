import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { styled } from '@mui/material/styles';

import { P } from './P';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 Page Not Found</title>
        <meta name="description" content="Page not found" />
      </Helmet>
      <Wrapper>
        <Title>
          4
          <span role="img" aria-label="Crying Face">
            😢
          </span>
          4
        </Title>
        <P>Page not found.</P>
      </Wrapper>
    </>
  );
}

const Wrapper = styled('div')({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  minHeight: '320px',
});

const Title = styled('div')({
  marginTop: '-8vh',
  fontWeight: 'bold',
  color: 'black',
  fontSize: '3.375rem',

  span: {
    fontSize: '3.125rem',
  },
});
