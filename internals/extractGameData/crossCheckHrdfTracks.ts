import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';
import { stringify } from 'csv-stringify/sync';

const OUTPUT_DIR = path.resolve('build/extracted/ams2');
const GROUP_BOUNDARIES = new Set([
  'Vehicles',
  'Motorsports',
  'Events',
  'Contracts',
  'Accolades',
  'Liveries',
  'MotorsportTeams',
]);

type Track = {
  internal_id: string;
  hud_map_name: string;
  app_name: string;
  app_configuration: string;
};

type Candidate = {
  entry_index: string;
  strings: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function main() {
  const tracks = Papa.parse<Track>(
    readFileSync(path.join(OUTPUT_DIR, 'tracks.csv'), 'utf8'),
    { header: true, skipEmptyLines: true },
  ).data as Track[];
  const candidates = Papa.parse<Candidate>(
    readFileSync(path.join(OUTPUT_DIR, 'hrdf_track_candidates.csv'), 'utf8'),
    { header: true, skipEmptyLines: true },
  ).data as Candidate[];
  const byId = new Map<string, Track>();
  for (const track of tracks) {
    byId.set(normalize(track.internal_id.replace(/^AUT_/, '')), track);
  }
  const rows: object[] = [];
  const matched = new Set<string>();
  const groupNames = new Set<string>();

  for (const candidate of candidates) {
    const tokens = candidate.strings.split('|');
    const trackIndex = tokens.indexOf('Tracks');
    if (trackIndex < 0) continue;
    let group = '';
    for (const token of tokens.slice(0, trackIndex)) {
      if (!GROUP_BOUNDARIES.has(token)) group = token;
    }
    groupNames.add(group || '(unlabelled)');
    for (const token of tokens.slice(trackIndex + 1)) {
      if (GROUP_BOUNDARIES.has(token)) break;
      const track = byId.get(normalize(token));
      if (!track) continue;
      matched.add(track.internal_id);
      rows.push({
        hrdf_entry_index: candidate.entry_index,
        group,
        hrdf_track_id: token,
        internal_id: track.internal_id,
        hud_map_name: track.hud_map_name,
        app_name: track.app_name,
        app_configuration: track.app_configuration,
      });
    }
  }

  rows.sort((left, right) => {
    const a = left as { internal_id: string; group: string };
    const b = right as { internal_id: string; group: string };
    return `${a.internal_id}:${a.group}`.localeCompare(
      `${b.internal_id}:${b.group}`,
    );
  });
  writeFileSync(
    path.join(OUTPUT_DIR, 'hrdf_track_crosscheck.csv'),
    stringify(rows, { header: true }),
  );
  writeFileSync(
    path.join(OUTPUT_DIR, 'hrdf_track_crosscheck_summary.md'),
    [
      '# HRDF track cross-check',
      '',
      `- Track assets in current extraction: ${tracks.length}`,
      `- Exact track assets found in HRDF track groups: ${matched.size}`,
      `- HRDF groups: ${groupNames.size}`,
      `- Matched group membership rows: ${rows.length}`,
      '',
      'This report validates canonical identifiers and group membership only. It does not infer display names or configurations.',
      '',
      'Groups:',
      ...[...groupNames].sort().map(group => `- ${group}`),
      '',
    ].join('\n'),
  );
  console.log(`Cross-checked ${matched.size}/${tracks.length} track assets`);
}

if (require.main === module) main();
