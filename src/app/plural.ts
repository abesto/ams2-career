export function plural(n: number, s: string): string {
  if (n === 1) {
    return s;
  }
  return s + 's';
}

export function pluralWithNumber(n: number, s: string): string {
  return `${n} ${plural(n, s)}`;
}
