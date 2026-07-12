import { stringify } from 'csv-stringify/sync';
import {
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'fs';
import path from 'path';

import Papa from 'papaparse';

const DEFAULT_GAME_ROOT =
  '/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2';
const OUTPUT_DIR = path.resolve('build/extracted/ams2');
const IMAGE_BASE = 0x140000000;
const MODE2_KEY_TABLE_VA = 0x1425507e0;
const MODE2_KEY_STRIDE = 0x1b;
const MODE2_KEY_XOR = [0xac, 0xc7, 0x91];
const RUNTIME_ENTRY_STRIDE = 0x2a;
const ROOT_METADATA_OFFSET = 0x130;
const ROOT_METADATA_SEED_LIMIT = 64;

type ExistingCar = {
  car: string;
  class: string;
  discipline: string;
  year: string;
};

type ExistingTrack = {
  name: string;
  configuration: string;
};

type ExtractedCar = {
  internal_id: string;
  display_guess: string;
  app_car: string;
  app_class: string;
  app_discipline: string;
  app_year: string;
  match_score: string;
};

type ExtractedTrack = {
  internal_id: string;
  display_guess: string;
  hud_map_name: string;
  app_name: string;
  app_configuration: string;
  match_score: string;
};

type KapPack = {
  pack_id: string;
  relative_path: string;
  file_size: number;
  header_magic: string;
  header_mode: string;
  header_transform_mode: number;
  header_data_offset: number;
  entry_count: number;
  data_start_offset: number;
  root_entry_size: number;
  root_entry_compressed_size: number;
  root_entry_offset: number;
  root_entry_header_size: number;
  root_entry_flags: string;
  secondary_toc_offset: number;
  secondary_toc_transform_size: number;
  runtime_entry_stride: number;
  root_entry_magic: string;
  root_entry_nested_count: number;
  reiza_xml_uncompressed_size: number;
  visible_names: string;
};

type AudioVehicleAsset = {
  asset_id: string;
  manufacturer: string;
  bank_path: string;
};

type KapPayloadEntry = {
  pack_id: string;
  relative_path: string;
  entry_index: number;
  record_id: string;
  record_kind: string;
  payload_offset: number;
  payload_size: number;
  payload_head: string;
};

type PeSection = {
  name: string;
  va: number;
  virtualSize: number;
  rawOffset: number;
  rawSize: number;
};

type KapRuntimeEntry = {
  pack_id: string;
  relative_path: string;
  entry_index: number;
  decode_seed: number;
  record_hash_0: string;
  record_hash_1: string;
  payload_offset: number;
  payload_offset_2: number;
  compressed_size: number;
  uncompressed_size: number;
  unknown_18: string;
  unknown_1c: string;
  codec: string;
  compression_type: number;
  compression_subtype: number;
  checksum: string;
  tail: string;
  plausible: string;
  payload_head: string;
};

type Mode2Key = {
  seed: number;
  key: Buffer;
};

function parseCsv<T>(filename: string): T[] {
  return Papa.parse<T>(readFileSync(filename, 'utf8'), {
    header: true,
    skipEmptyLines: true,
  }).data;
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(' ')
    .filter(Boolean)
    .flatMap(
      token => token.match(/[a-z]+|\d+[a-z]?|[a-z]+\d+[a-z]*/g) ?? [token],
    );
}

function displayGuessFromInternalId(value: string): string {
  return value
    .replace(/^AUT_/, '')
    .replace(/\.bff$/i, '')
    .replace(/\[Group\]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreMatch(left: string, right: string): number {
  const leftNorm = normalize(left);
  const rightNorm = normalize(right);
  if (!leftNorm || !rightNorm) {
    return 0;
  }
  if (leftNorm === rightNorm) {
    return 1;
  }

  const leftTokens = new Set(tokens(left));
  const rightTokens = new Set(tokens(right));
  const intersection = [...leftTokens].filter(token => rightTokens.has(token));
  const dice =
    (2 * intersection.length) / (leftTokens.size + rightTokens.size || 1);

  const leftNumbers = [...leftTokens].filter(token => /^\d/.test(token));
  const rightNumbers = new Set(
    [...rightTokens].filter(token => /^\d/.test(token)),
  );
  const numbersBonus =
    leftNumbers.length > 0 &&
    leftNumbers.every(token => rightNumbers.has(token))
      ? 0.15
      : 0;

  const containsBonus =
    rightNorm.includes(leftNorm) || leftNorm.includes(rightNorm) ? 0.1 : 0;

  return Math.min(1, dice + numbersBonus + containsBonus);
}

function bestMatch<T>(
  needle: string,
  haystack: T[],
  toString: (entry: T) => string,
): { entry: T | null; score: number } {
  let bestEntry: T | null = null;
  let bestScore = 0;
  for (const entry of haystack) {
    const score = scoreMatch(needle, toString(entry));
    if (score > bestScore) {
      bestEntry = entry;
      bestScore = score;
    }
  }
  return { entry: bestEntry, score: bestScore };
}

function extractHudMapNames(gameRoot: string): Set<string> {
  const hudMapsPath = path.join(gameRoot, 'GUI', 'HUD_1_6', 'HUD_Maps.xml');
  const xml = readFileSync(hudMapsPath, 'utf8');
  return new Set([...xml.matchAll(/<Map name="([^"]+)"/g)].map(m => m[1]));
}

function extractCars(
  gameRoot: string,
  existingCars: ExistingCar[],
): ExtractedCar[] {
  const vehiclesDir = path.join(gameRoot, 'Pakfiles', 'Vehicles');
  const baseVehicles = readdirSync(vehiclesDir)
    .filter(name => name.endsWith('.bff'))
    .filter(
      name =>
        !/_Cockpit|_Livery|_LD|_HD|_SO|_SS|_SW|_MAG_|_SafetyCar/i.test(name),
    )
    .sort();

  return baseVehicles.map(filename => {
    const internalId = filename.replace(/\.bff$/i, '');
    const displayGuess = displayGuessFromInternalId(internalId);
    const match = bestMatch(
      displayGuess,
      existingCars,
      entry => `${entry.car} ${entry.class} ${entry.year}`,
    );
    const matched = match.score >= 0.45 ? match.entry : null;
    return {
      internal_id: internalId,
      display_guess: displayGuess,
      app_car: matched?.car ?? '',
      app_class: matched?.class ?? '',
      app_discipline: matched?.discipline ?? '',
      app_year: matched?.year ?? '',
      match_score: match.score.toFixed(3),
    };
  });
}

function extractTracks(
  gameRoot: string,
  hudMapNames: Set<string>,
  existingTracks: ExistingTrack[],
): ExtractedTrack[] {
  const tracksDir = path.join(gameRoot, 'Pakfiles', 'TRACKS');
  const baseTracks = readdirSync(tracksDir)
    .filter(name => /^AUT_.*\.bff$/i.test(name))
    .filter(name => !name.includes('[Group]'))
    .sort();

  return baseTracks.map(filename => {
    const internalId = filename.replace(/\.bff$/i, '');
    const layoutId = internalId.replace(/^AUT_/, '');
    const displayGuess = displayGuessFromInternalId(layoutId);
    const hudMapName =
      [...hudMapNames].find(name => normalize(name) === normalize(layoutId)) ??
      '';
    const match = bestMatch(
      displayGuess,
      existingTracks,
      entry => `${entry.name} ${entry.configuration}`,
    );
    const matched = match.score >= 0.45 ? match.entry : null;
    return {
      internal_id: internalId,
      display_guess: displayGuess,
      hud_map_name: hudMapName,
      app_name: matched?.name ?? '',
      app_configuration: matched?.configuration ?? '',
      match_score: match.score.toFixed(3),
    };
  });
}

function writeCsv(filename: string, rows: object[]) {
  writeFileSync(
    path.join(OUTPUT_DIR, filename),
    stringify(rows, { header: true }),
  );
}

function readUInt32LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

function readUInt16LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt16LE(offset);
}

function align16(value: number): number {
  return (value + 15) & ~15;
}

function readFileRange(
  filePath: string,
  offset: number,
  length: number,
): Buffer {
  const handle = openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    const bytesRead = readSync(handle, buffer, 0, length, offset);
    return buffer.subarray(0, bytesRead);
  } finally {
    closeSync(handle);
  }
}

function parsePeSections(exe: Buffer): PeSection[] {
  const peOffset = exe.indexOf(Buffer.from('PE\0\0', 'ascii'));
  if (peOffset < 0) {
    throw new Error('PE header not found');
  }

  const sectionCount = readUInt16LE(exe, peOffset + 6);
  const optionalHeaderSize = readUInt16LE(exe, peOffset + 20);
  const sectionTableOffset = peOffset + 24 + optionalHeaderSize;

  const sections: PeSection[] = [];
  for (let index = 0; index < sectionCount; index += 1) {
    const offset = sectionTableOffset + index * 40;
    sections.push({
      name: exe
        .subarray(offset, offset + 8)
        .toString('ascii')
        .replace(/\0+$/, ''),
      virtualSize: readUInt32LE(exe, offset + 8),
      va: IMAGE_BASE + readUInt32LE(exe, offset + 12),
      rawSize: readUInt32LE(exe, offset + 16),
      rawOffset: readUInt32LE(exe, offset + 20),
    });
  }

  return sections;
}

function readVa(
  exe: Buffer,
  sections: PeSection[],
  va: number,
  size: number,
): Buffer {
  const section = sections.find(
    candidate =>
      candidate.va <= va &&
      va < candidate.va + Math.max(candidate.virtualSize, candidate.rawSize),
  );
  if (!section) {
    throw new Error(`VA 0x${va.toString(16)} not covered by a PE section`);
  }

  const fileOffset = section.rawOffset + (va - section.va);
  return exe.subarray(fileOffset, fileOffset + size);
}

function readCString(exe: Buffer, sections: PeSection[], va: number): Buffer {
  const bytes = readVa(exe, sections, va, 0x4000);
  const nul = bytes.indexOf(0);
  return nul >= 0 ? bytes.subarray(0, nul) : bytes;
}

function mode2Key(exe: Buffer, sections: PeSection[], seed: number): Buffer {
  const key = Buffer.from(
    readCString(exe, sections, MODE2_KEY_TABLE_VA + seed * MODE2_KEY_STRIDE),
  );

  let keyIndex = 0;
  for (let offset = 0; offset + 1 < key.length; offset += 2) {
    const first = key[offset];
    const second = key[offset + 1];
    key[offset] = second ^ MODE2_KEY_XOR[(keyIndex + 1) % MODE2_KEY_XOR.length];
    key[offset + 1] = first ^ MODE2_KEY_XOR[keyIndex];
    keyIndex = (keyIndex + 2) % MODE2_KEY_XOR.length;
  }

  if (key.length % 2 === 1) {
    key[key.length - 1] ^= MODE2_KEY_XOR[keyIndex];
  }

  return key;
}

function rc4(data: Buffer, key: Buffer): Buffer {
  if (key.length === 0) {
    return Buffer.from(data);
  }

  const state = Array.from({ length: 256 }, (_, index) => index);
  let j = 0;
  for (let index = 0; index < 256; index += 1) {
    j = (j + state[index] + key[index % key.length]) & 0xff;
    [state[index], state[j]] = [state[j], state[index]];
  }

  const output = Buffer.alloc(data.length);
  let i = 0;
  j = 0;
  for (let offset = 0; offset < data.length; offset += 1) {
    i = (i + 1) & 0xff;
    j = (j + state[i]) & 0xff;
    [state[i], state[j]] = [state[j], state[i]];
    output[offset] = data[offset] ^ state[(state[i] + state[j]) & 0xff];
  }

  return output;
}

function runtimeCodec(compressionType: number): string {
  if (compressionType === 0) {
    return 'raw';
  }
  if (compressionType === 1) {
    return 'zlib';
  }
  if (compressionType === 3 || compressionType === 4) {
    return 'oodle';
  }
  return 'unknown';
}

function readAsciiZ(buffer: Buffer, offset: number, maxLength: number): string {
  let end = offset;
  const limit = Math.min(buffer.length, offset + maxLength);
  while (end < limit && buffer[end] !== 0) {
    const value = buffer[end];
    if (value < 0x20 || value > 0x7e) {
      break;
    }
    end += 1;
  }
  return buffer.subarray(offset, end).toString('ascii');
}

function extractVisibleNames(buffer: Buffer): {
  names: string[];
  reizaXmlSize: number;
} {
  const names: string[] = [];
  let reizaXmlSize = 0;

  for (let offset = 0; offset + 12 < buffer.length; offset += 1) {
    if (
      buffer[offset] !== 0x20 ||
      buffer[offset + 1] !== 0x54 ||
      buffer[offset + 2] !== 0x58 ||
      buffer[offset + 3] !== 0x45
    ) {
      continue;
    }

    const uncompressedSize = readUInt32LE(buffer, offset + 4);
    const name = readAsciiZ(buffer, offset + 8, 256);
    if (!name) {
      continue;
    }

    names.push(`${name}:${uncompressedSize}`);
    if (name === 'Reiza.xml') {
      reizaXmlSize = uncompressedSize;
    }
  }

  return { names, reizaXmlSize };
}

function parseKapPack(gameRoot: string, filePath: string): KapPack {
  const initialHeader = readFileRange(filePath, 0, 0x130);
  const packId = path.basename(filePath, '.bff');
  const fileSize = statSync(filePath).size;
  const headerMagic = initialHeader.subarray(0, 4).toString('ascii');
  const headerMode = `0x${readUInt32LE(initialHeader, 0x04).toString(16)}`;
  const entryCount = readUInt32LE(initialHeader, 0x08);
  const headerDataStartOffset = readUInt32LE(initialHeader, 0x0c);
  const rootEntrySize = readUInt32LE(initialHeader, 0x118);
  const rootEntryCompressedSize = readUInt32LE(initialHeader, 0x120);
  const rootEntryOffset = readUInt32LE(initialHeader, 0x124);
  const rootEntryHeaderSize = readUInt32LE(initialHeader, 0x128);
  const rootEntryFlagsValue = readUInt32LE(initialHeader, 0x12c);
  const rootEntryFlags = `0x${rootEntryFlagsValue.toString(16)}`;
  const headerTransformMode = initialHeader[0x12d];
  const secondaryTocOffset =
    rootEntryCompressedSize > 0 ? 0x438 + rootEntrySize : 0;
  const secondaryTocTransformSize =
    rootEntryCompressedSize > 0 ? rootEntryCompressedSize - 0x308 : 0;
  const dataStartOffset =
    rootEntryOffset > 0 && rootEntryHeaderSize > 0
      ? align16(rootEntryOffset + rootEntryHeaderSize)
      : headerDataStartOffset;
  const metadata = readFileRange(
    filePath,
    0,
    Math.min(fileSize, Math.max(0x130, dataStartOffset)),
  );
  const visible = extractVisibleNames(metadata);

  let rootEntryMagic = '';
  let rootEntryNestedCount = 0;

  if (rootEntryOffset > 0 && rootEntryOffset + 16 <= metadata.length) {
    rootEntryMagic = metadata
      .subarray(rootEntryOffset, rootEntryOffset + 4)
      .toString('ascii')
      .replace(/[^\x20-\x7e]/g, '');

    if (rootEntryMagic === 'DHSA' && rootEntryOffset + 12 <= metadata.length) {
      rootEntryNestedCount = readUInt32LE(metadata, rootEntryOffset + 0x08);
    }
  }

  return {
    pack_id: packId,
    relative_path: path.relative(gameRoot, filePath),
    file_size: fileSize,
    header_magic: headerMagic,
    header_mode: headerMode,
    header_transform_mode: headerTransformMode,
    header_data_offset: headerDataStartOffset,
    entry_count: entryCount,
    data_start_offset: dataStartOffset,
    root_entry_size: rootEntrySize,
    root_entry_compressed_size: rootEntryCompressedSize,
    root_entry_offset: rootEntryOffset,
    root_entry_header_size: rootEntryHeaderSize,
    root_entry_flags: rootEntryFlags,
    secondary_toc_offset: secondaryTocOffset,
    secondary_toc_transform_size: secondaryTocTransformSize,
    runtime_entry_stride: 0x2a,
    root_entry_magic: rootEntryMagic,
    root_entry_nested_count: rootEntryNestedCount,
    reiza_xml_uncompressed_size: visible.reizaXmlSize,
    visible_names: visible.names.join('|'),
  };
}

function extractKapPacks(gameRoot: string, relativeDir: string): KapPack[] {
  const dir = path.join(gameRoot, relativeDir);
  return readdirSync(dir)
    .filter(name => name.endsWith('.bff'))
    .sort()
    .map(name => parseKapPack(gameRoot, path.join(dir, name)));
}

function readPayloadHead(filePath: string, offset: number): string {
  if (offset <= 0 || offset >= statSync(filePath).size) {
    return '';
  }
  return readFileRange(filePath, offset, 16).toString('hex');
}

function extractKapPayloadEntries(
  gameRoot: string,
  pack: KapPack,
): KapPayloadEntry[] {
  const filePath = path.join(gameRoot, pack.relative_path);
  const rows: KapPayloadEntry[] = [];

  if (pack.root_entry_magic !== 'DHSA') {
    rows.push({
      pack_id: pack.pack_id,
      relative_path: pack.relative_path,
      entry_index: 0,
      record_id: '',
      record_kind: '',
      payload_offset: pack.data_start_offset,
      payload_size: pack.root_entry_size,
      payload_head: readPayloadHead(filePath, pack.data_start_offset),
    });
    return rows;
  }

  const dhsaHeaderSize = 0x10 + pack.root_entry_nested_count * 16;
  const dhsaHeader = readFileRange(
    filePath,
    pack.root_entry_offset,
    dhsaHeaderSize,
  );
  let payloadOffset = align16(
    pack.root_entry_offset + pack.root_entry_header_size,
  );

  for (let index = 0; index < pack.root_entry_nested_count; index += 1) {
    const recordOffset = 0x10 + index * 16;
    const recordId = readUInt32LE(dhsaHeader, recordOffset);
    const recordKind = readUInt32LE(dhsaHeader, recordOffset + 4);
    const payloadSize = readUInt32LE(dhsaHeader, recordOffset + 8);

    rows.push({
      pack_id: pack.pack_id,
      relative_path: pack.relative_path,
      entry_index: index,
      record_id: String(recordId),
      record_kind: String(recordKind),
      payload_offset: payloadOffset,
      payload_size: payloadSize,
      payload_head: readPayloadHead(filePath, payloadOffset),
    });

    payloadOffset = align16(payloadOffset + payloadSize);
  }

  return rows;
}

function extractKapRuntimeEntries(
  gameRoot: string,
  pack: KapPack,
  mode2Keys: Mode2Key[],
): KapRuntimeEntry[] {
  if (
    pack.header_transform_mode !== 2 ||
    pack.root_entry_size !== pack.entry_count * RUNTIME_ENTRY_STRIDE
  ) {
    return [];
  }

  const filePath = path.join(gameRoot, pack.relative_path);
  const rawRootMetadata = readFileRange(
    filePath,
    ROOT_METADATA_OFFSET,
    pack.root_entry_size,
  );
  if (rawRootMetadata.length !== pack.root_entry_size) {
    return [];
  }

  const fileSize = statSync(filePath).size;
  let bestSeed = -1;
  let bestScore = -1;
  let bestDecoded: Buffer | null = null;

  function isPlausible(decoded: Buffer, offset: number): boolean {
    const payloadOffset = readUInt32LE(decoded, offset + 0x08);
    const compressedSize = readUInt32LE(decoded, offset + 0x10);
    const uncompressedSize = readUInt32LE(decoded, offset + 0x14);
    return (
      payloadOffset > 0 &&
      compressedSize > 0 &&
      payloadOffset + compressedSize <= fileSize &&
      payloadOffset % 16 === 0 &&
      uncompressedSize >= compressedSize
    );
  }

  for (const candidate of mode2Keys) {
    const decoded = rc4(rawRootMetadata, candidate.key);
    let score = 0;
    for (let index = 0; index < pack.entry_count; index += 1) {
      if (isPlausible(decoded, index * RUNTIME_ENTRY_STRIDE)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestSeed = candidate.seed;
      bestScore = score;
      bestDecoded = decoded;
      if (score === pack.entry_count) {
        break;
      }
    }
  }

  if (bestDecoded === null || bestScore <= 0) {
    return [];
  }

  const rows: KapRuntimeEntry[] = [];

  for (let index = 0; index < pack.entry_count; index += 1) {
    const offset = index * RUNTIME_ENTRY_STRIDE;
    const payloadOffset = readUInt32LE(bestDecoded, offset + 0x08);
    const payloadOffset2 = readUInt32LE(bestDecoded, offset + 0x0c);
    const compressedSize = readUInt32LE(bestDecoded, offset + 0x10);
    const uncompressedSize = readUInt32LE(bestDecoded, offset + 0x14);
    const plausible = isPlausible(bestDecoded, offset);

    rows.push({
      pack_id: pack.pack_id,
      relative_path: pack.relative_path,
      entry_index: index,
      decode_seed: bestSeed,
      record_hash_0: `0x${readUInt32LE(bestDecoded, offset + 0x00)
        .toString(16)
        .padStart(8, '0')}`,
      record_hash_1: `0x${readUInt32LE(bestDecoded, offset + 0x04)
        .toString(16)
        .padStart(8, '0')}`,
      payload_offset: payloadOffset,
      payload_offset_2: payloadOffset2,
      compressed_size: compressedSize,
      uncompressed_size: uncompressedSize,
      unknown_18: `0x${readUInt32LE(bestDecoded, offset + 0x18)
        .toString(16)
        .padStart(8, '0')}`,
      unknown_1c: `0x${readUInt32LE(bestDecoded, offset + 0x1c)
        .toString(16)
        .padStart(8, '0')}`,
      codec: runtimeCodec(bestDecoded[offset + 0x20]),
      compression_type: bestDecoded[offset + 0x20],
      compression_subtype: bestDecoded[offset + 0x21],
      checksum: `0x${readUInt32LE(bestDecoded, offset + 0x22)
        .toString(16)
        .padStart(8, '0')}`,
      tail: bestDecoded
        .subarray(offset + 0x26, offset + RUNTIME_ENTRY_STRIDE)
        .toString('hex'),
      plausible: plausible ? 'yes' : 'no',
      payload_head: readPayloadHead(filePath, payloadOffset),
    });
  }

  return rows;
}

function extractAudioVehicleAssets(gameRoot: string): AudioVehicleAsset[] {
  const sortDir = path.join(gameRoot, 'Audio', 'AMS2', 'Vehicles', 'Sort');
  const assets: AudioVehicleAsset[] = [];

  function walk(currentDir: string, manufacturer = '') {
    for (const name of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, name.name);
      if (name.isDirectory()) {
        walk(fullPath, manufacturer || name.name);
        continue;
      }
      if (
        !name.isFile() ||
        !name.name.endsWith('.bank') ||
        name.name.endsWith('_AI.bank')
      ) {
        continue;
      }
      assets.push({
        asset_id: path.basename(name.name, '.bank'),
        manufacturer,
        bank_path: path.relative(gameRoot, fullPath),
      });
    }
  }

  walk(sortDir);

  return assets.sort((left, right) =>
    left.asset_id.localeCompare(right.asset_id),
  );
}

function writeSummary(
  gameRoot: string,
  cars: ExtractedCar[],
  tracks: ExtractedTrack[],
  hudMapNames: Set<string>,
  vehiclePacks: KapPack[],
  trackPacks: KapPack[],
  audioVehicleAssets: AudioVehicleAsset[],
  payloadEntries: KapPayloadEntry[],
  runtimeEntries: KapRuntimeEntry[],
) {
  const matchedCars = cars.filter(row => row.app_car !== '');
  const unmatchedCars = cars.filter(row => row.app_car === '');
  const matchedTracks = tracks.filter(row => row.app_name !== '');
  const unmatchedTracks = tracks.filter(row => row.app_name === '');
  const tracksWithHudMap = tracks.filter(row => row.hud_map_name !== '');
  const dhsaVehiclePacks = vehiclePacks.filter(
    row => row.root_entry_magic === 'DHSA',
  );
  const dhsaTrackPacks = trackPacks.filter(
    row => row.root_entry_magic === 'DHSA',
  );
  const packsWithReizaXml = [...vehiclePacks, ...trackPacks].filter(
    row => row.reiza_xml_uncompressed_size > 0,
  );
  const payloadsWithA0F9 = payloadEntries.filter(row =>
    row.payload_head.startsWith('a0f9'),
  );
  const payloadsWithA19E = payloadEntries.filter(row =>
    row.payload_head.startsWith('a19e'),
  );
  const plausibleRuntimeEntries = runtimeEntries.filter(
    row => row.plausible === 'yes',
  );
  const runtimeEntriesWithA0F9 = runtimeEntries.filter(row =>
    row.payload_head.startsWith('a0f9'),
  );
  const runtimeEntriesWithA19E = runtimeEntries.filter(row =>
    row.payload_head.startsWith('a19e'),
  );
  const runtimeSeedCounts = new Map<number, number>();
  const runtimeCodecCounts = new Map<string, number>();
  for (const row of runtimeEntries) {
    runtimeSeedCounts.set(
      row.decode_seed,
      (runtimeSeedCounts.get(row.decode_seed) ?? 0) + 1,
    );
    runtimeCodecCounts.set(
      row.codec,
      (runtimeCodecCounts.get(row.codec) ?? 0) + 1,
    );
  }
  const formatCounts = <T>(counts: Map<T, number>) =>
    [...counts.entries()]
      .sort((left, right) => String(left[0]).localeCompare(String(right[0])))
      .map(([key, count]) => `${key}:${count}`)
      .join(', ');

  const lines = [
    '# AMS2 extraction summary',
    '',
    `- Game root: \`${gameRoot}\``,
    `- Vehicle assets scanned: ${cars.length}`,
    `- Audio vehicle assets scanned: ${audioVehicleAssets.length}`,
    `- Vehicle matches to current app data: ${matchedCars.length}`,
    `- Vehicle unmatched candidates: ${unmatchedCars.length}`,
    `- Track layout assets scanned: ${tracks.length}`,
    `- Track layouts present in HUD_Maps.xml: ${tracksWithHudMap.length}`,
    `- HUD map entries total: ${hudMapNames.size}`,
    `- Track matches to current app data: ${matchedTracks.length}`,
    `- Track unmatched candidates: ${unmatchedTracks.length}`,
    `- Vehicle packs whose first entry is nested \`DHSA\`: ${dhsaVehiclePacks.length}`,
    `- Track packs whose first entry is nested \`DHSA\`: ${dhsaTrackPacks.length}`,
    `- Packs with visible \`Reiza.xml\` size markers: ${packsWithReizaXml.length}`,
    `- Parsed payload records: ${payloadEntries.length}`,
    `- Payload records starting with \`a0f9\`: ${payloadsWithA0F9.length}`,
    `- Payload records starting with \`a19e\`: ${payloadsWithA19E.length}`,
    `- Decoded runtime records: ${runtimeEntries.length}`,
    `- Plausible decoded runtime records: ${plausibleRuntimeEntries.length}`,
    `- Runtime records starting with \`a0f9\`: ${runtimeEntriesWithA0F9.length}`,
    `- Runtime records starting with \`a19e\`: ${runtimeEntriesWithA19E.length}`,
    `- Runtime decode seed distribution: ${formatCounts(runtimeSeedCounts)}`,
    `- Runtime codec distribution: ${formatCounts(runtimeCodecCounts)}`,
    '',
    '## Binary format findings',
    '',
    '- KAP archives expose stable outer-header fields without unpacking.',
    '- Many vehicle and track archives point at a nested `DHSA` blob from the root entry.',
    '- The nested `DHSA` header contains a count at offset `0x08` and a table of 16-byte records starting at `0x10`.',
    '- For sampled packs, the root entry header size equals `0x10 + nested_count * 16`.',
    '- Visible filename markers use the bytes `20 54 58 45` (` TXE`) followed by a 32-bit size and a nul-terminated name, commonly `Reiza.xml`.',
    '- The value after ` TXE` matches a plausible uncompressed XML size, but carved payloads are not accepted as raw Oodle streams, even with that exact size.',
    '- The game loader uses `header[0x12d]` as a field-normalization mode; mode `2` leaves integer fields little-endian/raw.',
    '- Mode `2` block transforms use an RC4-like stream cipher. The key is selected by a caller seed from `AMS2AVX.exe` data at `0x1425507e0 + seed * 0x1b`, then pair-swapped/XORed with key bytes `ac c7 91` before RC4 KSA.',
    '- The loader derives a secondary TOC transform region at `0x438 + header[0x118]`, with size `header[0x120] - 0x308` when `header[0x120] > 0`.',
    '- The root metadata block at `0x130` decodes with a per-pack mode-2 key seed into runtime records with a `0x2a` byte stride.',
    '- The extractor discovers the per-pack root metadata seed by selecting the mode-2 key whose decoded records have plausible aligned payload offsets and sizes.',
    '- Runtime entry records carry source offset, compressed size, uncompressed size, compression bytes, and checksum-like fields.',
    '- Runtime compression byte `1` uses a zlib/inflate-family codec after payload body mode-2 transform; bytes `3` and `4` route to Oodle in the loader.',
    '',
    '## Sample unmatched vehicles',
    '',
    ...unmatchedCars
      .slice(0, 25)
      .map(
        row =>
          `- \`${row.internal_id}\` -> "${row.display_guess}" (score ${row.match_score})`,
      ),
    '',
    '## Sample unmatched tracks',
    '',
    ...unmatchedTracks
      .slice(0, 25)
      .map(
        row =>
          `- \`${row.internal_id}\` -> "${row.display_guess}" (score ${row.match_score})`,
      ),
    '',
  ];

  writeFileSync(path.join(OUTPUT_DIR, 'summary.md'), `${lines.join('\n')}\n`);
}

function main() {
  const gameRoot = path.resolve(process.argv[2] ?? DEFAULT_GAME_ROOT);
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const existingCars = parseCsv<ExistingCar>('src/app/data/cars.csv');
  const existingTracks = parseCsv<ExistingTrack>('src/app/data/tracks.csv');
  const hudMapNames = extractHudMapNames(gameRoot);
  const exe = readFileSync(path.join(gameRoot, 'AMS2AVX.exe'));
  const peSections = parsePeSections(exe);
  const mode2Keys = Array.from(
    { length: ROOT_METADATA_SEED_LIMIT },
    (_, seed) => ({
      seed,
      key: mode2Key(exe, peSections, seed),
    }),
  ).filter(entry => entry.key.length > 0);
  const vehiclePacks = extractKapPacks(
    gameRoot,
    path.join('Pakfiles', 'Vehicles'),
  );
  const trackPacks = extractKapPacks(
    gameRoot,
    path.join('Pakfiles', 'TRACKS'),
  ).filter(pack => pack.pack_id.startsWith('AUT_'));
  const systemPacks = extractKapPacks(gameRoot, 'Pakfiles').filter(pack => {
    return (
      !pack.relative_path.startsWith('Pakfiles/Vehicles/') &&
      !pack.relative_path.startsWith('Pakfiles/TRACKS/')
    );
  });
  const allPacks = [...vehiclePacks, ...trackPacks, ...systemPacks];
  const payloadEntries = allPacks.flatMap(pack =>
    extractKapPayloadEntries(gameRoot, pack),
  );
  const runtimeEntries = allPacks.flatMap(pack =>
    extractKapRuntimeEntries(gameRoot, pack, mode2Keys),
  );
  const audioVehicleAssets = extractAudioVehicleAssets(gameRoot);

  const cars = extractCars(gameRoot, existingCars);
  const tracks = extractTracks(gameRoot, hudMapNames, existingTracks);

  writeCsv('cars.csv', cars);
  writeCsv('tracks.csv', tracks);
  writeCsv('vehicle_packs.csv', vehiclePacks);
  writeCsv('track_packs.csv', trackPacks);
  writeCsv('system_packs.csv', systemPacks);
  writeCsv('pack_payload_entries.csv', payloadEntries);
  writeCsv('pack_runtime_entries.csv', runtimeEntries);
  writeCsv('audio_vehicle_assets.csv', audioVehicleAssets);
  writeSummary(
    gameRoot,
    cars,
    tracks,
    hudMapNames,
    vehiclePacks,
    trackPacks,
    audioVehicleAssets,
    payloadEntries,
    runtimeEntries,
  );
}

if (require.main === module) {
  main();
}
