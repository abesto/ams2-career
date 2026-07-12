import { readFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';

const OUTPUT_DIR = path.resolve('build/extracted/ams2');

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function main() {
  const index = Papa.parse<{ asset_type: string; asset_path: string }>(
    readFileSync(path.join(OUTPUT_DIR, 'bootflow_asset_index.csv'), 'utf8'),
    { header: true, skipEmptyLines: true },
  ).data;
  const cars = new Set(
    index
      .filter(row => row.asset_type === 'car')
      .map(row => path.basename(row.asset_path.replace(/\\/g, '/'), '.crd'))
      .filter(name => !/_LD$|_HD$|_SO$|_SS$|_SW$/i.test(name))
      .map(normalize),
  );
  const tracks = new Set(
    index
      .filter(row => row.asset_type === 'track')
      .map(row =>
        path
          .basename(row.asset_path.replace(/\\/g, '/'), '.trd')
          .replace(/^@/, ''),
      )
      .map(normalize),
  );
  const appCars = Papa.parse<{ car: string }>(
    readFileSync('src/app/data/cars.csv', 'utf8'),
    { header: true, skipEmptyLines: true },
  ).data;
  const appTracks = Papa.parse<{ name: string }>(
    readFileSync('src/app/data/tracks.csv', 'utf8'),
    { header: true, skipEmptyLines: true },
  ).data;
  const matchedCars = appCars.filter(row => cars.has(normalize(row.car))).length;
  const matchedTracks = appTracks.filter(row => tracks.has(normalize(row.name))).length;
  console.log(`BOOTFLOW base cars: ${cars.size}`);
  console.log(`App car rows present in BOOTFLOW: ${matchedCars}/${appCars.length}`);
  console.log(`BOOTFLOW track configurations: ${tracks.size}`);
  console.log(`App track rows present in BOOTFLOW: ${matchedTracks}/${appTracks.length}`);
}

if (require.main === module) main();
