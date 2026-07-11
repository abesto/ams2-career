import { render, screen } from '@testing-library/react';

import { Tracks } from './Tracks';

describe('Tracks', () => {
  it('renders rows with missing configuration values', () => {
    render(
      <Tracks
        tracks={[{ name: 'Azure Circuit', configuration: undefined } as any]}
        onHover={() => {}}
      />,
    );

    expect(screen.getByText('Azure Circuit')).toBeInTheDocument();
    expect(screen.getByLabelText('Configuration')).toHaveValue('');
  });
});
