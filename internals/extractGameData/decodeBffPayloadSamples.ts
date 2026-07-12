import { inflateSync } from 'zlib';
import { closeSync, openSync, readFileSync, readSync, writeFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';
import { stringify } from 'csv-stringify/sync';

const DEFAULT_GAME_ROOT =
  '/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2';
const OUTPUT_DIR = path.resolve('build/extracted/ams2');
const IMAGE_BASE = 0x140000000;
const MODE2_KEY_TABLE_VA = 0x1425507e0;
const MODE2_KEY_STRIDE = 0x1b;
const MODE2_KEY_XOR = [0xac, 0xc7, 0x91];

type PeSection = {
  va: number;
  virtualSize: number;
  rawOffset: number;
  rawSize: number;
};

type RuntimeRow = {
  pack_id: string;
  relative_path: string;
  entry_index: string;
  decode_seed: string;
  payload_offset: string;
  compressed_size: string;
  uncompressed_size: string;
  codec: string;
};

function readRange(filename: string, offset: number, size: number): Buffer {
  const handle = openSync(filename, 'r');
  try {
    const buffer = Buffer.alloc(size);
    const bytesRead = readSync(handle, buffer, 0, size, offset);
    return buffer.subarray(0, bytesRead);
  } finally {
    closeSync(handle);
  }
}

function u16(buffer: Buffer, offset: number): number {
  return buffer.readUInt16LE(offset);
}

function u32(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

function parsePeSections(exe: Buffer): PeSection[] {
  const pe = exe.indexOf(Buffer.from('PE\0\0', 'ascii'));
  const count = u16(exe, pe + 6);
  const optionalSize = u16(exe, pe + 20);
  const table = pe + 24 + optionalSize;
  return Array.from({ length: count }, (_, index) => {
    const offset = table + index * 40;
    return {
      va: IMAGE_BASE + u32(exe, offset + 12),
      virtualSize: u32(exe, offset + 8),
      rawOffset: u32(exe, offset + 20),
      rawSize: u32(exe, offset + 16),
    };
  });
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
    throw new Error(`VA 0x${va.toString(16)} is not covered by a PE section`);
  }
  return exe.subarray(
    section.rawOffset + va - section.va,
    section.rawOffset + va - section.va + size,
  );
}

function mode2Key(exe: Buffer, sections: PeSection[], seed: number): Buffer {
  const raw = readVa(
    exe,
    sections,
    MODE2_KEY_TABLE_VA + seed * MODE2_KEY_STRIDE,
    0x4000,
  );
  const nul = raw.indexOf(0);
  const key = Buffer.from(raw.subarray(0, nul >= 0 ? nul : raw.length));
  let keyIndex = 0;
  for (let offset = 0; offset + 1 < key.length; offset += 2) {
    const first = key[offset];
    const second = key[offset + 1];
    key[offset] = second ^ MODE2_KEY_XOR[(keyIndex + 1) % 3];
    key[offset + 1] = first ^ MODE2_KEY_XOR[keyIndex];
    keyIndex = (keyIndex + 2) % 3;
  }
  if (key.length % 2 === 1) {
    key[key.length - 1] ^= MODE2_KEY_XOR[keyIndex];
  }
  return key;
}

function rc4(data: Buffer, key: Buffer): Buffer {
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

function stringList(buffer: Buffer): string[] {
  const found: string[] = [];
  let start = -1;
  for (let index = 0; index <= buffer.length; index += 1) {
    const byte = index < buffer.length ? buffer[index] : 0;
    const printable = byte >= 0x20 && byte < 0x7f;
    if (printable && start < 0) start = index;
    if ((!printable || index === buffer.length) && start >= 0) {
      if (index - start >= 6)
        found.push(buffer.subarray(start, index).toString('ascii'));
      start = -1;
    }
  }
  return [...new Set(found)];
}

function strings(buffer: Buffer): string {
  return stringList(buffer).slice(0, 24).join('|');
}

function main() {
  const gameRoot = path.resolve(process.argv[2] ?? DEFAULT_GAME_ROOT);
  const maxPerPack = Number(process.argv[3] ?? 12);
  const maxCompressedSize = Number(process.argv[4] ?? 20_000);
  const parsed = Papa.parse<RuntimeRow>(
    readFileSync(path.join(OUTPUT_DIR, 'pack_runtime_entries.csv'), 'utf8'),
    { header: true, skipEmptyLines: true },
  );
  const rows = parsed.data as RuntimeRow[];
  const selected: RuntimeRow[] = [];
  const counts = new Map<string, number>();
  for (const row of rows
    .filter(
      candidate =>
        candidate.codec === 'zlib' &&
        Number(candidate.compressed_size) <= maxCompressedSize,
    )
    .sort(
      (left, right) =>
        Number(left.compressed_size) - Number(right.compressed_size),
    )) {
    const count = counts.get(row.pack_id) ?? 0;
    if (count >= maxPerPack) continue;
    selected.push(row);
    counts.set(row.pack_id, count + 1);
  }
  const exe = readFileSync(path.join(gameRoot, 'AMS2AVX.exe'));
  const sections = parsePeSections(exe);
  const keys = new Map(
    Array.from({ length: 64 }, (_, seed) => [
      seed,
      mode2Key(exe, sections, seed),
    ]),
  );
  const outputRows: object[] = [];
  const physicsCandidateRows: object[] = [];
  const hrdfTrackCandidateRows: object[] = [];
  const bootflowIndexRows: object[] = [];
  const bootflowDetailRows: object[] = [];
  for (const row of selected) {
    const packPath = path.join(gameRoot, row.relative_path);
    const offset = Number(row.payload_offset);
    const compressed = readRange(packPath, offset, Number(row.compressed_size));
    let decoded: Buffer;
    let status = 'ok';
    try {
      decoded = inflateSync(
        rc4(compressed, keys.get(Number(row.decode_seed))!),
      );
    } catch (error) {
      decoded = Buffer.alloc(0);
      status = error instanceof Error ? error.message : String(error);
    }
    outputRows.push({
      pack_id: row.pack_id,
      entry_index: row.entry_index,
      compressed_size: row.compressed_size,
      expected_uncompressed_size: row.uncompressed_size,
      actual_uncompressed_size: decoded.length,
      status,
      magic: decoded.subarray(0, 4).toString('ascii'),
      head: decoded.subarray(0, 32).toString('hex'),
      strings: strings(decoded),
      xml_like: /<[^>]+>/.test(decoded.subarray(0, 65536).toString('latin1'))
        ? 'yes'
        : 'no',
    });
    const magic = decoded.subarray(0, 4).toString('ascii');
    if (row.pack_id === 'BOOTFLOW' && magic.startsWith('<?xm')) {
      const xml = decoded.toString('utf8');
      if (/<data class="(?:VehicleDetails|TrackDetails)"/.test(xml)) {
        bootflowDetailRows.push({
          entry_index: row.entry_index,
          expected_uncompressed_size: row.uncompressed_size,
          xml,
        });
      }
    }
    if (row.pack_id === 'BOOTFLOW' && (magic === 'Trac' || magic === 'vehi')) {
      const assetType = magic === 'Trac' ? 'track' : 'car';
      for (const assetPath of stringList(decoded).filter(value =>
        assetType === 'track'
          ? /^Tracks\\.*\\@.*\.trd$/i.test(value)
          : /^vehicles\\.*\\.*\.crd$/i.test(value),
      )) {
        bootflowIndexRows.push({
          asset_type: assetType,
          asset_path: assetPath,
          source_pack: row.relative_path,
          source_entry_index: row.entry_index,
          source_magic: magic,
        });
      }
    }
    if (
      row.pack_id === 'PHYSICSPERSISTENT' &&
      decoded.subarray(0, 4).toString('ascii').startsWith('Q')
    ) {
      physicsCandidateRows.push({
        pack_id: row.pack_id,
        entry_index: row.entry_index,
        expected_uncompressed_size: row.uncompressed_size,
        decoded_size: decoded.length,
        magic_hex: decoded.subarray(0, 8).toString('hex'),
        strings: stringList(decoded).join('|'),
      });
    }
    if (
      row.pack_id === 'HRDFPERSISTENT' &&
      decoded.subarray(0, 4).toString('ascii').startsWith('Q')
    ) {
      const fullStrings = stringList(decoded);
      if (fullStrings.includes('Tracks')) {
        hrdfTrackCandidateRows.push({
          pack_id: row.pack_id,
          entry_index: row.entry_index,
          expected_uncompressed_size: row.uncompressed_size,
          decoded_size: decoded.length,
          magic_hex: decoded.subarray(0, 8).toString('hex'),
          strings: fullStrings.join('|'),
        });
      }
    }
  }
  writeFileSync(
    path.join(OUTPUT_DIR, 'payload_sample_scan.csv'),
    stringify(outputRows, { header: true }),
  );
  writeFileSync(
    path.join(OUTPUT_DIR, 'physics_vehicle_candidates.csv'),
    stringify(physicsCandidateRows, { header: true }),
  );
  writeFileSync(
    path.join(OUTPUT_DIR, 'hrdf_track_candidates.csv'),
    stringify(hrdfTrackCandidateRows, { header: true }),
  );
  writeFileSync(
    path.join(OUTPUT_DIR, 'bootflow_asset_index.csv'),
    stringify(bootflowIndexRows, { header: true }),
  );
  writeFileSync(
    path.join(OUTPUT_DIR, 'bootflow_detail_payloads.csv'),
    stringify(bootflowDetailRows, { header: true }),
  );
  console.log(`Scanned ${outputRows.length} decoded payload samples`);
}

if (require.main === module) main();
