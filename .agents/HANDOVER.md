## Handover: AMS2 Game Data Extraction

Repo: `/home/abesto/Projects/ams2-career`

Current HEAD: `becd55c`

Date of this handover: 2026-07-11

Primary user goal:

- Build a reproducible extractor for Automobilista 2 car and track metadata.
- Source game install: `/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2/`
- Target app data to eventually regenerate exactly:
  - `src/app/data/cars.csv`
  - `src/app/data/tracks.csv`
  - likely also related class/discipline CSVs later.
- Fuzzy matching against current CSVs is acceptable only as a cross-check. It is not an acceptable final generation strategy.

Current status:

- A first extractor exists and runs quickly.
- It finds car/track candidate assets, parses stable KAP/BFF header fields, decodes loader-equivalent runtime records, records cross-check matches to the current CSVs, and writes generated CSVs under `build/extracted/ams2/`.
- It does not yet parse the decoded payload formats or secondary/name mapping, so it cannot yet regenerate the app CSVs exactly.
- The current hard blocker is parsing decoded `BLMY`/metadata payloads and the secondary/name region that maps visible names such as `Reiza.xml` to runtime records.

## 2026-07-12 Update

Major progress after Frida install and further static RE:

- Added a Frida runtime dumper under `internals/extractGameData/frida/`, plus `package.json` script `dump-game-data-runtime`.
- Host Frida can spawn and instrument native Linux processes, but the installed Frida build cannot attach to Wine's emulated PE realm: it reports `unable to handle emulated processes due to build configuration`. Native Wine ELF instrumentation cannot see `AMS2AVX.exe` PE module addresses.
- Static RE established that the root metadata block at file offset `0x130` has size `entry_count * 0x2a` and decodes into the runtime record table.
- The root metadata block uses the existing mode-2 RC4 transform, but the seed is per pack. The extractor now tries seeds `0..63` and selects the seed whose decoded records have plausible aligned payload offsets/sizes.
- Current scanned runtime records: `170665`; plausible decoded runtime records: `170665`.
- Current runtime seed distribution: `2:18971`, `3:791`, `4:150903`.
- New generated CSV: `build/extracted/ams2/pack_runtime_entries.csv`.
- Runtime records include exact payload offset, compressed size, uncompressed size, compression bytes, checksum-like fields, and first payload bytes.
- Runtime compression byte `1` is zlib/inflate-family after payload body mode-2 transform. Confirmed Brands Hatch runtime entry `0`: seed `2`, payload `1252` bytes, inflates to `3036` bytes, starts with `BLMY`.
- Runtime compression bytes `3` and `4` route to `OodleLZ_Decompress`, but current scanned runtime rows are `raw` or `zlib`, so Oodle is not on the immediate metadata path.
- The previous `pack_payload_entries.csv` static `DHSA` carving is still kept as evidence, but it is not the authoritative runtime order/size source for many packs.
- Next best step: implement payload body decode in TypeScript (`mode2` transform using the discovered per-pack seed, then zlib for codec `1`) and start reverse-engineering/parsing the resulting `BLMY` payload format plus secondary/name region.

## Worktree State

Known changed/untracked files from this task:

- `package.json`
- `.agents/HANDOVER.md`
- `internals/extractGameData/README.md`
- `internals/extractGameData/index.ts`
- `internals/extractGameData/probeBffTransforms.ts`
- `internals/extractGameData/frida/dumpAms2BffRuntime.js`
- `internals/extractGameData/frida/dumpAms2BffRuntime.py`
- `internals/extractGameData/ghidra/DecompileAms2Bff.java`

Generated artifacts:

- `build/extracted/ams2/audio_vehicle_assets.csv`
- `build/extracted/ams2/cars.csv`
- `build/extracted/ams2/pack_payload_entries.csv`
- `build/extracted/ams2/pack_runtime_entries.csv`
- `build/extracted/ams2/summary.md`
- `build/extracted/ams2/track_packs.csv`
- `build/extracted/ams2/tracks.csv`
- `build/extracted/ams2/vehicle_packs.csv`
- `build/extracted/ams2/probes/mode2_probe.csv`
- `build/extracted/ams2/probes/seed*.bin`

Note: generated `build/` output may be ignored by git. Do not assume lack of `git status` output means those artifacts are absent.

## Added Commands

`package.json` now has:

```json
"extract-game-data": "ts-node ./internals/extractGameData/index.ts",
"dump-game-data-runtime": "python3 ./internals/extractGameData/frida/dumpAms2BffRuntime.py",
"probe-bff-transforms": "ts-node ./internals/extractGameData/probeBffTransforms.ts"
```

Run the extractor:

