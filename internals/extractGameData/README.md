This extractor is a first pass over the installed Automobilista 2 files.

It does not fully unpack `.bff` archives yet. Instead it uses:

- `Pakfiles/Vehicles/*.bff` base asset names for car candidates
- `Pakfiles/TRACKS/AUT_*.bff` base asset names for track/layout candidates
- `GUI/HUD_1_6/HUD_Maps.xml` for canonical track map identifiers
- `Audio/AMS2/Vehicles/Sort/**/*.bank` for canonical vehicle audio asset ids
- KAP outer headers and the nested `DHSA` header in each first pack entry
- loader-derived KAP secondary TOC offsets identified from `AMS2AVX.exe`

The output is written to `build/extracted/ams2/` and includes:

- `cars.csv`: extracted vehicle asset ids with best-effort matches to `src/app/data/cars.csv`
- `tracks.csv`: extracted track layout ids with best-effort matches to `src/app/data/tracks.csv`
- `vehicle_packs.csv`: parsed KAP header fields for every vehicle pack
- `track_packs.csv`: parsed KAP header fields for every track pack
- `pack_payload_entries.csv`: carved KAP/DHSA payload offsets, sizes, record ids, record kinds, and first bytes
- `pack_runtime_entries.csv`: decoded loader-equivalent runtime records with
  payload offsets, compressed/uncompressed sizes, discovered seed, inferred
  codec, checksum-like fields, and first payload bytes
- `audio_vehicle_assets.csv`: exact audio vehicle asset ids from the game install
- `system_packs.csv`: parsed headers for persistent physics/career packs
- `summary.md`: high-level coverage and unmatched samples

The auxiliary probe script writes mode-2 transform candidates:

```sh
pnpm exec ts-node ./internals/extractGameData/probeBffTransforms.ts
```

By default it probes the first Brands Hatch payload and writes candidate files plus
`mode2_probe.csv` under `build/extracted/ams2/probes/`.

The Frida runtime dumper attaches to a running AMS2 process and writes decoded
runtime buffers under `build/extracted/ams2/frida/`:

```sh
pnpm run dump-game-data-runtime -- --process AMS2AVX.exe
```

If the game runs under Proton/Wine with a different visible process name, first
list Frida-visible processes:

```sh
pnpm run dump-game-data-runtime -- --list
```

Because this host currently has `ptrace_scope=1`, attaching to a game process
that was already launched by Steam may be blocked. Prefer spawning the target
under Frida, or temporarily relax ptrace if attaching to an existing process is
necessary.

Spawn example for a direct Wine run:

```sh
python3 ./internals/extractGameData/frida/dumpAms2BffRuntime.py \
  --cwd "/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2" \
  --realm emulated \
  --follow-children \
  --spawn wine "/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2/AMS2AVX.exe"
```

Note: the currently installed Linux Frida build reports
`unable to handle emulated processes due to build configuration` for
`--realm emulated`. Native Frida can instrument Wine ELF processes, but cannot
see or hook `AMS2AVX.exe` PE module addresses on this host.

Useful optional flags:

- `--pid <pid>`: attach to a specific process when several names match.
- `--output <dir>`: write dumps somewhere other than `build/extracted/ams2/frida`.
- `--duration <seconds>`: detach after a bounded probe window.
- `--cwd <dir>`: working directory for `--spawn`.
- `--kill-spawn-on-exit`: kill the spawned parent process when the runner exits.
- `--realm emulated`: attach to Wine's emulated Windows/PE realm instead of
  native ELF modules.
- `--follow-children`: follow Wine/Proton child processes through Frida
  child-gating.
- `--dump-oodle-buffers`: dump all Oodle source/output buffers, not just the
  known runtime call-site source buffer. This can be noisy.

The dumper currently hooks:

- `AMS2AVX.exe!0x141ad4c30`: KAP loader; dumps the post-loader KAP header and
  secondary TOC region.
- `AMS2AVX.exe!0x141ad5180`: block transform entry; logs register/caller state.
- `AMS2AVX.exe!0x140d52778`: runtime Oodle call site; dumps the compressed source
  buffer using the live runtime sizes.
- `oo2core_4_win64.dll!OodleLZ_Decompress`: logs export calls, and optionally
  dumps source/output buffers.

Current exact findings:

