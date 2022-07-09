import { Dayjs } from 'dayjs';

export function randomDateBetween(start: Dayjs, end: Dayjs): Dayjs {
  console.log('BAAD');
  const diffMs = start.diff(end);
  const diffRandom = Math.random() * diffMs;
  return start.add(diffRandom, 'millisecond');
}

export function choice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
