#!/usr/bin/env node
/**
 * benchmark.mjs
 *
 * Runs each tool's Capability.execute() N times and reports:
 *   - median execution time
 *   - p95 execution time
 *   - ops/sec (throughput)
 *   - approximate memory allocation per call (heap delta)
 *
 * Outputs:
 *   - Human-readable table to stdout
 *   - Machine-readable JSON  → benchmarks/results/<ISO-date>.json
 *   - Human-readable Markdown → benchmarks/results/<ISO-date>.md
 *   - benchmarks/latest.json (symlink/copy for CI diffing)
 *
 * History:
 *   All JSON results are kept under benchmarks/results/. Re-running the
 *   script appends a new dated file — nothing is overwritten. To view
 *   regressions across runs, compare two JSON files or use the history
 *   sub-command (future work).
 *
 * Usage:
 *   node scripts/benchmark.mjs [--runs=1000] [--warmup=100] [--json-only]
 */

import { performance } from 'perf_hooks';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ─── CLI args ────────────────────────────────────────────────────────────────

const RUNS = getArg('--runs=', 1000);
const WARMUP = getArg('--warmup=', 100);
const JSON_ONLY = process.argv.includes('--json-only');

function getArg(prefix, defaultVal) {
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? parseInt(arg.slice(prefix.length), 10) : defaultVal;
}

// ─── tool fixtures ───────────────────────────────────────────────────────────

async function loadFixtures() {
  const [finance, utilities, developer] = await Promise.all([
    import('../packages/finance/dist/index.js'),
    import('../packages/utilities/dist/index.js'),
    import('../packages/developer/dist/index.js'),
  ]);

  return [
    {
      id: 'loan-calculator',
      name: 'Loan Calculator',
      capability: finance.LoanCalculator,
      input: { principal: 500000, annualRatePercent: 8.5, tenureMonths: 240 },
    },
    {
      id: 'emi-calculator',
      name: 'EMI Calculator',
      capability: finance.EMICalculator,
      input: { principal: 800000, annualRatePercent: 9, tenureMonths: 60 },
    },
    {
      id: 'sip-calculator',
      name: 'SIP Calculator',
      capability: finance.SIPCalculator,
      input: { monthlyInvestment: 10000, annualRatePercent: 12, tenureMonths: 120 },
    },
    {
      id: 'compound-interest',
      name: 'Compound Interest',
      capability: finance.CompoundInterestCalculator,
      input: { principal: 100000, annualRatePercent: 8, years: 5, compoundingsPerYear: 12 },
    },
    {
      id: 'gst-calculator',
      name: 'GST Calculator',
      capability: finance.GSTCalculator,
      input: { amount: 10000, gstPercent: 18, mode: 'exclusive' },
    },
    {
      id: 'unit-converter',
      name: 'Unit Converter (km→mi)',
      capability: utilities.UnitConverter,
      input: { value: 100, from: 'km', to: 'mi' },
    },
    {
      id: 'password-generator',
      name: 'Password Generator',
      capability: developer.PasswordGenerator,
      input: { length: 16, includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: false, excludeAmbiguous: false, count: 1 },
    },
    {
      id: 'uuid-generator',
      name: 'UUID Generator (×10)',
      capability: developer.UUIDGenerator,
      input: { count: 10, version: 'v4', uppercase: false },
    },
  ];
}

// ─── measurement ─────────────────────────────────────────────────────────────

/**
 * Measure a single async tool run.
 * Returns { durationMs, heapDeltaBytes }.
 */
async function measureOne(execute, input) {
  const heapBefore = process.memoryUsage().heapUsed;
  const t0 = performance.now();
  await execute(input);
  const durationMs = performance.now() - t0;
  const heapDelta = process.memoryUsage().heapUsed - heapBefore;
  return { durationMs, heapDeltaBytes: heapDelta };
}

/**
 * Run a full benchmark for one tool.
 * Returns aggregated stats.
 */
async function runBenchmark(execute, input) {
  // Warmup — fills JIT caches, stabilises memory baseline
  for (let i = 0; i < WARMUP; i++) await execute(input);

  const durations = [];
  let totalHeapDelta = 0;

  for (let i = 0; i < RUNS; i++) {
    const { durationMs, heapDeltaBytes } = await measureOne(execute, input);
    durations.push(durationMs);
    totalHeapDelta += Math.max(0, heapDeltaBytes); // negative deltas = GC, ignore
  }

  durations.sort((a, b) => a - b);

  const median = durations[Math.floor(RUNS / 2)];
  const p95 = durations[Math.floor(RUNS * 0.95)];
  const min = durations[0];
  const max = durations[RUNS - 1];
  const mean = durations.reduce((s, v) => s + v, 0) / RUNS;

  // ops/sec based on mean (more representative than median for throughput)
  const opsPerSec = mean > 0 ? Math.round(1000 / mean) : Infinity;

  // Average heap allocated per call (rough, includes GC noise)
  const avgHeapBytes = Math.round(totalHeapDelta / RUNS);

  return { median, p95, min, max, mean, opsPerSec, avgHeapBytes };
}