```sh
./node_modules/.bin/ts-node ./internals/extractGameData/index.ts
```

Equivalent package script:

```sh
pnpm exec ts-node ./internals/extractGameData/index.ts
```

Run the transform probe:

```sh
./node_modules/.bin/ts-node ./internals/extractGameData/probeBffTransforms.ts
```

Equivalent package script:

```sh
pnpm exec ts-node ./internals/extractGameData/probeBffTransforms.ts
```

Pass custom args to the probe:

```sh
./node_modules/.bin/ts-node ./internals/extractGameData/probeBffTransforms.ts \
  "/path/to/Automobilista 2" \
  "Pakfiles/TRACKS/AUT_BrandsHatch_GP.bff" \
  7808 \
  1252 \
  "build/extracted/ams2/probes"
```

Arguments are:

- game root
- pack path relative to game root
- byte offset
- byte size
- output directory

## Verification Baseline

These passed after the latest changes:

```sh
./node_modules/.bin/ts-node ./internals/extractGameData/index.ts
./node_modules/.bin/ts-node ./internals/extractGameData/probeBffTransforms.ts
./node_modules/.bin/tsc --noEmit
```

The extractor run currently completes in roughly 2 seconds.

## Extractor Outputs

`internals/extractGameData/index.ts` writes to `build/extracted/ams2/`.

Output files:

- `cars.csv`: vehicle pack-derived asset IDs with best-effort matches to `src/app/data/cars.csv`. This is a cross-check, not a final source of truth.
- `tracks.csv`: track pack-derived layout IDs with best-effort matches to `src/app/data/tracks.csv`. This is a cross-check, not a final source of truth.
- `vehicle_packs.csv`: KAP header fields for every vehicle `.bff`.
- `track_packs.csv`: KAP header fields for `Pakfiles/TRACKS/AUT_*.bff`.
- `pack_payload_entries.csv`: carved payload offsets/sizes/record IDs/record kinds/first 16 bytes.
- `audio_vehicle_assets.csv`: exact audio vehicle asset IDs from FMOD `.bank` filenames.
- `summary.md`: current counts and reverse-engineering findings.

Current summary counts:

- Vehicle assets scanned: 291
- Audio vehicle assets scanned: 173
- Vehicle matches to current app data: 184
- Vehicle unmatched candidates: 107
- Track layout assets scanned: 211
- Track layouts present in `HUD_Maps.xml`: 198
- HUD map entries total: 239
- Track matches to current app data: 166
- Track unmatched candidates: 45
- Vehicle packs whose first entry is nested `DHSA`: 1440
- Track packs whose first entry is nested `DHSA`: 270
- Packs with visible `Reiza.xml` size markers: 1749
- Parsed payload records: 93869
- Payload records starting with `a0f9`: 17325
- Payload records starting with `a19e`: 76543

## Exact Data Sources Already Used

Current extractor reads:

- `Pakfiles/Vehicles/*.bff`
- `Pakfiles/TRACKS/AUT_*.bff`
- `GUI/HUD_1_6/HUD_Maps.xml`
- `Audio/AMS2/Vehicles/Sort/**/*.bank`
- `src/app/data/cars.csv`
- `src/app/data/tracks.csv`

Useful exact sources:

- `GUI/HUD_1_6/HUD_Maps.xml` has canonical-ish track map identifiers such as `BrandsHatch_GP`, `Hockenheim_GP`, etc.
- `Audio/AMS2/Vehicles/Sort/**/*.bank`, excluding `_AI.bank`, has exact vehicle audio asset IDs and manufacturer-ish directory names.

Limitations of current exact sources:

- They do not provide exact car display names, years, class membership, or discipline.
- They do not provide full track display names/configuration grouping in the exact format needed by current app CSVs.
- They are useful cross-checks, not sufficient final sources.

## Internet Research

Earlier search found no trustworthy public AMS2 `.bff` extraction script.

The game appears to share heritage with Madness Engine / Project CARS `.bff` concepts, but public format descriptions were insufficient and should not be trusted without local binary confirmation.

QuickBMS helper scripts were used only for decompression experiments, not as trusted format documentation.

Useful URL that was used:

- `https://aluigi.altervista.org/bms/comtype_scan2.bms`

Do not spend more time on generic web searches unless looking for very specific named functions/formats. Local reverse engineering has been more productive.

## Tools Installed / Available

Installed and available:

- `ghidra`
- `rizin`
- `rz-bin`
- `rz-find`
- `radare2`
- `objdump`
- `wine`

QuickBMS:

