import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';
import { stringify } from 'csv-stringify/sync';

const OUTPUT_DIR = path.resolve('build/extracted/ams2');

type PayloadRow = {
  entry_index: string;
  xml: string;
};

function decodeXml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function parseRecords(rows: PayloadRow[], className: string): Record<string, string>[] {
  const records: Record<string, string>[] = [];
  for (const row of rows) {
    const dataPattern = new RegExp(
      `<data class="${className}"[^>]*>([\\s\\S]*?)</data>`,
      'g',
    );
    for (const match of row.xml.matchAll(dataPattern)) {
      const record: Record<string, string> = {
        source_entry_index: row.entry_index,
      };
      for (const prop of match[1].matchAll(
        /<prop name="([^"]+)" data="([^"]*)"\s*\/>/g,
      )) {
        record[prop[1]] = decodeXml(prop[2]);
      }
      records.push(record);
    }
  }
  return records;
}

function writeRecords(filename: string, records: Record<string, string>[]) {
  const columns = [
    'source_entry_index',
    ...[...new Set(records.flatMap(record => Object.keys(record)))].filter(
      column => column !== 'source_entry_index',
    ),
  ];
  writeFileSync(
    path.join(OUTPUT_DIR, filename),
    stringify(records, { header: true, columns }),
  );
}

function main() {
  const rows = Papa.parse<PayloadRow>(
    readFileSync(path.join(OUTPUT_DIR, 'bootflow_detail_payloads.csv'), 'utf8'),
    { header: true, skipEmptyLines: true },
  ).data;
  const vehicles = parseRecords(rows, 'VehicleDetails');
  const tracks = parseRecords(rows, 'TrackDetails');
  writeRecords('bootflow_vehicle_details.csv', vehicles);
  writeRecords('bootflow_track_details.csv', tracks);
  console.log(`Extracted ${vehicles.length} VehicleDetails records`);
  console.log(`Extracted ${tracks.length} TrackDetails records`);
}

if (require.main === module) main();