// ─── formatting helpers ───────────────────────────────────────────────────────

function fmtMs(ms) {
  if (ms === undefined || ms === null) return '—';
  return ms < 0.01 ? `${(ms * 1000).toFixed(1)} µs` : `${ms.toFixed(3)} ms`;
}

function fmtOps(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M/s`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k/s`;
  return `${n}/s`;
}

function fmtBytes(bytes) {
  if (bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// ─── output writers ───────────────────────────────────────────────────────────

function buildJsonReport(results, runDate) {
  return {
    generated: runDate,
    runs: RUNS,
    warmup: WARMUP,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    results: results.map(({ id, name, stats }) => ({
      id,
      name,
      median_ms: parseFloat(stats.median.toFixed(6)),
      p95_ms: parseFloat(stats.p95.toFixed(6)),
      min_ms: parseFloat(stats.min.toFixed(6)),
      max_ms: parseFloat(stats.max.toFixed(6)),
      mean_ms: parseFloat(stats.mean.toFixed(6)),
      ops_per_sec: stats.opsPerSec,
      avg_heap_bytes: stats.avgHeapBytes,
    })),
  };
}

function buildMarkdownReport(results, runDate, jsonPath) {
  const header = [
    `# Toolbox Benchmark Report`,
    ``,
    `**Date:** ${runDate}  `,
    `**Runs:** ${RUNS.toLocaleString()} · **Warmup:** ${WARMUP}  `,
    `**Node:** ${process.version} · **Platform:** ${process.platform}/${process.arch}  `,
    ``,
    `| Tool | Median | p95 | ops/sec | Avg heap/call |`,
    `|------|--------|-----|---------|---------------|`,
  ];

  const rows = results.map(({ name, stats }) =>
    `| ${name} | ${fmtMs(stats.median)} | ${fmtMs(stats.p95)} | ${fmtOps(stats.opsPerSec)} | ${fmtBytes(stats.avgHeapBytes)} |`,
  );

  const footer = [
    ``,
    `_JSON source: \`${jsonPath}\`_`,
    ``,
    `> Benchmark measures **Capability.execute()** end-to-end including Zod validation.`,
    `> Heap allocation figures are approximate; negative GC deltas are excluded.`,
  ];

  return [...header, ...rows, ...footer].join('\n');
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function writeResults(results) {
  const runDate = new Date().toISOString();
  const dateStamp = runDate.slice(0, 19).replace(/[T:]/g, '-');
  const outDir = join(process.cwd(), 'benchmarks', 'results');
  ensureDir(outDir);

  const jsonName = `${dateStamp}.json`;
  const mdName = `${dateStamp}.md`;
  const jsonPath = join(outDir, jsonName);
  const mdPath = join(outDir, mdName);
  const latestPath = join(process.cwd(), 'benchmarks', 'latest.json');

  const report = buildJsonReport(results, runDate);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(latestPath, JSON.stringify(report, null, 2));

  const md = buildMarkdownReport(results, runDate, `benchmarks/results/${jsonName}`);
  writeFileSync(mdPath, md);

  return { jsonPath, mdPath, latestPath };
}

// ─── main ─────────────────────────────────────────────────────────────────────

const fixtures = await loadFixtures();
const results = [];

if (!JSON_ONLY) {
  console.log(`\n⏱  Toolbox Benchmark  (${RUNS.toLocaleString()} runs, ${WARMUP} warmup)\n`);
  const COL = { name: 30, median: 12, p95: 12, ops: 10, heap: 12 };
  console.log(
    `${'Tool'.padEnd(COL.name)} ${'Median'.padStart(COL.median)} ${'p95'.padStart(COL.p95)} ${'ops/sec'.padStart(COL.ops)} ${'Heap/call'.padStart(COL.heap)}`,
  );
  console.log('─'.repeat(COL.name + COL.median + COL.p95 + COL.ops + COL.heap + 4));
}

for (const { id, name, capability, input } of fixtures) {
  const stats = await runBenchmark(capability.execute.bind(capability), input);
  results.push({ id, name, stats });

  if (!JSON_ONLY) {
    console.log(
      `${name.padEnd(30)} ${fmtMs(stats.median).padStart(12)} ${fmtMs(stats.p95).padStart(12)} ${fmtOps(stats.opsPerSec).padStart(10)} ${fmtBytes(stats.avgHeapBytes).padStart(12)}`,
    );
  }
}

if (!JSON_ONLY) {
  console.log('─'.repeat(78));
}

// Write files
const { jsonPath, mdPath, latestPath } = writeResults(results);

if (!JSON_ONLY) {
  console.log(`\n📄 JSON report:     ${jsonPath}`);
  console.log(`📝 Markdown report: ${mdPath}`);
  console.log(`🔗 Latest (CI):     ${latestPath}`);
  console.log(`\n✅ Benchmark complete.\n`);
} else {
  // When called from CI: print just the JSON path so pipelines can parse it
  console.log(jsonPath);
}
