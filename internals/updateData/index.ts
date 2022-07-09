// Fetch data from https://docs.google.com/spreadsheets/d/1v4awipFv6t0RVoDaFyY8n5JgqQFdUKeXmKZN_hwTu0Q/edit

import axios from 'axios';
import { stringify } from 'csv-stringify/sync';
import { writeFileSync } from 'fs';
import Papa from 'papaparse';

const spreadsheetId = '1v4awipFv6t0RVoDaFyY8n5JgqQFdUKeXmKZN_hwTu0Q';

interface Spec {
  gid: string;
  filename: string;
  transform?: (
    row: string[],
    index: number,
    data: string[][],
  ) => string[] | null;
}

function exactlyFields(fields: string[]) {
  const indices: number[] = [];
  return (row: string[], index: number, data: string[][]) => {
    if (index === 0) {
      for (const field of fields) {
        indices.push(row.indexOf(field));
      }
      return fields;
    }
    const processed: string[] = [];
    for (const index of indices) {
      processed.push(row[index]);
    }
    return processed;
  };
}

const specs: Spec[] = [
  {
    gid: '952623412',
    filename: 'cars',
    transform: exactlyFields(['car', 'class', 'discipline', 'year']),
  },
  {
    gid: '1383715614',
    filename: 'car_classes',
    transform: exactlyFields([
      'discipline',
      'grade',
      'class',
      'headlights',
      'race_length',
      'race_length_unit',
    ]),
  },
  {
    gid: '1093108730',
    filename: 'tracks',
    transform: (row, index) =>
      index === 0
        ? row
        : [
            row[0].trim(),
            row[1].trim(),
            ...row.slice(2).map(s => ({ TRUE: 'x', FALSE: '' }[s] ?? s)),
          ],
  },
  {
    gid: '234345869',
    filename: 'xp_cross_discipline_multiplier',
  },
  {
    gid: '177935223',
    filename: 'xp_grade_multiplier',
    transform: (row, index) => (index === 0 ? null : row.filter(s => s !== '')),
  },
  { gid: '1157169678', filename: 'xp_prestige' },
  { gid: '339892287', filename: 'xp_grade_breakpoints' },
];

async function update(spec: Spec) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?gid=${spec.gid}&format=csv`;
  const response = await axios.get(url);
  const raw: string = response.data;
  const data = Papa.parse(raw).data;
  const transformed = spec.transform
    ? data.map(spec.transform).filter(r => r !== null)
    : data;
  writeFileSync(`src/app/data/${spec.filename}.csv`, stringify(transformed));
}

async function main() {
  await Promise.all(specs.map(update));
}

if (require.main === module) {
  main();
}
