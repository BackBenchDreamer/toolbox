#!/usr/bin/env node
/**
 * benchmark.mjs
 *
 * Runs each tool's calculation function N times and reports:
 *   - median execution time
 *   - p95 execution time
 *   - whether the result matches the tool's estimated execution time
 *
 * Usage: node scripts/benchmark.mjs [--runs=1000]
 *
 * Why: performance regressions become visible before they reach production.
 */

import { performance } from 'perf_hooks';

const RUNS = (() => {
  const arg = process.argv.find((a) => a.startsWith('--runs='));
  return arg ? parseInt(arg.slice(7), 10) : 1000;
})();

// ─── tool benchmarks ─────────────────────────────────────────────────────────
// Each entry: { name, fn, args, estimatedMs }
// Tools are imported dynamically so this script works after `npm run build`

async function loadTools() {
  const [finance, utilities, developer] = await Promise.all([
    import('../packages/finance/dist/index.js'),
    import('../packages/utilities/dist/index.js'),
    import('../packages/developer/dist/index.js'),
  ]);

  return [
    {
      name: 'Loan Calculator',
      fn: finance.calculateLoan,
      args: { principal: 500000, annualRatePercent: 8.5, tenureMonths: 240 },
      estimatedMs: 1,
    },
    {
      name: 'EMI Calculator',
      fn: finance.calculateEMI,
      args: { principal: 800000, annualRatePercent: 9, tenureMonths: 60 },
      estimatedMs: 0.1,
    },
    {
      name: 'SIP Calculator',
      fn: finance.calculateSIP,
      args: { monthlyInvestment: 10000, annualRatePercent: 12, tenureMonths: 120 },
      estimatedMs: 0.1,
    },
    {
      name: 'Compound Interest',
      fn: finance.calculateCompoundInterest,
      args: { principal: 100000, annualRatePercent: 8, years: 5, compoundingsPerYear: 12 },
      estimatedMs: 0.05,
    },
    {
      name: 'GST Calculator',
      fn: finance.calculateGST,
      args: { amount: 10000, gstPercent: 18, mode: 'exclusive' },
      estimatedMs: 0.05,
    },
    {
      name: 'Unit Converter (km→mi)',
      fn: utilities.convertUnit,
      args: { value: 100, from: 'km', to: 'mi' },
      estimatedMs: 0.01,
    },
    {
      name: 'Password Generator',
      fn: developer.generatePassword,
      args: { length: 16, includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: false, excludeAmbiguous: false, count: 1 },
      estimatedMs: 0.5,
    },
    {
      name: 'UUID Generator (×10)',
      fn: developer.generateUUID,
      args: { count: 10, version: 'v4', uppercase: false },
      estimatedMs: 0.5,
    },
  ];
}

function runBenchmark(fn, args, runs) {
  const times = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    fn(args);
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  return {
    median: times[Math.floor(runs / 2)],
    p95: times[Math.floor(runs * 0.95)],
    min: times[0],
    max: times[runs - 1],
  };
}

function fmt(ms) {
  return ms < 0.01 ? `${(ms * 1000).toFixed(1)} µs` : `${ms.toFixed(3)} ms`;
}

// ─── main ────────────────────────────────────────────────────────────────────
console.log(`\n⏱  Toolbox Benchmark  (${RUNS.toLocaleString()} runs each)\n`);
console.log(`${'Tool'.padEnd(30)} ${'Median'.padStart(10)} ${'p95'.padStart(10)} ${'vs estimate'.padStart(14)}`);
console.log('─'.repeat(68));

const tools = await loadTools();
let regressions = 0;

for (const { name, fn, args, estimatedMs } of tools) {
  const stats = runBenchmark(fn, args, RUNS);
  const ratio = stats.median / estimatedMs;
  const flag = ratio > 10 ? ' ⚠ SLOW' : '';
  if (ratio > 10) regressions++;
  console.log(
    `${name.padEnd(30)} ${fmt(stats.median).padStart(10)} ${fmt(stats.p95).padStart(10)} ${`${ratio.toFixed(1)}× est`.padStart(14)}${flag}`,
  );
}

console.log('─'.repeat(68));
if (regressions > 0) {
  console.log(`\n⚠  ${regressions} tool(s) are >10× slower than estimated.\n`);
  process.exit(1);
} else {
  console.log('\n✅ All tools within performance budget.\n');
}