- Linux QuickBMS compile failed on this host.
- Windows QuickBMS zip was downloaded by the user to `~/Downloads/quickbms.zip`.
- It was extracted to `/tmp/quickbms-win`.
- Executable used: `/tmp/quickbms-win/quickbms.exe`
- Running it under Wine requires escalation in Codex.

Known working Wine/QuickBMS pattern:

```sh
wine /tmp/quickbms-win/quickbms.exe -o script.bms input.bin output_dir
```

Codex escalation rule that was used:

- `sandbox_permissions: "require_escalated"`
- `prefix_rule: ["wine", "/tmp/quickbms-win/quickbms.exe"]`

## Ghidra Usage

Headless Ghidra initially failed because it tried to write config under the real home directory. Use redirected config:

```sh
env HOME=/tmp XDG_CONFIG_HOME=/tmp/.config GHIDRA_JAVA_HOME=/usr/lib/jvm/default \
  /opt/ghidra/support/analyzeHeadless ...
```

Full PE analysis of `AMS2AVX.exe` is slow and unnecessary for most next steps.

Use targeted no-analysis decompile through:

- `internals/extractGameData/ghidra/DecompileAms2Bff.java`

Example targeted import:

```sh
rm -rf /tmp/ghidra-ams2-target
mkdir -p /tmp/ghidra-ams2-target

env HOME=/tmp XDG_CONFIG_HOME=/tmp/.config GHIDRA_JAVA_HOME=/usr/lib/jvm/default \
  /opt/ghidra/support/analyzeHeadless /tmp/ghidra-ams2-target AMS2Target \
  -import "/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2/AMS2AVX.exe" \
  -noanalysis \
  -scriptPath internals/extractGameData/ghidra \
  -postScript DecompileAms2Bff.java \
  0x141ad4c30 0x141ad57c0 0x1416f3fc0 0x1416f4910
```

Example subsequent targeted processing of existing project:

```sh
env HOME=/tmp XDG_CONFIG_HOME=/tmp/.config GHIDRA_JAVA_HOME=/usr/lib/jvm/default \
  /opt/ghidra/support/analyzeHeadless /tmp/ghidra-ams2-target AMS2Target \
  -process AMS2AVX.exe \
  -noanalysis \
  -scriptPath internals/extractGameData/ghidra \
  -postScript DecompileAms2Bff.java \
  0x141ad5180 0x141ad51d0 0x141ad5220 0x141ad5260
```

## BFF / KAP Format Findings

File magic:

- `.bff` files are KAP archives.
- Magic at file offset `0x00`: bytes `20 4b 41 50`, ASCII ` KAP`.

KAP outer header fields used by the extractor:

- `header_magic`: ASCII from `0x00..0x03`
- `header_mode`: `u32 @ 0x04`
- `entry_count`: `u32 @ 0x08`
- `header_data_offset`: `u32 @ 0x0c`
- `root_entry_size`: `u32 @ 0x118`
- `root_entry_compressed_size`: `u32 @ 0x120`
- `root_entry_offset`: `u32 @ 0x124`
- `root_entry_header_size`: `u32 @ 0x128`
- `root_entry_flags`: `u32 @ 0x12c`
- `header_transform_mode`: byte `0x12d`

Loader-confirmed points:

- `header[0x12d]` is a field/block transform mode.
- Mode `2` leaves integer fields little-endian/raw.
- Mode `2` block transforms use an RC4-like stream cipher when called for block data.
- The key is selected by a caller-supplied seed from `AMS2AVX.exe` data at `0x1425507e0 + seed * 0x1b`.
- The selected C-string key is pair-swapped/XORed with repeating bytes `ac c7 91` before RC4 KSA.
- RC4 PRGA is at `0x140d101f0`.
- KSA-like function is at `0x140d10180`.
- Mode dispatcher is at `0x141ad5260`.
- Mode-2 block helper is at `0x141ad57c0`.
- The similar mode-1 helper is at `0x141ad5470`.

Nested `DHSA`:

- Many vehicle/track archives have the root entry pointing to a nested `DHSA` blob.
- `DHSA` magic appears at `root_entry_offset`.
- Nested count is `u32 @ root_entry_offset + 0x08`.
- Nested records start at `root_entry_offset + 0x10`.
- Nested records observed by the current static parser are 16 bytes each:
  - `record_id = u32 +0`
  - `record_kind = u32 +4`
  - `payload_size = u32 +8`
  - `u32 +12`, usually zero in sampled packs.
- Payload start is currently carved as `align16(root_entry_offset + root_entry_header_size)`.
- Each payload offset advances by `align16(previous_payload_offset + payload_size)`.

Important caveat:

