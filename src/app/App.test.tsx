import * as React from 'react';

import { fireEvent } from '@testing-library/react';

import { App } from './';
import { render } from './test-utils';

test('Basic sanity: a bunch of race results', async () => {
  const { findByRole, findByText, container } = render(<App />);
  // A few convenience shorthands
  const snapshot = (name: string) => expect(container).toMatchSnapshot(name);
  const click = async (role, opts) =>
    fireEvent.click(await findByRole(role, opts));
  const expectText = async text => expect(await findByText(text));

  // Off we go then
  snapshot('first-load');

  // Click through the welcome dialog
  await expectText('Welcome to the Automobilista 2 Career Simulator!');
  await click('button', { name: /Next/i });
  await expectText(/The Career tab will display your statistics/);
  await click('button', { name: /Don't show again/i });

  // Accept cookies
  await expectText('This website uses cookies to enhance the user experience.');
  await click('button', { name: /accept cookies/i });
  snapshot('after-dialogs');

  // Pick a class
  await click('cell', { name: /GT5/i });
  snapshot('after-class-pick');

  // Race result dialog
  await click('button', { name: /Record/i });
  await expectText(/Race Results/);
  snapshot('race-result');
  await click('button', { name: /Close/i });

  // 3 more wins
  await click('button', { name: /Record/i });
  await click('button', { name: /Close/i });
  await click('button', { name: /Record/i });
  await click('button', { name: /Close/i });
  await click('button', { name: /Record/i });

  // Level up!
  await expectText("Congratulations, you've advanced to Grade C in GT!");
  snapshot('level-up');
  await click('button', { name: /Close/i });

  // Now let's get an achievement
  await click('button', { name: /Record/i });
  await expectText(/Achieve maximum XP in Karting/);
  snapshot('achievement');
}, 15000);
