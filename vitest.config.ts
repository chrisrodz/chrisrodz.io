import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use happy-dom as the test environment (lightweight DOM implementation)
    environment: 'happy-dom',

    // Include test files
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],

    // Setup files to run before tests
    setupFiles: ['./vitest.setup.ts'],

    // Global test configuration
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/**/*.d.ts',
        'src/lib/database.types.ts', // Generated file
        'src/env.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'astro:middleware': path.resolve(__dirname, './src/test-utils/astro-middleware.ts'),
    },
  },
});
