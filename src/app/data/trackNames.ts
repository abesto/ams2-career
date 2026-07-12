export interface TrackLabelSource {
  name: string;
  shortName?: string;
  variation?: string;
  category?: string;
  displayName?: string;
  displayConfiguration?: string;
  displayCategory?: string;
}

export interface TrackLabels {
  name: string;
  configuration: string;
  category: string;
}

const ABBREVIATIONS: Record<string, string> = {
  GP: 'GP',
  NATL: 'National',
  NC: 'No Chicane',
  OVAL: 'Oval',
  RC: 'Road Course',
  RX: 'Rallycross',
  SCC: 'Sports Car Course',
  STT: 'Time Trial',
};

/** Converts game-facing identifiers into labels suitable for the UI. */
export function formatTrackLabel(value: string): string {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(part => ABBREVIATIONS[part.toUpperCase()] ?? part)
    .join(' ');
}

function comparable(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function baseTrackGroup(value: string): string {
  // Some AMS2 groups include the historical year in the group itself. That
  // year identifies a configuration, not a different parent circuit.
  const withoutYear = value.replace(/[_ -](?:19|20)\d{2}(?:[_ -].*)?$/i, '');
  return withoutYear;
}

function displayTrackGroup(value: string): string {
  const base = baseTrackGroup(value);
  const formatted = formatTrackLabel(base);
  if (comparable(base) === 'watkinsglen') return 'Watkins Glen';
  return comparable(base) === 'nurb' || comparable(base) === 'nurburgring'
    ? 'Nürburgring'
    : formatted;
}

function configurationFromName(name: string, group: string): string {
  const base = baseTrackGroup(group);
  const prefixes = [base];
  if (comparable(base) === 'nurb' || comparable(base) === 'nurburgring') {
    prefixes.push('Nurburgring', 'Nurb');
  }
  for (const value of prefixes.sort((a, b) => b.length - a.length)) {
    const prefix = new RegExp(
      `^${value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}[_ -]?`,
      'i',
    );
    if (prefix.test(name)) {
      return name.replace(prefix, '');
    }
  }
  return name;
}

function deduplicateConfiguration(
  configuration: string,
  name: string,
  category: string,
): string {
  const normalizedConfiguration = comparable(configuration);
  const normalizedName = comparable(name);
  const normalizedCategory = comparable(category);
  if (
    !normalizedConfiguration ||
    normalizedConfiguration === normalizedName ||
    normalizedConfiguration === normalizedCategory ||
    normalizedName.endsWith(normalizedConfiguration) ||
    normalizedCategory.endsWith(normalizedConfiguration)
  ) {
    return '';
  }
  return configuration;
}

export function getTrackLabels(source: TrackLabelSource): TrackLabels {
  const rawGroup = source.category || source.name;
  const category = source.displayCategory || displayTrackGroup(rawGroup);
  // TrackName is often the configuration-specific game identifier (for
  // example California_Highway_Full). Track Group is the circuit identity.
  const name =
    source.displayName ||
    (source.category ? category : formatTrackLabel(source.name));
  const configurationFromTrackName = configurationFromName(
    source.name,
    rawGroup,
  );
  const configurationFromDisplayName = source.displayConfiguration
    ? configurationFromName(source.displayConfiguration, rawGroup)
    : '';
  const rawConfiguration =
    configurationFromDisplayName ||
    (source.variation &&
    comparable(source.variation) !== comparable(source.name)
      ? comparable(configurationFromTrackName).endsWith(
          comparable(source.variation),
        )
        ? configurationFromTrackName
        : source.variation
      : configurationFromTrackName);
  const configuration = deduplicateConfiguration(
    formatTrackLabel(rawConfiguration),
    name,
    category,
  );

  return { name, configuration, category };
}
