export interface SemVer {
  raw: string;
  major: number;
  minor: number;
  patch: number;
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
