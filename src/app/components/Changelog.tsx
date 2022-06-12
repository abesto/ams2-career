import { parser as parseChangelog } from 'keep-a-changelog';
import Markdown from 'markdown-to-jsx';
import raw from 'raw.macro';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { useChangelogSlice } from 'app/slices/ChangelogSlice';
import { selectChangelog } from 'app/slices/ChangelogSlice/selectors';
import { cmpSemVer } from 'app/slices/ChangelogSlice/types';

const changelogText: string = raw('../../../CHANGELOG.md');

const changelog = parseChangelog(changelogText);

type Props = {};

export function Changelog(props: Props) {
  const [closed, setClosed] = React.useState(false);
  const dispatch = useDispatch();
  const { actions } = useChangelogSlice();

  const seenVersion = useSelector(selectChangelog).seenVersion;
  const releases = changelog.releases.filter(
    release => release.version && cmpSemVer(release.version, seenVersion) > 0,
  );

  function markCurrentVersionSeen() {
    const { major, minor, patch, raw } = releases[0].version!;
    dispatch(actions.setSeenVersion({ major, minor, patch, raw }));
  }

  // No changelog the first time the app is opened; use the current version as the latest one seen.
  if (seenVersion.raw === '0.0.0' && releases.length > 0) {
    markCurrentVersionSeen();
    return null;
  }

  // No changelog dialog if we have no updates
  if (releases.length === 0) {
    return null;
  }

  function handleClose() {
    markCurrentVersionSeen();
    setClosed(true);
  }

  return (
    <Dialog
      open={!closed}
      onClose={handleClose}
      maxWidth="md"
      transitionDuration={0}
    >
      <DialogTitle>Automobilista 2 Career Simulator - Changelog</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <em>
            Check out what changed since the last time you were here. The
            complete changelog is available{' '}
            <a href="https://github.com/abesto/ams2-career/blob/master/CHANGELOG.md">
              in the GitHub repository
            </a>
            .
          </em>
        </DialogContentText>
        {releases.map(release => (
          <Markdown key={release.version!.raw}>{release.toString()}</Markdown>
        ))}
      </DialogContent>
      <DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Got it!
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}