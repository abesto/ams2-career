export function toAscii(s: String | undefined): String | undefined {
  return s?.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
