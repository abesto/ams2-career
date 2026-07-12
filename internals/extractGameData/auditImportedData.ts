import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';

const DATA_DIR = path.resolve('src/app/data');
const OUTPUT = path.resolve('build/extracted/ams2/import-audit.md');

type Row = Record<string, string>;
const read = (file: string) =>
  Papa.parse<Row>(readFileSync(path.join(DATA_DIR, file), 'utf8'), {
    header: true,
    skipEmptyLines: true,
  }).data;

function main() {
  mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const cars = read('game_cars.csv');
  const tracks = read('game_tracks.csv');
  const classes = read('game_class_mapping.csv');
  const trackMappings = read('game_track_mapping.csv');
  const aliases = read('legacy_id_aliases.csv');
  const classNames = new Set(classes.map(row => row.meta_class));
  const appClasses = read('car_classes.csv');
  const appClassesByName = new Map<string, Row[]>();
  for (const appClass of appClasses) {
    const values = appClassesByName.get(appClass.class) || [];
    values.push(appClass);
    appClassesByName.set(appClass.class, values);
  }
  const trackIds = new Set(tracks.map(row => row.game_id));
  const errors: string[] = [];
  const duplicate = (rows: Row[], key: string) =>
    rows.length - new Set(rows.map(row => row[key])).size;
  if (duplicate(cars, 'canonical_id'))
    errors.push('duplicate canonical car IDs');
  if (duplicate(tracks, 'game_id'))
    errors.push('duplicate canonical track IDs');
  if (cars.some(row => !classNames.has(row.meta_class)))
    errors.push('car with unknown meta class');
  if (classes.some(row => !appClassesByName.has(row.meta_class)))
    errors.push('mapping with undefined app meta class');
  if (trackMappings.some(row => !trackIds.has(row.game_track_id)))
    errors.push('track mapping with unknown track ID');
  if (cars.some(row => !['standard', 'low'].includes(row.downforce_variant)))
    errors.push('car with invalid downforce variant');
  if (tracks.some(row => !['standard', 'low'].includes(row.downforce_variant)))
    errors.push('track with invalid downforce variant');
  const mappingSources = (source: string) =>
    classes.filter(row => row.mapping_source === source).length;
  const headlightsBySource = new Map<string, number>();
  for (const car of cars) {
    headlightsBySource.set(
      car.headlights_source,
      (headlightsBySource.get(car.headlights_source) || 0) + 1,
    );
  }
  const ambiguousAppClasses = [...appClassesByName.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(
      ([name, rows]) =>
        `${name}: ${rows.map(row => `${row.discipline}/grade-${row.grade}`).join(', ')}`,
    );
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
    `- Explicit class aliases: ${mappingSources('explicit-alias')}`,
    `- Heuristic class families: ${mappingSources('heuristic-family')}`,
    `- Headlight provenance values: ${headlightsBySource.size}`,
    '',
    '## Semantic Provenance',
    '',
    'Class disciplines and grades are taken from `car_classes.csv`; the game extraction does not authoritatively expose those semantics.',
    'Headlight values are class defaults from `car_classes.csv`, not per-vehicle game fields. `headlights_source` identifies the class used for each generated row after re-import.',
    '',
    '### Headlight Sources',
    '',
    ...[...headlightsBySource.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([source, count]) => `- ${source || 'missing'}: ${count}`),
    '',
    '### Ambiguous App Classes',
    '',
    ...(ambiguousAppClasses.length
      ? [
          'The following app class names intentionally resolve to more than one discipline/grade. The importer preserves the class name and does not choose a new semantic mapping.',
          ...ambiguousAppClasses.map(value => `- ${value}`),
        ]
      : ['None.']),
    '',
    errors.length
      ? `## Errors\n\n${errors.map(error => `- ${error}`).join('\n')}`
      : '## Result\n\nNo structural import errors found.',
  ];
  writeFileSync(OUTPUT, `${report.join('\n')}\n`);
  if (errors.length) throw new Error(errors.join('; '));
  console.log(OUTPUT);
}

if (require.main === module) main();
