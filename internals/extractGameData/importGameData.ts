import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';
import { stringify } from 'csv-stringify/sync';

import { getTrackLabels } from '../../src/app/data/trackNames';

const SOURCE_DIR = path.resolve('build/extracted/ams2');
const APP_DATA_DIR = path.resolve('src/app/data');

type Row = Record<string, string>;

function readCsv(filename: string): Row[] {
  return Papa.parse<Row>(readFileSync(filename, 'utf8'), {
    header: true,
    skipEmptyLines: true,
  }).data;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function gameId(name: string, xlastId: string): string {
  return `${name}-${xlastId}`.replace(/[^A-Za-z0-9_-]/g, '_');
}

function writeCsv(filename: string, rows: Row[]) {
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
  writeFileSync(
    path.join(APP_DATA_DIR, filename),
    stringify(rows, { header: true, columns }),
  );
}

const META_ALIASES: Record<string, string> = {
  cat620r: 'Caterham GrA',
  catsuperlight: 'Caterham GrB',
  catsupersport: 'Caterham GrB',
  catacademy: 'Caterham GrC',
  g40cup: 'Ginetta G40 Cup',
  g55supercup: 'Ginetta G55 Supercup',
  copaclassicb: 'Copa Classic (Class: B)',
  copaclassicfl: 'Copa Classic (Class: FL)',
  copafusca: 'Copa Fusca',
  copauno: 'Copa Uno',
  copatruck: 'Copa Truck',
  montana: 'Copa Montana',
  gt3: 'GT3',
  gt3gen2: 'GT3',
  gt3n: 'GT3',
  gto: 'GT3',
  gtopen: 'GT3',
  gt4: 'GT4',
  gt4n: 'GT4',
  gt5: 'GT5',
  gte: 'GTE',
  gt105: 'GT1',
  gt1: 'GT1',
  gtr04: 'GT1',
  p1: 'P1',
  p1gen2: 'P1',
  lmdh: 'DPi',
  dpi: 'DPi',
  p2: 'P2',
  lmp2: 'P2',
  lmp2gen1: 'P2',
  lmp205: 'P2',
  p3: 'P3',
  lmp3: 'P3',
  p4: 'P4',
  groupc: 'Group C',
  group5: 'Group C',
  group7: 'Group C',
  hotcars: 'Hot Cars',
  carreracup: 'Carrera Cup',
  gtcupn: 'Carrera Cup',
  minichallenge: 'JCW',
  superkart: 'Super Kart',
  kart1: 'Karting 125CC',
  kart125cc: 'Karting 125CC',
  kartshifter: 'Karting Shifter',
  kartgx390: 'Karting GX390',
  kartrental: 'Karting Rental',
  sprintrace: 'Sprint Race',
  lancercup: 'Lancer Cup',
  street: 'Street Cars A',
  superv8: 'Super V8',
  procar: 'M1 PROCAR',
  oldstock: 'Old Stock Race 79',
  opala79: 'Old Stock Race 79',
  opala86: 'Stock Car Brasil 86 GrB',
  stockcar99: 'Stock Car Brasil 99 GrC',
  stockcarv82020: 'Stock Car Brasil 20 GrA',
  stockcarv82021: 'Stock Car Brasil 21 GrA',
  stockcarv82023: 'Stock Car Brasil 19 GrA',
  stockcarv82024: 'Stock Car Brasil 21 GrA',
  stockcarv8: 'Stock Car Brasil 19 GrA',
  arccam: 'ARC',
  tsicup: 'TSI Cup',
  f3: 'F3',
  f301: 'F3',
  f309: 'F3',
  ftrainer: 'FTS',
  ftrainera: 'FTS',
  fjunior: 'FTS',
  fvee: 'FormulaVee Brazil',
  fveegen2: 'FormulaVee Brazil',
  freiza: 'Formula Reiza',
  fv12: 'Formula V12',
  f10gen1: 'Formula V10 G1',
  fv10gen1: 'Formula V10 G1',
  fv10gen2: 'Formula V10 G2',
  fv10gen3: 'Formula V10 G2',
  fultimate: 'Formula Ultimate Gen1',
  fultimategen1: 'Formula Ultimate Gen1',
  fultimategen2: 'Formula Ultimate Gen2',
  fclassicgen1: 'Formula Classic G1',
  fclassicgen2: 'Formula Classic G2',
  fclassicgen3: 'Formula Classic G3',
  fclassicgen4: 'Formula Classic G3',
  fhitechgen1: 'Formula Classic G1',
  fhitechgen2: 'Formula Classic G2',
  fretrogen1: 'Formula Retro G1',
  fretrogen2: 'Formula Retro G2',
  fretrogen3: 'Formula Retro G3',
  fvintagegen1: 'Formula Vintage G1',
  fvintagegen2: 'Formula Vintage G2',
  fusaagen1: 'F-USA Gen.1',
  'f-usagen1': 'F-USA Gen.1',
  'f-usagen2': 'F-USA Gen.2',
  'f-usagen3': 'F-USA Gen.3',
};
const NORMALIZED_META_ALIASES = Object.fromEntries(
  Object.entries(META_ALIASES).map(([key, value]) => [normalize(key), value]),
);

export type MetaClassMapping = {
  metaClass: string;
  source: 'explicit-alias' | 'heuristic-family';
};

export function metaClassMappingFor(
  gameClass: string,
  group: string,
  shape: string,
): MetaClassMapping {
  const key = normalize(gameClass.replace(/_(LD|HD|SO|SS|SW|RET)$/i, ''));
  if (/^les_2025$/i.test(gameClass) && /^lmp4$/i.test(group)) {
    return { metaClass: 'P4', source: 'explicit-alias' };
  }
  if (/^les_2025$/i.test(gameClass) && /^gt4$/i.test(group)) {
    return { metaClass: 'GT4', source: 'explicit-alias' };
  }
  if (NORMALIZED_META_ALIASES[key])
    return {
      metaClass: NORMALIZED_META_ALIASES[key],
      source: 'explicit-alias',
    };
  const heuristic = (metaClass: string): MetaClassMapping => ({
    metaClass,
    source: 'heuristic-family',
  });
  if (/^f-?usa[_-]?gen1/i.test(gameClass)) return heuristic('F-USA Gen.1');
  if (/^f-?usa[_-]?gen2/i.test(gameClass)) return heuristic('F-USA Gen.2');
  if (/^f-?usa[_-]?gen3/i.test(gameClass)) return heuristic('F-USA Gen.3');
  if (/^f-?usa[_-]?2022|^f-?usa[_-]?2023/i.test(gameClass))
    return heuristic('F-USA Gen.3');
  if (/^f-?classic[_-]?gen1/i.test(gameClass))
    return heuristic('Formula Classic G1');
  if (/^f-?classic[_-]?gen2/i.test(gameClass))
    return heuristic('Formula Classic G2');
  if (/^f-?classic[_-]?gen3|^f-?classic[_-]?gen4/i.test(gameClass))
    return heuristic('Formula Classic G3');
  if (/^f-?hitech[_-]?gen1/i.test(gameClass))
    return heuristic('Formula Classic G1');
  if (/^f-?hitech[_-]?gen2/i.test(gameClass))
    return heuristic('Formula Classic G2');
  if (/^f-?retro[_-]?gen1/i.test(gameClass))
    return heuristic('Formula Retro G1');
  if (/^f-?retro[_-]?gen2/i.test(gameClass))
    return heuristic('Formula Retro G2');
  if (/^f-?retro[_-]?gen3/i.test(gameClass))
    return heuristic('Formula Retro G3');
  if (/^f-?vintage[_-]?gen1/i.test(gameClass))
    return heuristic('Formula Vintage G1');
  if (/^f-?vintage[_-]?gen2/i.test(gameClass))
    return heuristic('Formula Vintage G2');
  if (/^f-?ultimate[_-]?gen1/i.test(gameClass))
    return heuristic('Formula Ultimate Gen1');
  if (/^f-?ultimate[_-]?gen2/i.test(gameClass))
    return heuristic('Formula Ultimate Gen2');
  if (/^f-?v10[_-]?gen1/i.test(gameClass)) return heuristic('Formula V10 G1');
  if (/^f-?v10[_-]?gen2|^f-?v10[_-]?gen3/i.test(gameClass))
    return heuristic('Formula V10 G2');
  if (/^f-?v12/i.test(gameClass)) return heuristic('Formula V12');
  if (/^f-?v8/i.test(gameClass) || /^f-?reiza/i.test(gameClass))
    return heuristic('Formula Reiza');
  if (/^f-?vee/i.test(gameClass)) return heuristic('FormulaVee Brazil');
  if (/^f-?3|^f301|^f309/i.test(gameClass)) return heuristic('F3');
  if (/^f-?trainer|^f-?junior|^f-?inter/i.test(gameClass))
    return heuristic('FTS');
  if (/^f5$/i.test(gameClass)) return heuristic('FTS');
  if (/sprint|^rx$|^sst$|^stt$|dirt/i.test(gameClass))
    return heuristic('Sprint Race');
  if (/safetycar/i.test(gameClass)) return heuristic('Street Cars A');
  if (/supercars|hypercars/i.test(gameClass)) return heuristic('Street Cars B');
  if (/^tc60|^tc70|^st96/i.test(gameClass)) return heuristic('GT Classics');
  if (/carrer[a]? ?cup/i.test(gameClass)) return heuristic('Carrera Cup');
  if (/^gt2|^gtc|^trofeo|^super ?trofeo|^les_/i.test(gameClass))
    return heuristic('GT Classics');
  if (/fusa.*gen1/i.test(gameClass)) return heuristic('F-USA Gen.1');
  if (/fusa.*gen2/i.test(gameClass)) return heuristic('F-USA Gen.2');
  if (/fusa.*gen3/i.test(gameClass)) return heuristic('F-USA Gen.3');
  if (/gt3/i.test(gameClass)) return heuristic('GT3');
  if (/gt4/i.test(gameClass)) return heuristic('GT4');
  if (/gt5/i.test(gameClass)) return heuristic('GT5');
  if (/gte/i.test(gameClass)) return heuristic('GTE');
  if (/gt1|gtr/i.test(gameClass)) return heuristic('GT1');
  if (/lmp2|p2/i.test(gameClass)) return heuristic('P2');
  if (/lmp3|p3/i.test(gameClass)) return heuristic('P3');
  if (/lmp1|p1|lmdh|dpi/i.test(gameClass)) return heuristic('P1');
  if (/kart/i.test(gameClass) || shape === 'Kart')
    return heuristic('Karting 125CC');
  if (/touring|stock|copa|superv8|group a/i.test(`${gameClass} ${group}`))
    return heuristic('Group A');
  if (/historic openwheel/i.test(group)) return heuristic('Formula Retro G2');
  if (/openwheel/i.test(shape) || /openwheel/i.test(group))
    return heuristic('Formula V10 G2');
  if (/road|street/i.test(`${shape} ${gameClass}`))
    return heuristic('Street Cars A');
  if (/prototype|lm/i.test(`${shape} ${group}`)) return heuristic('P1');
  return heuristic('GT Classics');
}

function disciplineFor(metaClass: string): string {
  const rows = readCsv(path.join(APP_DATA_DIR, 'car_classes.csv'));
  return rows.find(row => row.class === metaClass)?.discipline ?? 'GT';
}

function main() {
  const classRows = readCsv(path.join(APP_DATA_DIR, 'car_classes.csv'));
  const classByName = new Map(classRows.map(row => [row.class, row]));
  const rawCars = readCsv(
    path.join(SOURCE_DIR, 'bootflow_vehicle_details.csv'),
  );
  const rawTracks = readCsv(
    path.join(SOURCE_DIR, 'bootflow_track_details.csv'),
  );

  const cars: Row[] = [];
  const seenCars = new Set<string>();
  for (const row of rawCars) {
    const id = gameId(row.Name, row.XLASTID);
    if (seenCars.has(id)) continue;
    seenCars.add(id);
    const mapping = metaClassMappingFor(
      row['Vehicle Class'],
      row['Vehicle Group'],
      row['Vehicle Shape'],
    );
    const metaClass = mapping.metaClass;
    const classRow = classByName.get(metaClass);
    cars.push({
      game_id: id,
      canonical_id: `${id}-${normalize(metaClass)}`,
      ...row,
      has_headlights: String(Number(classRow?.headlights ?? 0) > 0),
      headlights_source: `meta-class-default:${metaClass}`,
      downforce_variant: /_LD(?:_|$)/i.test(row['Vehicle Class'])
        ? 'low'
        : 'standard',
      meta_class: metaClass,
      discipline: disciplineFor(metaClass),
    });
  }
  const classes = [
    ...new Map(cars.map(row => [row['Vehicle Class'], row])).values(),
  ].map(row => {
    const mapping = metaClassMappingFor(
      row['Vehicle Class'],
      row['Vehicle Group'],
      row['Vehicle Shape'],
    );
    const metaClass = mapping.metaClass;
    const classRow = classByName.get(metaClass);
    return {
      game_class: row['Vehicle Class'],
      meta_class: metaClass,
      discipline: classRow?.discipline ?? 'GT',
      grade: classRow?.grade ?? '1',
      headlights: classRow?.headlights ?? '0',
      mapping_source: mapping.source,
    };
  });

  const tracks: Row[] = [];
  const seenTracks = new Set<string>();
  for (const row of rawTracks) {
    const id = gameId(row.Name, row.XLASTID);
    if (seenTracks.has(id)) continue;
    seenTracks.add(id);
    const labels = getTrackLabels({
      name: row.TrackName,
      shortName: row.ShortTrackName,
      variation: row.Track_Variation,
      category: row['Track Group'],
    });
    tracks.push({
      game_id: id,
      ...row,
      display_name: labels.name,
      display_configuration: labels.configuration,
      display_category: labels.category,
      downforce_variant: row.Downforce === 'Low' ? 'low' : 'standard',
    });
  }

  const appTracks = readCsv(path.join(APP_DATA_DIR, 'tracks.csv'));
  const trackMappings: Row[] = [];
  for (const track of tracks) {
    const matchingApp = appTracks.find(
      app =>
        normalize(app.name) === normalize(track.TrackName) ||
        normalize(app.name) === normalize(track['Track Group']),
    );
    const mappedClasses = matchingApp
      ? Object.entries(matchingApp)
          .filter(([, value]) => value === 'x')
          .map(([name]) => name)
      : classRows
          .filter(row => {
            const type = track['Track Type'];
            if (type === 'Kart') return /kart/i.test(row.class);
            if (type === 'Rallycross')
              return ['Sprint Race', 'FTS', 'GT5'].includes(row.class);
            if (type === 'Oval')
              return /stock|copa|f-usa|super v8|montana/i.test(row.class);
            return true;
          })
          .map(row => row.class);
    for (const metaClass of mappedClasses) {
      trackMappings.push({
        game_track_id: track.game_id,
        game_track_name: track.TrackName,
        downforce_variant: track.downforce_variant,
        meta_class: metaClass,
        mapping_source: matchingApp
          ? 'existing-app-matrix'
          : 'track-type-fallback',
      });
    }
  }

  const legacyAliases: Row[] = [];
  const oldCars = readCsv(path.join(APP_DATA_DIR, 'cars.csv'));
  for (const old of oldCars) {
    const matches = cars.filter(
      row => normalize(row['Vehicle Name']) === normalize(old.car),
    );
    const match =
      matches.find(row => row.meta_class === old.class) || matches[0];
    const oldClass =
      classRows.find(
        row => row.class === old.class && row.discipline === old.discipline,
      ) || classRows.find(row => row.class === old.class);
    legacyAliases.push({
      kind: 'car',
      legacy_id: `${old.class}-${old.car}`,
      canonical_id:
        match && oldClass
          ? `${match.canonical_id}-${oldClass.discipline}-${oldClass.grade}-${old.class}`
          : '',
      status: match ? 'canonical' : 'legacy-fallback',
    });
  }
  for (const old of appTracks) {
    const match = tracks.find(
      row => normalize(row.TrackName) === normalize(old.name),
    );
    legacyAliases.push({
      kind: 'track',
      legacy_id: `${old.name}-${old.configuration}`,
      canonical_id: match?.game_id ?? '',
      status: match ? 'canonical' : 'legacy-fallback',
    });
  }

  writeCsv('game_cars.csv', cars);
  writeCsv('game_tracks.csv', tracks);
  writeCsv('game_class_mapping.csv', classes);
  writeCsv('game_track_mapping.csv', trackMappings);
  writeCsv('legacy_id_aliases.csv', legacyAliases);
  console.log(
    `Imported ${cars.length} cars, ${tracks.length} tracks, ${classes.length} game classes`,
  );
  console.log(
    `Generated ${trackMappings.length} track/class mappings and ${legacyAliases.length} legacy aliases`,
  );
}

if (require.main === module) main();
