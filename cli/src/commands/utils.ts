import type { Command } from 'commander';
import chalk from 'chalk';
import { convertUnit, UNITS } from '@toolbox/utilities';
import { generatePassword, generateUUID } from '@toolbox/developer';
import { printError } from '../lib/output.js';

export function registerUtilCommands(program: Command): void {
  // toolbox convert 100 km mi
  program
    .command('convert <value> <from> <to>')
    .description('Convert between units (e.g. convert 100 km mi)')
    .action((value: string, from: string, to: string) => {
      const result = convertUnit({ value: parseFloat(value), from, to });
      if (!result.success) { printError(result.error); process.exit(1); }
      console.warn(chalk.green(result.data.formula));
    });

  // toolbox units [category]
  program
    .command('units [category]')
    .description('List available unit keys (optionally filter by category)')
    .action((category?: string) => {
      const filtered = category ? UNITS.filter((u) => u.category === category) : UNITS;
      console.warn(chalk.bold('Available units:'));
      for (const u of filtered) {
        console.warn(`  ${chalk.cyan(u.key.padEnd(8))} ${u.label.padEnd(20)} ${chalk.dim(u.category)}`);
      }
    });

  // toolbox password --length 20 --symbols
  program
    .command('password')
    .description('Generate a secure password')
    .option('-l, --length <n>', 'Password length', '16')
    .option('--no-lower', 'Exclude lowercase')
    .option('--no-upper', 'Exclude uppercase')
    .option('--no-digits', 'Exclude digits')
    .option('--symbols', 'Include symbols')
    .option('-n, --count <n>', 'Number of passwords', '1')
    .action((opts) => {
      const result = generatePassword({
        length: parseInt(opts.length),
        includeLowercase: opts.lower !== false,
        includeUppercase: opts.upper !== false,
        includeNumbers: opts.digits !== false,
        includeSymbols: opts.symbols ?? false,
        excludeAmbiguous: false,
        count: parseInt(opts.count),
      });
      if (!result.success) { printError(result.error); process.exit(1); }
      result.data.passwords.forEach((p) => console.warn(p));
      console.warn(chalk.dim(`\nEntropy: ${result.data.entropy} bits | Strength: ${result.data.strength}`));
    });

  // toolbox uuid [--count 5] [--v7]
  program
    .command('uuid')
    .description('Generate UUIDs')
    .option('-n, --count <n>', 'Number of UUIDs', '1')
    .option('--v7', 'Generate v7 (time-ordered) UUIDs instead of v4')
    .option('-u, --upper', 'Output in uppercase')
    .action((opts) => {
      const result = generateUUID({
        count: parseInt(opts.count),
        version: opts.v7 ? 'v7' : 'v4',
        uppercase: opts.upper ?? false,
      });
      if (!result.success) { printError(result.error); process.exit(1); }
      result.data.uuids.forEach((id) => console.warn(id));
    });
}
