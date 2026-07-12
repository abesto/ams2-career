import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';
import { stringify } from 'csv-stringify/sync';

const OUTPUT_DIR = path.resolve('build/extracted/ams2');

type Car = {
  internal_id: string;
  display_guess: string;
  app_car: string;
  app_class: string;
  app_discipline: string;
  app_year: string;
};

type Candidate = {
  pack_id: string;
  entry_index: string;
  expected_uncompressed_size: string;
  strings: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cleanToken(value: string): string {
  return value.replace(/^[^a-z0-9]+/i, '').replace(/[^a-z0-9_/-]+$/i, '');
}

function main() {
  const cars = Papa.parse<Car>(
    readFileSync(path.join(OUTPUT_DIR, 'cars.csv'), 'utf8'),
    { header: true, skipEmptyLines: true },
  ).data as Car[];
  const candidates = Papa.parse<Candidate>(
    readFileSync(
      path.join(OUTPUT_DIR, 'physics_vehicle_candidates.csv'),
      'utf8',
    ),
    { header: true, skipEmptyLines: true },
  ).data as Candidate[];
  const byId = new Map(cars.map(car => [normalize(car.internal_id), car]));
  const rows: object[] = [];
  const matched = new Set<string>();

  for (const candidate of candidates) {
    const tokens = candidate.strings
      .split('|')
      .map(cleanToken)
      .filter(token => token.length >= 3);
    const matches = tokens.flatMap(token => {
      const normalizedToken = normalize(token);
      return [...byId.entries()]
        .filter(([id]) => normalizedToken.includes(id))
        .map(([id, carId]) => ({ id, carId, token }));
    });
    const carMatch = matches.sort(
      (left, right) => right.id.length - left.id.length,
    )[0];
    if (!carMatch) continue;
    const carToken = carMatch.token;
    const car = byId.get(carMatch.id)!;
    matched.add(car.internal_id);
    rows.push({
      internal_id: car.internal_id,
      physics_entry_index: candidate.entry_index,
      physics_string_chain: candidate.strings,
      physics_tokens_after_id: tokens
        .slice(tokens.indexOf(carToken) + 1)
        .join('|'),
      app_car: car.app_car,
      app_class: car.app_class,
      app_discipline: car.app_discipline,
      app_year: car.app_year,
    });
  }

  rows.sort((left, right) => {
    const a = left as { internal_id: string };
    const b = right as { internal_id: string };
    return a.internal_id.localeCompare(b.internal_id);
  });
  writeFileSync(
    path.join(OUTPUT_DIR, 'physics_vehicle_crosscheck.csv'),
    stringify(rows, { header: true }),
  );
  writeFileSync(
    path.join(OUTPUT_DIR, 'physics_vehicle_crosscheck_summary.md'),
    [
      '# Physics vehicle cross-check',
      '',
      `- Base car assets: ${cars.length}`,
      `- Base car assets with an exact normalized physics identifier: ${matched.size}`,
      `- Base car assets without one: ${cars.length - matched.size}`,
      `- Physics candidate records with a base-car identifier: ${rows.length}`,
      '',
      'The report preserves raw decoded string chains. It does not infer app display names, classes, disciplines, or years.',
      '',
      'Unmatched base assets:',
      ...cars
        .filter(car => !matched.has(car.internal_id))
        .map(car => `- ${car.internal_id}`),
      '',
    ].join('\n'),
  );
  console.log(`Cross-checked ${matched.size}/${cars.length} base car assets`);
}

if (require.main === module) main();