- The static 16-byte `DHSA` records are not necessarily the same as the runtime records used by the loader after decoding/transformation.
- Runtime records observed in the loader use a `0x2a` byte stride.
- Runtime records include at least:
  - source offset at `+0x08`
  - compressed size at `+0x10`
  - uncompressed size at `+0x14`
  - compression/type byte at `+0x20`
  - checksum at `+0x22`

Visible filename markers:

- Visible filename marker bytes: `20 54 58 45`, ASCII-ish ` TXE`.
- Marker layout: marker, then 32-bit size, then nul-terminated visible name.
- Common visible name: `Reiza.xml`.
- The 32-bit value is a plausible uncompressed size.

Secondary TOC:

- The loader derives a secondary TOC transform region at:
  - `0x438 + header[0x118]`
- Its transform size is:
  - `header[0x120] - 0x308`, when `header[0x120] > 0`
- These values are emitted in `vehicle_packs.csv` and `track_packs.csv`:
  - `secondary_toc_offset`
  - `secondary_toc_transform_size`
  - `runtime_entry_stride`

Key loader/decode addresses:

- `0x141ad4c30`: KAP buffer loader/validator.
- `0x141ad4ff0`: checks/uses `header[0x12d]`.
- `0x141ad50c0`: integer field normalization helper for header fields.
- `0x141ad5180`: transforms blocks using `header[0x12d]`.
- `0x141ad5260`: transform mode dispatcher.
- `0x141ad5470`: mode-1 block transform helper.
- `0x141ad57c0`: mode-2 block transform helper.
- `0x140d10180`: RC4 KSA-like function.
- `0x140d101f0`: RC4 PRGA-like function.
- `0x140d520c0`: archive open/read path, applies KAP loader, then transforms record bodies with seed from object `+0x4b8`.
- `0x140d52242`: loads transform seed from archive object field `+0x4b8`.
- `0x140d52256`: transforms each runtime entry body via `0x141ad5180`.
- `0x140d5242e..0x140d5286f`: runtime payload processing loop using `0x2a` records.
- `0x140d52778`: direct `OodleLZ_Decompress` call for compression byte 3/4 path.
- `0x140c88530`: smaller Oodle wrapper.
- `0x1416f3fc0`: complex generated codec/dataflow layer involved in secondary TOC processing. This is still not fully understood.
- `0x1416f4910`: align16 helper, returns `(value + 0xf) & 0xfffffff0`.

## Brands Hatch Probe Case

Primary sample pack:

```text
/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2/Pakfiles/TRACKS/AUT_BrandsHatch_GP.bff
```

Static parsed pack row:

```text
pack_id=AUT_BrandsHatch_GP
relative_path=Pakfiles/TRACKS/AUT_BrandsHatch_GP.bff
file_size=3012333
entry_count=45
header_data_offset=7808
root_entry_size=1890
root_entry_compressed_size=3442
root_entry_offset=7066
root_entry_header_size=736
root_entry_flags=0x200
root_entry_magic=DHSA
root_entry_nested_count=45
reiza_xml_uncompressed_size=2666
visible_names=Reiza.xml:2666
```

Important offsets:

- `Reiza.xml` metadata name appears around file offset `0x89a`.
- ` TXE` marker for it starts at `0x892`.
- Root metadata block starts at `0x130`, size `1890`.
- Secondary TOC transform region starts at `0xb9a`, size `2666`.
- Nested `DHSA` header starts at `0x1b9a`.
- First carved payload starts at `0x1e80`, size `1252`.
- Duplicate/similar 1252-byte payload appears at `0x2b1700`.

Current static payload row for first payload:

```text
AUT_BrandsHatch_GP,Pakfiles/TRACKS/AUT_BrandsHatch_GP.bff,0,0,1,7808,1252,a0f93f2c9d778cdbe056c51bf1d88e8f
```

Important correction:

- The first carved payload being size `1252` and the `Reiza.xml` size being `2666` does not prove that the first carved payload is the compressed XML.
- The loader must first decode/transform the secondary TOC / runtime records. Only then can we know which record maps to `Reiza.xml`, the real compressed size, the real uncompressed size, and the compression byte.

## RC4 / Mode-2 Probe

`internals/extractGameData/probeBffTransforms.ts` implements:

- PE section parsing for `AMS2AVX.exe`.
- VA-to-file-offset mapping.
- Key extraction from `0x1425507e0 + seed * 0x1b`.
- Key pair-swap/XOR with repeating `ac c7 91`.
- RC4 KSA/PRGA.
- Candidate decoding of an arbitrary BFF byte range for seeds `0..63`.

Default probe target:

- Game root: default AMS2 install path.
- Pack: `Pakfiles/TRACKS/AUT_BrandsHatch_GP.bff`
- Offset: `0x1e80` decimal `7808`
- Size: `1252`
- Output dir: `build/extracted/ams2/probes`

