import Info from 'unplugin-info/vite';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react(), viteTsconfigPaths(), Info()],
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['vitest/setupTests.ts'],
    },
  };
});
