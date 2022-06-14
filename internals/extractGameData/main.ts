/**
 * Extract car and track information from AMS2 game files.
 * Configuration via environment variables; .env.development.local is consumed.
 *
 *   INPUT_PATH: path to a directory that contains
 *     BOOTFLOW.bff  (from the Pakfiles folder in AMS2)
 *     nfsshift.bms  (from http://aluigi.altervista.org/bms/nfsshift.bms)
 *
 *   QUICKBMS_BINARY_PATH: path to the QuickBMS binary
 *
 *   OUTPUT_PATH: path to a directory that will contain the results of execution. Will be created if it does not exist.
 */

import { spawnSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'node:path';
import { homedir } from 'os';
import * as xml2js from 'xml2js';

function readEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

interface Config {
  inputPath: string;
  outputPath: string;
  quickbmsBinaryPath: string;
}

function prepareConfig(): Config {
  dotenv.config({ path: '.env.development.local' });
  return {
    inputPath: readEnv('INPUT_PATH'),
    outputPath: readEnv('OUTPUT_PATH'),
    quickbmsBinaryPath: readEnv('QUICKBMS_BINARY_PATH'),
  };
}

function resolvePath(p: string): string {
  // I am genuinely upset this is not in the standard library.
  // There are (at least) three packages on NPM that do this.
  if (p.startsWith('~') || p === '~') {
    return path.resolve(p.replace('~', homedir()));
  }
  return p;
}

class Paths {
  constructor(private config: Config) {}

  get input(): string {
    return resolvePath(this.config.inputPath);
  }

  get output(): string {
    return resolvePath(this.config.outputPath);
  }

  get extracted(): string {
    return path.join(this.output, 'extracted');
  }

  get bootflow(): string {
    return path.join(this.input, 'BOOTFLOW.bff');
  }

  get nfsshift(): string {
    return path.join(this.input, 'nfsshift.bms');
  }

  get quickbmsBinary(): string {
    return resolvePath(this.config.quickbmsBinaryPath);
  }
}

function extract(inputFile: string, fields: string[]): Map<string, string> {
  const retval: Map<string, string> = new Map();
  xml2js.parseString(fs.readFileSync(inputFile, 'utf8'), (err, result) => {
    if (err) {
      throw err;
    }
    for (const prop of result.Reflection.data[0].prop) {
      if (fields.includes(prop.$.name)) {
        retval.set(prop.$.name, prop.$.data);
      }
    }
  });
  return retval!;
}

function main() {
  const config = prepareConfig();
  const paths = new Paths(config);
  console.info('Config', config);

  for (const path of [paths.bootflow, paths.nfsshift, paths.quickbmsBinary]) {
    if (!fs.existsSync(path)) {
      throw new Error(`File ${path} does not exist`);
    }
  }

  for (const path of [paths.output, paths.extracted]) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
      console.debug('Created directory', path);
    }
  }

  console.info('Extracting car and track information');
  const child = spawnSync(
    paths.quickbmsBinary,
    ['-o', paths.nfsshift, paths.bootflow, paths.extracted],
    { stdio: 'inherit' },
  );
  if (child.error) {
    throw child.error;
  }
  if (child.status !== 0) {
    throw new Error(`QuickBMS exited with status ${child.status}`);
  }
  console.info('QuickBMS finished, consuming track and car information');

  const cars: Map<string, string>[] = [];
  const carFields = [
    'Vehicle Name',
    'Vehicle Class',
    'Vehicle Group',
    'Vehicle Year',
    'Tier',
    'Price',
    'Region',
    'Country',
    'Vehicle Initial Performance Index',
  ];
  const tracks: Map<string, string>[] = [];
  const trackFields = [
    'Track Group',
    'Name',
    'Country',
    'Location',
    'TrackGradeFilter',
    'Track Type',
    'Class',
    'Event Types',
    'Allowed TimeOfDay',
  ];
  for (const filename of fs.readdirSync(paths.extracted)) {
    const filepath = path.join(paths.extracted, filename);
    if (filename.endsWith('.crd')) {
      cars.push(extract(filepath, carFields));
    } else if (filename.endsWith('.trd')) {
      tracks.push(extract(filepath, trackFields));
    }
  }

  console.log(`Found ${cars.length} cars and ${tracks.length} tracks`);

  // Cars to csv
  const carsFile = fs.openSync(path.join(paths.output, 'cars.csv'), 'w');
  fs.writeSync(carsFile, carFields.join(',') + '\n');
  for (const car of cars) {
    const values = carFields.map(field => '"' + car.get(field) + '"');
    fs.writeSync(carsFile, values.join(',') + '\n');
  }
  console.log(`Wrote ${cars.length} cars to cars.csv`);
  fs.closeSync(carsFile);

  // Tracks to csv
  const tracksFile = fs.openSync(path.join(paths.output, 'tracks.csv'), 'w');
  fs.writeSync(tracksFile, trackFields.join(',') + '\n');
  for (const track of tracks) {
    const values = trackFields.map(field => '"' + track.get(field) + '"');
    fs.writeSync(tracksFile, values.join(',') + '\n');
  }
  console.log(`Wrote ${tracks.length} tracks to tracks.csv`);
  fs.closeSync(tracksFile);
}

if (require.main === module) {
  main();
}
