import { Command } from 'commander';
import chalk from 'chalk';
import { calculateLoan } from '@toolbox/finance';
import { calculateEMI } from '@toolbox/finance';
import { calculateSIP } from '@toolbox/finance';
import { calculateGST } from '@toolbox/finance';
import { printResult, printError } from '../lib/output.js';

export function registerFinanceCommands(program: Command): void {
  const finance = program
    .command('finance')
    .description('Financial calculators');

  // toolbox finance loan --principal 500000 --rate 8.5 --tenure 240
  finance
    .command('loan')
    .description('Loan repayment calculator')
    .requiredOption('-p, --principal <amount>', 'Principal amount', parseFloat)
    .requiredOption('-r, --rate <percent>', 'Annual interest rate (%)', parseFloat)
    .requiredOption('-t, --tenure <months>', 'Tenure in months', parseInt)
    .option('--schedule', 'Print amortisation schedule')
    .action((opts) => {
      const result = calculateLoan({
        principal: opts.principal,
        annualRatePercent: opts.rate,
        tenureMonths: opts.tenure,
        includeSchedule: opts.schedule ?? false,
      });
      if (!result.success) { printError(result.error); process.exit(1); }
      console.warn(chalk.green('\nLoan Calculation Result:'));
      printResult({ EMI: result.data.emi, 'Total Payment': result.data.totalPayment, 'Total Interest': result.data.totalInterest });
      if (result.data.schedule) {
        console.warn(chalk.dim('\n  Month  |  Principal  |  Interest  |  Balance'));
        result.data.schedule.forEach((row) => {
          console.warn(`  ${String(row.month).padEnd(6)} |  ${String(row.principal).padEnd(11)} |  ${String(row.interest).padEnd(10)} |  ${row.balance}`);
        });
      }
    });

  // toolbox finance emi --principal 800000 --rate 9 --tenure 60
  finance
    .command('emi')
    .description('EMI calculator')
    .requiredOption('-p, --principal <amount>', 'Principal', parseFloat)
    .requiredOption('-r, --rate <percent>', 'Annual rate (%)', parseFloat)
    .requiredOption('-t, --tenure <months>', 'Tenure in months', parseInt)
    .action((opts) => {
      const result = calculateEMI({ principal: opts.principal, annualRatePercent: opts.rate, tenureMonths: opts.tenure });
      if (!result.success) { printError(result.error); process.exit(1); }
      console.warn(chalk.green('\nEMI Result:'));
      printResult(result.data as unknown as Record<string, unknown>);
    });

  // toolbox finance sip --monthly 10000 --rate 12 --tenure 120
  finance
    .command('sip')
    .description('SIP future value calculator')
    .requiredOption('-m, --monthly <amount>', 'Monthly investment', parseFloat)
    .requiredOption('-r, --rate <percent>', 'Expected annual return (%)', parseFloat)
    .requiredOption('-t, --tenure <months>', 'Investment tenure in months', parseInt)
    .action((opts) => {
      const result = calculateSIP({ monthlyInvestment: opts.monthly, annualRatePercent: opts.rate, tenureMonths: opts.tenure });
      if (!result.success) { printError(result.error); process.exit(1); }
      console.warn(chalk.green('\nSIP Result:'));
      printResult(result.data as unknown as Record<string, unknown>);
    });

  // toolbox finance gst --amount 10000 --rate 18 --mode exclusive
  finance
    .command('gst')
    .description('GST calculator')
    .requiredOption('-a, --amount <amount>', 'Amount', parseFloat)
    .requiredOption('-r, --rate <percent>', 'GST rate (%)', parseFloat)
    .option('-m, --mode <mode>', 'exclusive or inclusive', 'exclusive')
    .action((opts) => {
      const result = calculateGST({ amount: opts.amount, gstPercent: opts.rate, mode: opts.mode });
      if (!result.success) { printError(result.error); process.exit(1); }
      console.warn(chalk.green('\nGST Result:'));
      printResult(result.data as unknown as Record<string, unknown>);
    });
}
