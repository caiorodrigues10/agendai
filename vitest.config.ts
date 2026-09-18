import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    watch: false,
    pool: 'forks',
    fileParallelism: true,
    isolate: true,
    maxWorkers: 2,
    testTimeout: 15_000,
    hookTimeout: 10_000,
    teardownTimeout: 8_000,
    hangTimeout: 45_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