Probe output:

- `build/extracted/ams2/probes/mode2_probe.csv`
- `build/extracted/ams2/probes/seedNN.bin`

First seed example from `mode2_probe.csv`:

```text
seed=0
key_length=22
key_hex=4e355b5a2958445e777b31755f625d3f324048544134
head_hex=aba4a87f2ce8cd5e57710e7ceab14e32
printable_score=101
```

Result:

- Seeds `0..31` were RC4-decoded and tested with QuickBMS/Oodle against expected XML size `2666`.
- None produced valid XML.
- The current probe now writes seeds up to `63`, but only the earlier `0..31` set was passed through the Wine/QuickBMS/Oodle batch.

Interpretation:

- The runtime seed may be outside the tested range.
- The first carved payload may not be XML after all.
- The payload may be RC4 plus a non-Oodle compression mode.
- Most likely, the secondary TOC/runtime records must be decoded first.

## QuickBMS / Oodle Experiments

The game directory contains Oodle DLLs:

- `oo2core_4_win64.dll`
- `oo2ext_4_win64.dll`

`AMS2AVX.exe` imports:

- `OodleLZ_Decompress`

Confirmed call sites:

- direct import IAT at `0x141e121c0`
- small wrapper around `0x140c88530`
- runtime payload processing call around `0x140d52778`

Raw Oodle test on carved Brands Hatch first payload failed:

```sh
printf 'comtype oodle\nget ZSIZE asize\nset SIZE long 2666\nclog "reiza_oodle_2666.out" 0 ZSIZE SIZE\n' > /tmp/ams2-oodle-size.bms
mkdir -p /tmp/ams2-qbms-oodle-size
wine /tmp/quickbms-win/quickbms.exe -o /tmp/ams2-oodle-size.bms /tmp/ams2-brands-reiza-payload.bin /tmp/ams2-qbms-oodle-size
```

Other failed/false-positive experiments:

- Raw Oodle on payload with exact uncompressed size failed.
- Oodle with header skips `0,1,2,4,8,12,16,20,24,32` failed.
- zlib/deflate variants failed or copied input.
- LZSS QuickBMS variants emitted garbage-like output filled with spaces/nulls; treat as false positives.
- RC4-decoded seed candidates followed by Oodle did not produce XML for seeds `0..31`.

Narrow batch used for RC4 candidate Oodle testing:

```sh
printf 'comtype oodle\nget ZSIZE asize\nset SIZE long 2666\nclog NAME 0 ZSIZE SIZE\n' > /tmp/ams2-oodle-candidate.bms
rm -rf /tmp/ams2-qbms-rc4
mkdir -p /tmp/ams2-qbms-rc4

for f in /tmp/ams2-rc4-candidates/*.bin; do
  mkdir -p "/tmp/ams2-qbms-rc4/$(basename "$f" .bin)"
  wine /tmp/quickbms-win/quickbms.exe -o /tmp/ams2-oodle-candidate.bms "$f" "/tmp/ams2-qbms-rc4/$(basename "$f" .bin)" >/tmp/ams2-qbms-rc4/$(basename "$f" .bin).log 2>&1
done
```

## Ghidra Findings to Preserve

Targeted decompile of `0x141ad4c30` showed:

- It validates minimum buffer size `0x130`.
- It validates ` KAP`.
- It calls `FUN_141ad4ff0(param_1)`.
- It rejects some flags at `0x12c`/`0x12d` in certain paths.
- It normalizes `header[0x118]` and `header[0x120]`.
- It computes a region at `param_1 + 0x438 + normalized(header[0x118])`.
- It computes size `header[0x120] - 0x308`.
- It calls `FUN_140d57df0(...)` on that secondary region if `header[0x12d] != 0`.
- It then calls `FUN_141ad5370(param_1,param_1)` to relocate/adjust TOC pointers.

Targeted decompile of `0x141ad5260` showed:

```c
if (param_1 == 1) FUN_141ad5470(...);
else if (param_1 == 2) FUN_141ad57c0(...);
return 1;
```

Targeted decompile of `0x140d101f0` showed RC4-like PRGA:

- Maintains `i` and `j`.
- Swaps state bytes.
- XORs each target byte with `S[(S[i] + S[j]) & 0xff]`.

Targeted decompile of `0x140d10180` showed RC4-like KSA:

- Initializes `S[i] = i`.
- Uses `key[i % key_length]`.
- Swaps state bytes.

Targeted decompile of `0x140c53fd0` showed C-string copy into the engine string type:

