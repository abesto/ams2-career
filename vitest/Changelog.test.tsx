import { parser as parseChangelog } from 'keep-a-changelog';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { Changelog } from '../src/app/components/Changelog';
import * as changelogActions from '../src/app/slices/ChangelogSlice';
import { semverWithRaw } from '../src/app/slices/ChangelogSlice/types';
import { render } from '../src/app/test-utils';
import { configureAppStore } from '../src/store/configureStore';
import changelogText from './test_CHANGELOG.md?raw';

const changelog = parseChangelog(changelogText);

describe('Changelog component', () => {
  it("Doesn't show changelog on first render", async () => {
    const { asFragment } = render(<Changelog changelog={changelog} />);
    expect(asFragment().hasChildNodes()).toBe(false);
  });

  it("Doesn't show changelog if we've seen the latest version", async () => {
    const store = configureAppStore({
      changelog: {
        seenVersion: semverWithRaw(changelog.releases[0]),
      },
    });
    store.dispatch(
      changelogActions.setSeenVersion(semverWithRaw(changelog.releases[0])),
    );
    const { asFragment } = render(<Changelog changelog={changelog} />, {
      store,
    });
    expect(asFragment().hasChildNodes()).toBe(false);
  });

  it('Shows the latest changelog entry when we saw the previous one', async () => {
    const store = configureAppStore({
      changelog: { seenVersion: semverWithRaw(changelog.releases[1]) },
    });
    const { getByTestId } = render(<Changelog changelog={changelog} />, {
      store,
    });
    const entries = getByTestId('changelog-entries');
    expect(entries).toHaveTextContent('1.2.1');
    expect(entries).toHaveTextContent(
      'When cross-discipline XP gains were disabled, there was no XP gained for races at all',
    );
  });
});
