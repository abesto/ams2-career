import '@testing-library/jest-dom/vitest';

import { Dayjs } from 'dayjs';
import { afterEach, beforeEach, vi } from 'vitest';

import { cleanup } from '@testing-library/react';

beforeEach(() => {
  // Mock out Math.random to be deterministic
  let n = 0.1;
  vi.spyOn(global.Math, 'random').mockImplementation(() => {
    n = (n + 0.1) % 1;
    return n;
  });
});

afterEach(() => {
  cleanup();
});

// Generating race dates is inconsistent (due to floating point inaccuracies?) even with Math.random
// mocked out. Solution: directly mock out randomDateBetween.
vi.mock('app/pages/MainPage/racegen.random', async importOriginal => {
  const original =
    await importOriginal<typeof import('app/pages/MainPage/racegen.random')>();
  return {
    ...original,
    randomDateBetween: (a: Dayjs, _: Dayjs) => a,
  };
});

export {};
