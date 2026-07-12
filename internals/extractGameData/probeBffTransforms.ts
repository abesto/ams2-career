import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const DEFAULT_GAME_ROOT =
  '/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2';
const IMAGE_BASE = 0x140000000;
const MODE2_KEY_TABLE_VA = 0x1425507e0;
const MODE2_KEY_STRIDE = 0x1b;
const MODE2_KEY_XOR = [0xac, 0xc7, 0x91];

type PeSection = {
  name: string;
  va: number;
  virtualSize: number;
  rawOffset: number;
  rawSize: number;
};

function readUInt16LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt16LE(offset);
}

function readUInt32LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
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
      name: exe.subarray(offset, offset + 8).toString('ascii').replace(/\0+$/, ''),
      virtualSize: readUInt32LE(exe, offset + 8),
      va: IMAGE_BASE + readUInt32LE(exe, offset + 12),
      rawSize: readUInt32LE(exe, offset + 16),
      rawOffset: readUInt32LE(exe, offset + 20),
    });
  }

  return sections;
}

function readVa(exe: Buffer, sections: PeSection[], va: number, size: number): Buffer {
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

function printableScore(data: Buffer): number {
  return data.subarray(0, 256).filter(byte => {
    return byte === 9 || byte === 10 || byte === 13 || (byte >= 0x20 && byte < 0x7f);
  }).length;
}

function main() {
  const gameRoot = path.resolve(process.argv[2] ?? DEFAULT_GAME_ROOT);
  const relativePack =
    process.argv[3] ?? path.join('Pakfiles', 'TRACKS', 'AUT_BrandsHatch_GP.bff');
  const offset = Number(process.argv[4] ?? 0x1e80);
  const size = Number(process.argv[5] ?? 1252);
  const outputDir = path.resolve(process.argv[6] ?? 'build/extracted/ams2/probes');

  const exe = readFileSync(path.join(gameRoot, 'AMS2AVX.exe'));
  const sections = parsePeSections(exe);
  const pack = readFileSync(path.join(gameRoot, relativePack));
  const block = pack.subarray(offset, offset + size);

  mkdirSync(outputDir, { recursive: true });

  const rows = ['seed,key_length,key_hex,head_hex,printable_score'];
  for (let seed = 0; seed < 64; seed += 1) {
    const key = mode2Key(exe, sections, seed);
    if (key.length === 0) {
      continue;
    }

    const decoded = rc4(block, key);
    writeFileSync(path.join(outputDir, `seed${seed.toString().padStart(2, '0')}.bin`), decoded);
    rows.push(
      [
        seed,
        key.length,
        key.toString('hex'),
        decoded.subarray(0, 16).toString('hex'),
        printableScore(decoded),
      ].join(','),
    );
  }

  writeFileSync(path.join(outputDir, 'mode2_probe.csv'), `${rows.join('\n')}\n`);
  console.log(`Wrote ${outputDir}`);
}

if (require.main === module) {
  main();
}
