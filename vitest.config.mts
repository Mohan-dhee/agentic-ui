import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the tsconfig "@/*" → "./*" path alias
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL('./', import.meta.url)) }],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
