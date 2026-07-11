import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'password-generator/index': 'src/password-generator/index.ts',
    'uuid-generator/index': 'src/uuid-generator/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
});