- It scans until NUL or `0x4000`.
- Therefore key records at `0x1425507e0 + seed * 0x1b` are C strings, not fixed 27-byte binary keys.

## What Not To Do Next

Do not treat fuzzy matching output as generated data.

Do not spend more time trying arbitrary compression algorithms against the carved first payload before decoding the runtime TOC.

Do not assume the first carved DHSA payload is `Reiza.xml`.

Do not assume raw payload bytes are raw Oodle streams.

Do not assume `header[0x12d] == 2` means "no transform" for all data. It means scalar integer fields can be raw, but block transforms can still use the mode-2 RC4 path.

Do not revert unrelated dirty work unless explicitly asked.

## Best Next Step

Best next step is dynamic dumping of the transformed runtime TOC.

Concrete objective:

- Obtain the decoded runtime `0x2a` records for `AUT_BrandsHatch_GP.bff`.
- Identify which record corresponds to `Reiza.xml`.
- Read its runtime source offset, compressed size, uncompressed size, compression byte, and checksum.
- Then decode/decompress that one payload to XML.

Most useful breakpoints / hook points:

- After `FUN_140d57df0` returns inside `FUN_141ad4c30`, dump the secondary TOC region before `FUN_141ad5370` or after relocation.
- Around `0x140d52256`, after per-entry `FUN_141ad5180` transforms have run.
- At the start of the loop around `0x140d5242e`, dump the runtime record table at object field `+0xf0`.
- At `0x140d52778`, log each call to `OodleLZ_Decompress`:
  - `rcx`: source pointer
  - `edx`: compressed size
  - `r8`: destination pointer
  - `r9d`: uncompressed size
  - stack arg at `rsp+0x68`: compressor enum, observed `3`

Likely dynamic approaches:

- Run AMS2 under Wine/Proton with a debugger and breakpoints.
- Use `x64dbg`/Windows VM if Proton debugging is painful.
- Use `frida` if available, but it is not currently installed.
- Use `gdb` with Wine/Proton only if symbol/address mapping is manageable.

If asking the user for tools, useful installs would be:

```sh
shelly install frida-tools gdb
```

Potential Frida strategy:

- Hook `OodleLZ_Decompress` in `oo2core_4_win64.dll`.
- Dump source buffer, compressed size, output size, and caller return address.
- Filter calls whose return address is near `AMS2AVX.exe + 0xd52778` or whose source bytes come from the Brands Hatch `.bff` mapping.
- Also hook the wrapper around `0x141ad5180` or `0x140d57df0` if address resolution is feasible.

## Alternative Static Next Step

If dynamic dumping is not possible, continue static RE of the secondary TOC codec:

- `0x140d57df0`: dispatch wrapper through codec object vtable.
- `0x1416f3fc0`: complex generated codec/dataflow layer.
- `0x141700190`: dispatcher that finds handlers and calls vtable method at `+0x80`.
- Vtables around:
  - `0x142117118`
  - `0x142117228`
- Vtable methods already inspected:
  - `0x141701300`
  - `0x141701230`
  - `0x141700a60`
  - `0x141700c40`
  - `0x141700df0`

Static RE target:

- Recover exactly how `0x1416f3fc0` transforms `secondary_toc_offset` bytes into runtime `0x2a` records.
- Then port it to TypeScript.

This is harder than dynamic dumping because the codec is template/generated engine serialization machinery with multiple descriptor tables.

## Audio / FMOD Findings

`Audio/MasterBank.strings.bank`:

- `file` reports it as `RIFF (little-endian) data`.
- Header starts `RIFF ... FEV FMT`.
- It contains a `car_classes/` region around decimal offset `269483` (`0x41ca8`).
- `strings(1)` exposes fragmented pieces, not direct event paths.

Potential use:

- With a proper FMOD FEV strings-bank parser, this might reveal class/car identifiers.

Limitation:

- It likely will not be enough for display names, years, or track metadata.
- It is not the highest-value next step compared to decoding BFF runtime records.

## File References

Main extractor:

- `internals/extractGameData/index.ts`

Transform probe:

- `internals/extractGameData/probeBffTransforms.ts`

Ghidra helper:

- `internals/extractGameData/ghidra/DecompileAms2Bff.java`

Extractor notes:

- `internals/extractGameData/README.md`

Generated summary:

- `build/extracted/ams2/summary.md`

Important generated CSVs:

- `build/extracted/ams2/vehicle_packs.csv`
- `build/extracted/ams2/track_packs.csv`
- `build/extracted/ams2/pack_payload_entries.csv`
- `build/extracted/ams2/probes/mode2_probe.csv`

Current app CSVs used for cross-check only:

- `src/app/data/cars.csv`
- `src/app/data/tracks.csv`

