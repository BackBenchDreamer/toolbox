import { defineConfig } from 'tsup';
import { readdirSync } from 'fs';
import { join } from 'path';

// Auto-discover all tool entry points under src/
const toolDirs = readdirSync(join(__dirname, 'src'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const entry: Record<string, string> = { index: 'src/index.ts' };
for (const dir of toolDirs) {
  entry[`${dir}/index`] = `src/${dir}/index.ts`;
}

export default defineConfig({
  entry,
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
});
