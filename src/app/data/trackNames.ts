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
  const name = source.displayName || formatTrackLabel(source.name);
  const category =
    source.displayCategory || formatTrackLabel(source.category || source.name);
  const rawConfiguration = source.displayConfiguration || source.variation || source.shortName || '';
  const configuration = deduplicateConfiguration(
    formatTrackLabel(rawConfiguration),
    name,
    category,
  );

  return { name, configuration, category };
}
