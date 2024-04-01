import Release from 'keep-a-changelog/script/src/Release';

export interface SemVerWithRaw {
  minor: number;
  major: number;
  patch: number;
  raw: string;
}

export function semverWithRaw(release: Release): SemVerWithRaw {
  return {
    major: release.parsedVersion!.major,
    minor: release.parsedVersion!.minor,
    patch: release.parsedVersion!.patch,
    raw: release.version!,
  };
}

/** Drop any properties of an object outside of what's needed for our SemVer */
export function simpleSemVer(x: SemVerWithRaw): SemVerWithRaw {
  const { raw, major, minor, patch } = x;
  return { raw, major, minor, patch };
}

export function cmpSemVer(a: SemVerWithRaw, b: SemVerWithRaw): number {
  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
}

/* --- STATE --- */
export interface ChangelogState {
  seenVersion: SemVerWithRaw;
}
