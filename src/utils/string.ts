export function toAscii(s: string | undefined): string | undefined {
  return s?.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
