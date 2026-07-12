import type { Command } from 'commander';
import chalk from 'chalk';
import {
  calculateLoan,
  calculateEMI,
  calculateSIP,
  calculateGST,
  calculateReverseLoan,
  simulatePrepayment,
  scheduleToCSV,
  outputToJSON,
} from '@toolbox/finance';
import { printResult, printError } from '../lib/output.js';

export function registerFinanceCommands(program: Command): void {
  const finance = program
    .command('finance')
    .description('Financial calculators');

  // toolbox finance loan -p 500000 -r 8.5 -t 240 [--schedule] [--json] [--csv]
  finance
    .command('loan')
    .description('Loan repayment calculator')
    .requiredOption('-p, --principal <amount>', 'Principal amount', parseFloat)
    .requiredOption('-r, --rate <percent>', 'Annual interest rate (%)', parseFloat)
    .requiredOption('-t, --tenure <months>', 'Tenure in months', parseInt)
    .option('--schedule', 'Print amortisation schedule')
    .option('--json', 'Output full result as JSON')
    .option('--csv', 'Output amortisation schedule as CSV (implies --schedule)')
    .option('--start-date <date>', 'Loan start date YYYY-MM-DD (computes payoff date)')
    .action((opts) => {
      const includeSchedule = opts.schedule || opts.csv;
      const result = calculateLoan({
        principal: opts.principal,
        annualRatePercent: opts.rate,
        tenureMonths: opts.tenure,
        includeSchedule,
        startDate: opts.startDate,
      });

      if (!result.success) { printError(result.error); process.exit(1); }

      if (opts.json) {
        process.stdout.write(outputToJSON(result.data) + '\n');
        return;
      }

      if (opts.csv) {
        if (!result.data.schedule?.length) {
          console.error('No schedule to export.');
          process.exit(1);
        }
        process.stdout.write(scheduleToCSV(result.data.schedule) + '\n');
        return;
      }

      console.warn(chalk.green('\nLoan Calculation Result:'));
      printResult({
        EMI: result.data.emi,
        'Total Payment': result.data.totalPayment,
        'Total Interest': result.data.totalInterest,
        'Interest %': result.data.interestPercent,
      });

      if (result.data.payoffDate) {
        console.warn(chalk.dim(`  Payoff Date: ${result.data.payoffDate}`));
      }

      if (result.data.warnings.length) {
        console.warn(chalk.yellow('\n  Warnings:'));
        result.data.warnings.forEach((w) =>
          console.warn(`  ${w.severity === 'warning' ? '⚠' : 'ℹ'} ${w.message}`),
        );
      }

      if (result.data.schedule) {
        console.warn(chalk.dim('\n  Month  |  Principal  |  Interest  |  Balance'));
        result.data.schedule.forEach((row) => {
          console.warn(
            `  ${String(row.month).padEnd(6)} |  ${String(row.principal).padEnd(11)} |  ${String(row.interest).padEnd(10)} |  ${row.balance}`,
          );
        });
      }
    });

  // toolbox finance reverse-loan --emi 10000 --rate 10 --tenure 12
  finance
    .command('reverse-loan')
    .description('Derive principal from known EMI, rate, and tenure')
    .requiredOption('--emi <amount>', 'Known monthly EMI', parseFloat)
    .requiredOption('-r, --rate <percent>', 'Annual interest rate (%)', parseFloat)
    .requiredOption('-t, --tenure <months>', 'Tenure in months', parseInt)
    .option('--json', 'Output result as JSON')
    .action((opts) => {
      const result = calculateReverseLoan({
        emi: opts.emi,
        annualRatePercent: opts.rate,
        tenureMonths: opts.tenure,
      });
      if (!result.success) { printError(result.error); process.exit(1); }
      if (opts.json) { process.stdout.write(JSON.stringify(result.data, null, 2) + '\n'); return; }
      console.warn(chalk.green('\nReverse Loan Result:'));
      printResult({
        Principal: result.data.principal,
        'Total Payment': result.data.totalPayment,
        'Total Interest': result.data.totalInterest,
        'Interest %': result.data.interestPercent,
      });
    });

  // toolbox finance prepayment -p 500000 -r 10 -t 60 --month 12 --amount 50000
  finance
    .command('prepayment')
    .description('Simulate lump-sum prepayment(s) on a loan')
    .requiredOption('-p, --principal <amount>', 'Principal amount', parseFloat)
    .requiredOption('-r, --rate <percent>', 'Annual interest rate (%)', parseFloat)
    .requiredOption('-t, --tenure <months>', 'Original tenure in months', parseInt)
    .option('--month <months>', 'Comma-separated prepayment month(s)', String)
    .option('--amount <amounts>', 'Comma-separated prepayment amount(s)', String)
    .option('--json', 'Output full result as JSON')
    .action((opts) => {
      const months = (opts.month ?? '').split(',').map(Number).filter(Boolean);
      const amounts = (opts.amount ?? '').split(',').map(Number).filter(Boolean);
      if (!months.length || months.length !== amounts.length) {
        console.error(chalk.red('Error: --month and --amount must have the same count and at least one entry.'));
        process.exit(1);
      }
      const prepayments = months.map((m: number, i: number) => ({ month: m, amount: amounts[i] ?? 0 }));
      const result = simulatePrepayment({
        principal: opts.principal,
        annualRatePercent: opts.rate,
        tenureMonths: opts.tenure,
        prepayments,
      });
      if (!result.success) { printError(result.error); process.exit(1); }
      if (opts.json) { process.stdout.write(JSON.stringify(result.data, null, 2) + '\n'); return; }
      console.warn(chalk.green('\nPrepayment Simulation Result:'));
      printResult({
        'Interest Saved': result.data.interestSaved,
        'Months Saved': result.data.monthsSaved,
        'New Tenure': result.data.newTenureMonths,
        'New Total Interest': result.data.newTotalInterest,
        'Original Interest': result.data.originalTotalInterest,
      });
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
