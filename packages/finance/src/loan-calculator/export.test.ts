import { describe, it, expect } from 'vitest';
import { scheduleToCSV, outputToJSON } from './export.js';
import { calculateLoan } from './index.js';

const SCHEDULE_INPUT = {
  principal: 100000,
  annualRatePercent: 10,
  tenureMonths: 3,
  includeSchedule: true,
};

describe('scheduleToCSV', () => {
  it('produces a header row by default', () => {
    const r = calculateLoan(SCHEDULE_INPUT);
    expect(r.success).toBe(true);
    if (!r.success) return;
    const csv = scheduleToCSV(r.data.schedule!);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Month,EMI,Principal,Interest,Balance,CumPrincipal,CumInterest');
  });

  it('produces correct number of data rows', () => {
    const r = calculateLoan(SCHEDULE_INPUT);
    expect(r.success).toBe(true);
    if (!r.success) return;
    const csv = scheduleToCSV(r.data.schedule!);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(4); // 1 header + 3 data rows
  });

  it('can suppress header row', () => {
    const r = calculateLoan(SCHEDULE_INPUT);
    expect(r.success).toBe(true);
    if (!r.success) return;
    const csv = scheduleToCSV(r.data.schedule!, { includeHeader: false });
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]!.startsWith('1,')).toBe(true);
  });

  it('first data row starts with month 1', () => {
    const r = calculateLoan(SCHEDULE_INPUT);
    expect(r.success).toBe(true);
    if (!r.success) return;
    const csv = scheduleToCSV(r.data.schedule!);
    const lines = csv.split('\n');
    expect(lines[1]!.startsWith('1,')).toBe(true);
  });
});

describe('outputToJSON', () => {
  it('returns valid JSON', () => {
    const r = calculateLoan({ principal: 100000, annualRatePercent: 10, tenureMonths: 12 });
    expect(r.success).toBe(true);
    if (!r.success) return;
    const json = outputToJSON(r.data);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('round-trips the emi field', () => {
    const r = calculateLoan({ principal: 100000, annualRatePercent: 10, tenureMonths: 12 });
    expect(r.success).toBe(true);
    if (!r.success) return;
    const parsed = JSON.parse(outputToJSON(r.data));
    expect(parsed.emi).toBe(r.data.emi);
  });
});
