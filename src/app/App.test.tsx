import * as React from 'react';

import { fireEvent } from '@testing-library/react';

import { App } from './';
import { render } from './test-utils';

// Generating race dates is inconsistent (due to floating point inaccuracies?) even with Math.random
// mocked out. Solution: directly mock out randomDateBetween.
jest.mock('app/pages/MainPage/racegen', () => {
  const original = jest.requireActual('app/pages/MainPage/racegen');
  return {
    ...original,
    randomDateBetween: 3,
  };
});

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
