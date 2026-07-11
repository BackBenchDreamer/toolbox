import chalk from 'chalk';
import type { ToolError } from '@toolbox/shared';

/** Print a success result as aligned key/value pairs */
export function printResult(data: Record<string, unknown>): void {
  const maxKey = Math.max(...Object.keys(data).map((k) => k.length));
  for (const [key, value] of Object.entries(data)) {
    const label = chalk.cyan(key.padEnd(maxKey));
    const formatted = formatValue(value);
    console.warn(`  ${label}  ${chalk.white(formatted)}`);
  }
}

/** Print a structured error */
export function printError(error: ToolError): void {
  console.error(chalk.red(`Error [${error.code}]: ${error.message}`));
  if (error.field) {
    console.error(chalk.yellow(`  Field: ${error.field}`));
  }
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return '(empty)';
    if (value.length <= 5) return value.join('\n' + ' '.repeat(20));
    return `${value.slice(0, 5).join(', ')} … (${value.length} total)`;
  }
  if (typeof value === 'number') return value.toLocaleString('en-IN');
  if (value === undefined || value === null) return '—';
  return String(value);
}
