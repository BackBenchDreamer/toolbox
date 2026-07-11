import { Command } from 'commander';
import chalk from 'chalk';
import { ALL_TOOLS, searchTools } from '@toolbox/registry';
import type { ToolManifest } from '@toolbox/registry';
import { registerFinanceCommands } from './commands/finance.js';
import { registerUtilCommands } from './commands/utils.js';

const program = new Command();

program
  .name('toolbox')
  .description('Toolbox — utilities, calculators, converters in your terminal')
  .version('0.1.0');

// toolbox list
program
  .command('list')
  .description('List all available tools')
  .option('-c, --category <cat>', 'Filter by category')
  .action((opts) => {
    const tools = opts.category ? ALL_TOOLS.filter((t) => t.category === opts.category) : ALL_TOOLS;
    console.warn(chalk.bold('\nAvailable Tools:\n'));
    const byCategory = new Map<string, ToolManifest[]>();
    for (const t of tools) {
      const list: ToolManifest[] = byCategory.get(t.category) ?? [];
      list.push(t);
      byCategory.set(t.category, list);
    }
    for (const [cat, items] of byCategory) {
      console.warn(chalk.yellow(`  ${cat.toUpperCase()}`));
      items.forEach((t) => {
        console.warn(`    ${chalk.cyan(t.id.padEnd(28))} ${t.description}`);
      });
      console.warn();
    }
  });

// toolbox search <query>
program
  .command('search <query>')
  .description('Search tools by keyword')
  .action((query: string) => {
    const results = searchTools(query);
    if (results.length === 0) {
      console.warn(chalk.dim(`No tools found for: "${query}"`));
    } else {
      console.warn(chalk.bold(`\nSearch results for "${query}":`));
      results.forEach((t) => console.warn(`  ${chalk.cyan(t.id.padEnd(28))} ${t.description}`));
    }
  });

registerFinanceCommands(program);
registerUtilCommands(program);

program.parse();
