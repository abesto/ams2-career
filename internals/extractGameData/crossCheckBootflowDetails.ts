import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';
import { stringify } from 'csv-stringify/sync';

const OUTPUT_DIR = path.resolve('build/extracted/ams2');

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function readRows<T>(filename: string): T[] {
  return Papa.parse<T>(readFileSync(filename, 'utf8'), {
    header: true,
    skipEmptyLines: true,
  }).data;
}

function main() {
  const details = readRows<Record<string, string>>(
    path.join(OUTPUT_DIR, 'bootflow_vehicle_details.csv'),
  );
  const appCars = readRows<Record<string, string>>('src/app/data/cars.csv');
  const carByName = new Map(details.map(row => [normalize(row['Vehicle Name']), row]));
  const carReport = appCars.map(row => {
    const detail = carByName.get(normalize(row.car));
    return {
      asset_type: 'car',
      app_name: row.car,
      app_class: row.class,
      app_discipline: row.discipline,
      app_year: row.year,
      source_name: detail?.Name ?? '',
      source_display_name: detail?.['Vehicle Name'] ?? '',
      source_class: detail?.['Vehicle Class'] ?? '',
      source_group: detail?.['Vehicle Group'] ?? '',
      source_year: detail?.['Vehicle Year'] ?? '',
      match: detail ? 'display_name' : 'none',
    };
  });

  const trackDetails = readRows<Record<string, string>>(
    path.join(OUTPUT_DIR, 'bootflow_track_details.csv'),
  );
  const appTracks = readRows<Record<string, string>>('src/app/data/tracks.csv');
  const trackByName = new Map(
    trackDetails.map(row => [normalize(row.TrackName), row]),
  );
  const trackReport = appTracks.map(row => {
    const detail = trackByName.get(normalize(row.name));
    return {
      asset_type: 'track',
      app_name: row.name,
      app_configuration: row.configuration,
      app_year: '',
      source_name: detail?.Name ?? '',
      source_display_name: detail?.TrackName ?? '',
      source_class: detail?.Class ?? '',
      source_group: detail?.['Track Group'] ?? '',
      source_year: detail?.Year ?? '',
      source_location: detail?.Location ?? '',
      match: detail ? 'display_name' : 'none',
    };
  });
  writeFileSync(
    path.join(OUTPUT_DIR, 'bootflow_csv_crosscheck.csv'),
    stringify([...carReport, ...trackReport], { header: true }),
  );
  console.log(
    `Matched ${carReport.filter(row => row.match !== 'none').length}/${carReport.length} cars by display name`,
  );
  console.log(
    `Matched ${trackReport.filter(row => row.match !== 'none').length}/${trackReport.length} tracks by display name`,
  );
}

if (require.main === module) main();