## Final Warning

The current extraction logic is useful but not final.

It is currently exact for:

- game asset IDs from filenames
- HUD map identifiers
- audio bank asset IDs
- KAP outer header fields
- visible `Reiza.xml` size/name markers
- static DHSA-like payload carving
- mode-2 RC4 block transform mechanics

It is not yet exact for:

- car display names
- car class membership
- car discipline
- car year
- track display names/configuration as app data
- mapping visible names to runtime payloads
- decoding actual XML payloads

The path to exact generation is still: decode runtime TOC, identify exact metadata XML payloads, decompress/decode those payloads, then derive CSV rows from parsed game-authored metadata.

## 2026-07-12 Continuation: Persistent Physics and Career Packs

The extractor now also scans these top-level packs:

- `Pakfiles/PHYSICSPERSISTENT.bff`
- `Pakfiles/HRDFPERSISTENT.bff`
- `Pakfiles/PHYSICSBOOTFLOW.bff`
- `Pakfiles/BOOTPERSISTENT.bff`

Their headers and loader-equivalent runtime records are included in
`system_packs.csv` and `pack_runtime_entries.csv`.

Important result: `PHYSICSPERSISTENT.bff` contains 1,884 zlib runtime records.
Decoded records with magic `Q 02 01 04` are compact persistent-engine objects.
Many contain readable vehicle identity/class-chain strings. Examples from the
installed build:

- `Caterham_620R | Race_FF1600T2 | Generic_TCR | Caterham_620r`
- `Gol_ClassicB | Road_CCB | Generic_TCR | CopaClassic_B`
- `Formula_V8_G2 | F1_Modern | Formula_Reiza | Formula_V10 | formula_V8_G2`
- `Ginetta_G40_Cup | Race_FF1600T | Generic_TCR | ginetta_g55_gt4 | ginetta_g40_cup | G40Cup`

These are materially better generation inputs than filename matching. The
exact meaning of each string position is not yet proven: for example,
`CopaClassic_B` is clearly related to the app class `Copa Classic (Class: B)`,
but `Generic_TCR` is a shared physics/category descriptor and should not be
mistaken for the app class. Some records have aliases, HD/LD variants, or
multiple linked vehicle classes.

`HRDFPERSISTENT.bff` contains career/motorsport object records. Its decoded
objects include grouped vehicle and track identifiers, for example
`Vehicles`, `Tracks`, and motorsport groups such as `RallyCross`,
`FormulaUSAHistoricRoad`, and `SuperTrophyTrucks`. It also contains cockpit
and display-link records for canonical vehicle identifiers. This is the likely
source for exact track grouping and a useful cross-check for vehicle inclusion.

New exploratory script:

```sh
./node_modules/.bin/ts-node internals/extractGameData/decodeBffPayloadSamples.ts \
  "/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2" \
  5000 20000
```

The second argument is the maximum decoded samples per pack; the third is the
maximum compressed payload size. The scan reads only payload ranges and writes:

- `build/extracted/ams2/payload_sample_scan.csv`
- `build/extracted/ams2/physics_vehicle_candidates.csv`

The latter currently has 1,588 candidate `PHYSICSPERSISTENT` objects and is an
evidence file, not a generated app CSV. It preserves the decoded string chains
needed for the next semantic parser.

The scan confirmed:

- Brands Hatch runtime entry 0 still decodes through RC4 plus zlib to a `BLMY` asset.
- Persistent physics records decode with per-pack seed `14` for the current install.
- The visible `Reiza.xml:<size>` header marker is the secondary TOC region size, not the uncompressed size of a matching runtime XML record.
- XML payloads found in the sampled assets are mostly geometry/reflection/configuration XML and are not the car-class catalogue.

Recommended next implementation step:

1. Decode every `PHYSICSPERSISTENT` `Q 02 01 04` record into its actual field/string-table structure, rather than relying on printable-string extraction.
2. Identify the canonical vehicle key and class descriptor fields by comparing duplicate/HD/LD records and current app rows.
3. Decode the relevant `HRDFPERSISTENT` object records to obtain career vehicle/track group membership and canonical track layout identifiers.
4. Only then generate candidate `cars.csv`/`tracks.csv`, with an explicit per-field accuracy report against the current CSVs.

## 2026-07-12 Continuation: Structured Cross-Checks

`decodeBffPayloadSamples.ts` now retains complete NUL-delimited string tables
for persistent physics/career objects. The bounded scan command used for the
current install was:

```sh
./node_modules/.bin/ts-node internals/extractGameData/decodeBffPayloadSamples.ts \
  "/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2" \
  5000 20000
```

It decoded `82,206` zlib payload samples successfully. Current generated
evidence includes:

