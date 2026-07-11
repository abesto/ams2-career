import * as React from 'react';
import { vi } from 'vitest';

import { fireEvent, screen } from '@testing-library/react';

import { App } from './';
import { render } from './test-utils';

beforeEach(() => {
  let calls = 0;
  vi.spyOn(Math, 'random').mockImplementation(() => ((calls++ % 10) + 1) / 20);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('Basic sanity: a bunch of race results', async () => {
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  const { container } = render(<App />);
  const click = async (role, opts) =>
    fireEvent.click(await screen.findByRole(role, opts));

  // Off we go then
  expect(container).toMatchSnapshot('first-load');

  // Click through the welcome dialog
  expect(
    await screen.findByText('Welcome to the Automobilista 2 Career Simulator!'),
  );
  await click('button', { name: /Next/i });
  expect(
    await screen.findByText(/The Career tab will display your statistics/),
  );
  await click('button', { name: /Don't show again/i });

  // Accept cookies
  expect(
    await screen.findByText(
      'This website uses cookies to enhance the user experience.',
    ),
  );
  await click('button', { name: /accept cookies/i });
  expect(container).toMatchSnapshot('after-dialogs');

  // Pick a class
  await click('cell', { name: /GT5/i });
  expect(container).toMatchSnapshot('after-class-pick');

  // Race result dialog
  await click('button', { name: /Record/i });
  expect(await screen.findByText(/Race Results: P1 GT5/));
  expect(container).toMatchSnapshot('race-result');
  await click('button', { name: /Close/i });

  // 3 more wins
  await click('button', { name: /Record/i });
  expect(await screen.findByText(/Race Results: P1 GT5/));
  await click('button', { name: /Close/i });
  await click('button', { name: /Record/i });
  expect(await screen.findByText(/Race Results: P1 GT5/));
  await click('button', { name: /Close/i });
  await click('button', { name: /Record/i });
  expect(await screen.findByText(/Race Results: P1 GT5/));

  // Level up!
  expect(
    await screen.findByText(
      "Congratulations, you've advanced to Grade C in GT!",
    ),
  );
  expect(container).toMatchSnapshot('level-up');
  await click('button', { name: /Close/i });

  // Now let's get an achievement
  await click('button', { name: /Record/i });
  expect(await screen.findByText(/Race Results: P1 Carrera Cup/));
  expect(await screen.findByText(/Achieve maximum XP in Karting/));
  expect(container).toMatchSnapshot('achievement');
  expect(consoleError).not.toHaveBeenCalledWith(
    expect.stringContaining(
      'A component rendering a native <button> resolved to a non-<button> element',
    ),
  );
}, 15000);

test('Regenerate races', async () => {
  const { container } = render(<App />);

  // Starts disabled
  expect(screen.queryByText(/regenerate races/i)).toBeNull();
  // findByRole('link') is f*cked unfortunately
  fireEvent.click(await screen.findByText('Settings'));
  // findByRole('checkbox') is f*cked unfortunately for some reason, so here we go with the testid
  const checkbox = (await screen.findByTestId(
    'regenerate-races',
  )) as HTMLInputElement;
  expect(checkbox.checked).toBe(false);

  // Can be enabled
  fireEvent.click(checkbox);
  expect(checkbox.checked).toBe(true);
  fireEvent.click(await screen.findByText('Go Race!'));
  await screen.findByText(/pick a race/i);
  expect(screen.getByText(/regenerate races/i)).toBeInTheDocument();

  // Actually regenerates races
  /* eslint-disable testing-library/no-container, testing-library/no-node-access */
  const firstTrack = container
    .querySelectorAll('tr.MuiTableRow-root')[1]
    .querySelectorAll('td')[3].textContent;
  fireEvent.click(screen.getByText(/regenerate races/i));
  await screen.findAllByText('Copa Classic (Class: B)');
  expect(
    container
      .querySelectorAll('tr.MuiTableRow-root')[1]
      .querySelectorAll('td')[3].textContent,
  ).not.toEqual(firstTrack);
  /* eslint-enable testing-library/no-container, testing-library/no-node-access */
});
