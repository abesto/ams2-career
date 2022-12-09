import * as React from 'react';

import { fireEvent } from '@testing-library/react';

import { App } from './';
import { render } from './test-utils';

test('Basic sanity: a bunch of race results', async () => {
  const { findByRole, findByText, container } = render(<App />);
  const click = async (role, opts) =>
    fireEvent.click(await findByRole(role, opts));

  // Off we go then
  expect(container).toMatchSnapshot('first-load');

  // Click through the welcome dialog
  expect(await findByText('Welcome to the Automobilista 2 Career Simulator!'));
  await click('button', { name: /Next/i });
  expect(await findByText(/The Career tab will display your statistics/));
  await click('button', { name: /Don't show again/i });

  // Accept cookies
  expect(
    await findByText(
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
  expect(await findByText(/Race Results: P1 GT5/));
  expect(container).toMatchSnapshot('race-result');
  await click('button', { name: /Close/i });

  // 3 more wins
  await click('button', { name: /Record/i });
  expect(await findByText(/Race Results: P1 GT5/));
  await click('button', { name: /Close/i });
  await click('button', { name: /Record/i });
  expect(await findByText(/Race Results: P1 GT5/));
  await click('button', { name: /Close/i });
  await click('button', { name: /Record/i });
  expect(await findByText(/Race Results: P1 GT5/));

  // Level up!
  expect(
    await findByText("Congratulations, you've advanced to Grade C in GT!"),
  );
  expect(container).toMatchSnapshot('level-up');
  await click('button', { name: /Close/i });

  // Now let's get an achievement
  await click('button', { name: /Record/i });
  expect(await findByText(/Race Results: P1 Carrera Cup/));
  expect(await findByText(/Achieve maximum XP in Karting/));
  expect(container).toMatchSnapshot('achievement');
}, 15000);

test('Regenerate races', async () => {
  const {
    container,
    getByText,
    queryByText,
    findByText,
    findAllByText,
    findByTestId,
  } = render(<App />);

  // Starts disabled
  expect(queryByText(/regenerate races/i)).toBeNull();
  // findByRole('link') is f*cked unfortunately
  fireEvent.click(await findByText('Settings'));
  // findByRole('checkbox') is f*cked unfortunately for some reason, so here we go with the testid
  const checkbox = (await findByTestId('regenerate-races')) as HTMLInputElement;
  expect(checkbox.checked).toBe(false);

  // Can be enabled
  fireEvent.click(checkbox);
  expect(checkbox.checked).toBe(true);
  fireEvent.click(await findByText('Go Race!'));
  await findByText(/pick a race/i);
  expect(queryByText(/regenerate races/i)).not.toBeNull();

  // Actually regenerates races
  expect(
    // getAllByRole('row') is also f*cked, so...
    container
      .querySelectorAll('tr.MuiTableRow-root')[1]
      .querySelectorAll('td')[3].textContent,
  ).toEqual('Córdoba');
  fireEvent.click(getByText(/regenerate races/i));
  await findAllByText('Copa Classic (Class: B)');
  expect(
    container
      .querySelectorAll('tr.MuiTableRow-root')[1]
      .querySelectorAll('td')[3].textContent,
  ).toEqual('Campo Grande');
});