- `physics_vehicle_candidates.csv`: 1,588 `PHYSICSPERSISTENT` `Q 02 01 04` records.
- `hrdf_track_candidates.csv`: 26 `HRDFPERSISTENT` objects whose complete string tables contain `Tracks`.
- `payload_sample_scan.csv`: magic, sizes, first bytes, and bounded printable-string scans.

New cross-check commands:

```sh
./node_modules/.bin/ts-node internals/extractGameData/crossCheckPhysicsVehicles.ts
./node_modules/.bin/ts-node internals/extractGameData/crossCheckHrdfTracks.ts
```

Outputs:

- `physics_vehicle_crosscheck.csv`
- `physics_vehicle_crosscheck_summary.md`
- `hrdf_track_crosscheck.csv`
- `hrdf_track_crosscheck_summary.md`

The physics cross-check currently finds `221/291` base car assets by exact
normalized identifier containment. This is an evidence match, not fuzzy
generation. The report retains raw strings such as:

```text
Caterham_620R | Race_FF1600T2 | Generic_TCR | Caterham_620r
Gol_ClassicB | Road_CCB | Generic_TCR | CopaClassic_B
Formula_V8_G2 | F1_Modern | Formula_Reiza | Formula_V10 | formula_V8_G2
```

The HRDF cross-check finds `90/211` current track assets in career/motorsport
track groups. This is expected to be lower than the complete installed track
set: HRDF is career/group data, not a complete track manifest. It does provide
authoritative group membership and canonical identifiers for the records it
contains.

Semantic conclusion:

- The physics object string chain is not a one-field app-class mapping. For
  example, `CopaClassic_B` maps naturally to the app label `Copa Classic (Class: B)`,
  while `Generic_TCR`, `Road_CCB`, and `Race_FF1600T2` are shared physics or
  handling descriptors.
- The installed persistent objects do not expose the app's `discipline` and
  `year` columns as obvious readable fields. The app taxonomy is coarser and
  partly editorial: multiple physics descriptors can appear under one app
  class, and some app years (for example the Formula Reiza row) are not the
  simulated model year.
- Therefore exact game extraction is now solved for canonical identifiers,
  physics descriptor chains, and selected career track groups, but not yet for
  reproducing every app CSV column without an explicit, validated taxonomy
  mapping.

The open-source `Nenkai/PCarsTools` repository was downloaded to `/tmp` and
inspected. It handles Project CARS `PAK ` archives, not AMS2's ` KAP` archive
variant, so it did not directly unpack these files. Its documentation confirms
that the broader Project CARS family uses compiled `.crd` vehicle records with
vehicle-class data, consistent with the persistent-object findings, but the
repository is not a dependency of this project.

## 2026-07-12 Continuation: Exact BOOTFLOW Details

The archive coverage issue is resolved. `Pakfiles/BOOTFLOW.bff` contains actual
metadata, not only indexes or reflection schemas. The payload scanner now
writes `bootflow_detail_payloads.csv`; it contains 551 `VehicleDetails` and
261 `TrackDetails` XML-like records with concrete `data=` values.

The lossless parser `extractBootflowDetails.ts` writes:

- `bootflow_vehicle_details.csv`: 551 records and 125 distinct properties.
- `bootflow_track_details.csv`: 261 records and 125 distinct properties.

Run:

```sh
./node_modules/.bin/ts-node internals/extractGameData/decodeBffPayloadSamples.ts \
  "/home/abesto/.local/share/Steam/steamapps/common/Automobilista 2" \
  5000 20000
./node_modules/.bin/ts-node internals/extractGameData/extractBootflowDetails.ts
```

Important semantic finding: the app CSVs are not a direct copy of these game
fields. For example, the game record for `Caterham_620R` has display name
`Caterham 620R`, class `Cat620R`, group `Openwheel`, and year `2019`; the app
row has class `Caterham GrA`, discipline `Club`, and year `2013`. These are
editorial taxonomy values and must not be inferred by renaming the raw game
class/group fields. Preserve the raw BOOTFLOW tables as the extraction source;
add a separately validated mapping layer if the app CSV schema must remain
unchanged.

The current generated raw tables are the correct basis for exact new entries.
The remaining work is matching app display/configuration rows to raw records
and documenting or explicitly implementing the editorial mapping for
`class`, `discipline`, and `year`.

`crossCheckBootflowDetails.ts` writes `bootflow_csv_crosscheck.csv`, comparing
the app values with raw source values. On the current data it matches 68/149
cars and 7/146 tracks by display name; the low track count is expected because
the app uses display/configuration names while the game stores canonical track
identifiers and separate configuration records.
