export interface SemVer {
  raw: string;
  major: number;
  minor: number;
  patch: number;
}

/** Drop any properties of an object outside of what's needed for our SemVer */
export function simpleSemVer(x: SemVer): SemVer {
  const { raw, major, minor, patch } = x;
  return { raw, major, minor, patch };
}

export function cmpSemVer(a: SemVer, b: SemVer): number {
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
  seenVersion: SemVer;
}
