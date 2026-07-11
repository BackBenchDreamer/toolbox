#!/usr/bin/env node
/**
 * generate-registry.mjs
 *
 * Scans every package under packages/ for manifest.ts files,
 * validates their shape, and prints a report.
 *
 * Usage: node scripts/generate-registry.mjs [--check]
 *   --check   Exit with code 1 if any manifest is missing required fields
 *
 * Invariant: this script always operates relative to the monorepo root,
 * regardless of which directory it is called from (e.g. npm prebuild in a
 * workspace package). Path resolution uses import.meta.url, not process.cwd().
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve monorepo root from this file's location (scripts/ → parent)
const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), '..');
const PACKAGES_DIR = join(REPO_ROOT, 'packages');
const REQUIRED_FIELDS = [
  'id', 'slug', 'name', 'category', 'tags', 'description',
  'icon', 'version', 'packageName', 'route', 'apiEndpoint',
  'visibility', 'featured', 'experimental', 'interfaces',
  'complexity', 'requiresAuth', 'inputs', 'outputs',
];

const CHECK_MODE = process.argv.includes('--check');
const errors = [];
const found = [];

// Walk packages/<name>/src/**/ looking for manifest.ts
const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => join(PACKAGES_DIR, d.name, 'src'));

for (const srcDir of packageDirs) {
  if (!existsSync(srcDir)) continue;
  scanDir(srcDir);
}

function scanDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (entry.name === 'manifest.ts') {
      found.push(full);
      // Read and do a basic field-presence check (without executing TS)
      const src = readFileSync(full, 'utf-8');
      for (const field of REQUIRED_FIELDS) {
        if (!src.includes(`${field}:`)) {
          errors.push(`${full}: missing field "${field}"`);
        }
      }
    }
  }
}

console.log(`\n📦 Toolbox Registry Scanner`);
console.log(`   Scanned: ${PACKAGES_DIR}`);
console.log(`   Manifests found: ${found.length}\n`);

found.forEach((f) => {
  const rel = f.replace(REPO_ROOT + '/', '');
  const ok = !errors.some((e) => e.startsWith(f));
  console.log(`  ${ok ? '✓' : '✗'} ${rel}`);
});

if (errors.length) {
  console.log(`\n❌ ${errors.length} issue(s) found:\n`);
  errors.forEach((e) => console.log(`  • ${e}`));
  if (CHECK_MODE) process.exit(1);
} else {
  console.log(`\n✅ All ${found.length} manifests are valid.\n`);
}
