import { execSync } from 'node:child_process';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function readGitValue(command: string, fallback = 'unknown') {
  try {
    return execSync(command, { encoding: 'utf8' }).trim() || fallback;
  } catch {
    return fallback;
  }
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  define: {
    __APP_COMMIT_DATE__: JSON.stringify(
      readGitValue('git log -1 --format=%cI'),
    ),
    __APP_COMMIT_HASH__: JSON.stringify(readGitValue('git rev-parse HEAD')),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
});
