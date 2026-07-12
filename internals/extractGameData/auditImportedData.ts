import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';

const DATA_DIR = path.resolve('src/app/data');
const OUTPUT = path.resolve('build/extracted/ams2/import-audit.md');

type Row = Record<string, string>;
const read = (file: string) => Papa.parse<Row>(readFileSync(path.join(DATA_DIR, file), 'utf8'), { header: true, skipEmptyLines: true }).data;

function main() {
  mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const cars = read('game_cars.csv');
  const tracks = read('game_tracks.csv');
  const classes = read('game_class_mapping.csv');
  const trackMappings = read('game_track_mapping.csv');
  const aliases = read('legacy_id_aliases.csv');
  const classNames = new Set(classes.map(row => row.meta_class));
  const trackIds = new Set(tracks.map(row => row.game_id));
  const errors: string[] = [];
  const duplicate = (rows: Row[], key: string) => rows.length - new Set(rows.map(row => row[key])).size;
  if (duplicate(cars, 'canonical_id')) errors.push('duplicate canonical car IDs');
  if (duplicate(tracks, 'game_id')) errors.push('duplicate canonical track IDs');
  if (cars.some(row => !classNames.has(row.meta_class))) errors.push('car with unknown meta class');
  if (trackMappings.some(row => !trackIds.has(row.game_track_id))) errors.push('track mapping with unknown track ID');
  if (cars.some(row => !['standard', 'low'].includes(row.downforce_variant))) errors.push('car with invalid downforce variant');
  if (tracks.some(row => !['standard', 'low'].includes(row.downforce_variant))) errors.push('track with invalid downforce variant');
  const report = [
    '# AMS2 Import Audit',
    '',
    `- Canonical car rows: ${cars.length}`,
    `- Canonical track rows: ${tracks.length}`,
    `- Game classes: ${classes.length}`,
    `- Track/class mappings: ${trackMappings.length}`,
    `- Legacy aliases: ${aliases.length}`,
    `- Legacy aliases migrated to canonical IDs: ${aliases.filter(row => row.status === 'canonical').length}`,
    `- Legacy aliases retained through fallback: ${aliases.filter(row => row.status === 'legacy-fallback').length}`,
    `- Low-downforce cars: ${cars.filter(row => row.downforce_variant === 'low').length}`,
    `- Low-downforce tracks: ${tracks.filter(row => row.downforce_variant === 'low').length}`,
    '',
    errors.length ? `## Errors\n\n${errors.map(error => `- ${error}`).join('\n')}` : '## Result\n\nNo structural import errors found.',
  ];
  writeFileSync(OUTPUT, `${report.join('\n')}\n`);
  if (errors.length) throw new Error(errors.join('; '));
  console.log(OUTPUT);
}

if (require.main === module) main();
