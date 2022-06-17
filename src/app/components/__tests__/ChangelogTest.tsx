import { parser as parseChangelog } from 'keep-a-changelog';
import raw from 'raw.macro';
import * as React from 'react';
import { configureAppStore } from 'store/configureStore';

import { within } from '@testing-library/react';

import { Changelog } from 'app/components/Changelog';
import { changelogActions } from 'app/slices/ChangelogSlice';
import { simpleSemVer } from 'app/slices/ChangelogSlice/types';
import { render } from 'app/test-utils';

const changelogText = raw('./test_CHANGELOG.md');
const changelog = parseChangelog(changelogText);

describe('Changelog component', () => {
  it("Doesn't show changelog on first render", async () => {
    const { asFragment } = render(<Changelog changelog={changelog} />);
    expect(asFragment().hasChildNodes()).toBe(false);
  });

  it("Doesn't show changelog if we've seen the latest version", async () => {
    const store = configureAppStore({
      changelog: { seenVersion: simpleSemVer(changelog.releases[0].version!) },
    });
    store.dispatch(
      changelogActions.setSeenVersion(
        simpleSemVer(changelog.releases[0].version!),
      ),
    );
    const { asFragment } = render(<Changelog changelog={changelog} />, {
      store,
    });
    expect(asFragment().hasChildNodes()).toBe(false);
  });

  it('Shows the latest changelog entry when we saw the previous one', async () => {
    const store = configureAppStore({
      changelog: { seenVersion: simpleSemVer(changelog.releases[1].version!) },
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