- The `.bff` files are `KAP` archives.
- Many vehicle and track archives point at a nested `DHSA` blob from the root entry.
- In sampled packs, `root_entry_header_size == 0x10 + nested_count * 16`.
- Visible filename records use the marker bytes `20 54 58 45` (` TXE`), followed by a 32-bit size and a nul-terminated name. The visible name is commonly `Reiza.xml`.
- That 32-bit value is a plausible uncompressed size for `Reiza.xml`; for example `AUT_BrandsHatch_GP.bff` stores `Reiza.xml:2666`.
- `AMS2AVX.exe` treats `header[0x12d]` as a field-normalization mode. Mode `2`, used by sampled packs, leaves integer fields little-endian/raw.
- Mode `2` block transforms use an RC4-like stream cipher. The key is selected by a caller seed from `AMS2AVX.exe` data at `0x1425507e0 + seed * 0x1b`, then pair-swapped/XORed with key bytes `ac c7 91` before RC4 key scheduling.
- The loader derives a secondary TOC transform region at `0x438 + header[0x118]`, with size `header[0x120] - 0x308` when `header[0x120] > 0`. These values are now emitted in `vehicle_packs.csv` and `track_packs.csv`.
- The root metadata block at `0x130` has size `entry_count * 0x2a` and decodes
  with a per-pack mode-2 key seed into loader-equivalent runtime records.
- The extractor discovers the per-pack root metadata seed by trying seeds
  `0..63` and selecting the decoded table whose payload offsets/sizes are
  plausible. Current scanned packs use seeds `2`, `3`, and `4`.
- Runtime entry records include source offset, compressed size, uncompressed
  size, compression bytes, and checksum-like fields. All 170,665 decoded
  runtime rows are currently structurally plausible.
- Runtime compression byte `1` uses zlib/inflate after the payload body is
  transformed with the same mode-2 seed. Brands Hatch runtime entry `0`
  decodes with seed `2`, inflates from `1252` to `3036` bytes, and starts with
  `BLMY`.
- Runtime compression bytes `3` and `4` route to `OodleLZ_Decompress` in the
  loader. The currently scanned runtime rows are `raw` or `zlib`, so Oodle is
  not on the immediate metadata path.

Current limitation:

- This is still not enough to regenerate `src/app/data/cars.csv` and `src/app/data/tracks.csv` exactly. Car display names, class membership, discipline, and year are not yet coming from a fully authoritative parsed source.
- The remaining exact-data blocker is parsing the decoded payload formats and
  the secondary/name region that maps visible names such as `Reiza.xml` to
  decoded runtime records.
- `Audio/MasterBank.strings.bank` contains a `car_classes/` string region, but it is an FMOD FEV/RIFF strings bank with fragmented shared string pieces, not direct event paths from `strings(1)`.

Run with:

```sh
pnpm exec ts-node ./internals/extractGameData/index.ts
```

After extraction, scan a bounded sample of decoded zlib payloads for binary
magic values and embedded strings:

```sh
pnpm run scan-game-payloads
```

The result is `build/extracted/ams2/payload_sample_scan.csv`. This is an
exploration aid; it does not infer or generate app CSV values.

The same scan writes `physics_vehicle_candidates.csv` for decoded `Q` records
from `PHYSICSPERSISTENT.bff`. These records contain the authoritative-looking
vehicle identity and physics class chains, but their individual fields still
need to be mapped before they can safely generate `cars.csv`.

Cross-check those exact identifiers against the current app data with:

```sh
./node_modules/.bin/ts-node internals/extractGameData/crossCheckPhysicsVehicles.ts
```

This writes `physics_vehicle_crosscheck.csv` and a summary. Matching here is
only evidence validation; it is deliberately not used to generate app data.

The scan also writes `hrdf_track_candidates.csv`, preserving complete string
tables from `HRDFPERSISTENT` objects that contain `Tracks`. These are useful
career/motorsport group candidates, not yet the final track CSV.

Cross-check those HRDF identifiers against the current track extraction with:

```sh
./node_modules/.bin/ts-node internals/extractGameData/crossCheckHrdfTracks.ts
```

This writes `hrdf_track_crosscheck.csv` and a summary without using fuzzy
matching to generate any track values.

Or pass a custom game root:

```sh
pnpm exec ts-node ./internals/extractGameData/index.ts "/path/to/Automobilista 2"
```
