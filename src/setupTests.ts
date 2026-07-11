import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

function createStorageMock(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    key(index: number) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
  };
}

const localStorageMock = createStorageMock();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

beforeEach(() => {
  window.localStorage.clear();
  // Mock out Math.random to be deterministic
  let n = 0.1;
  vi.spyOn(global.Math, 'random').mockImplementation(() => {
    n = (n + 0.1) % 1;
    return n;
  });
});

// Generating race dates is inconsistent (due to floating point inaccuracies?) even with Math.random
// mocked out. Solution: directly mock out randomDateBetween.
vi.mock('app/pages/MainPage/racegen.random', async () => {
  const original = await vi.importActual<
    typeof import('app/pages/MainPage/racegen.random')
  >('app/pages/MainPage/racegen.random');
  return {
    ...original,
    randomDateBetween: a => a,
  };
});

export {};
