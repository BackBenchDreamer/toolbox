import { describe, it, expect } from 'vitest';
import {
  // Types are compile-time only — verified by typecheck
  // Registry
  registry,
  ALL_TOOLS,
  CAPABILITIES,
  getCapability,
  getToolById,
  searchTools,
  // Finance capabilities
  LoanCalculator,
  EMICalculator,
  SIPCalculator,
  CompoundInterestCalculator,
  GSTCalculator,
  calculateLoan,
  // Utilities
  UnitConverter,
  convertUnit,
  UNITS,
  // Developer
  PasswordGenerator,
  UUIDGenerator,
  generatePassword,
} from './index.js';

describe('@toolbox/sdk surface', () => {
  it('exports ALL_TOOLS with 8 entries', () => {
    expect(ALL_TOOLS.length).toBe(8);
  });

  it('exports CAPABILITIES with an entry per tool', () => {
    expect(CAPABILITIES.size).toBe(8);
  });

  it('exports registry object with execute/has/list/manifest', () => {
    expect(typeof registry.execute).toBe('function');
    expect(typeof registry.has).toBe('function');
    expect(typeof registry.list).toBe('function');
    expect(typeof registry.manifest).toBe('function');
  });

  it('getToolById is re-exported correctly', () => {
    expect(getToolById('loan-calculator')?.name).toBe('Loan Calculator');
  });

  it('getCapability is re-exported correctly', () => {
    expect(getCapability('uuid-generator')?.manifest.id).toBe('uuid-generator');
  });

  it('searchTools works via SDK', () => {
    expect(searchTools('emi').some((t) => t.id === 'emi-calculator')).toBe(true);
  });

  it('UNITS array is re-exported', () => {
    expect(Array.isArray(UNITS)).toBe(true);
    expect(UNITS.length).toBeGreaterThan(0);
  });
});

describe('@toolbox/sdk Capability execution', () => {
  it('LoanCalculator.execute() resolves correctly', async () => {
    const r = await LoanCalculator.execute({ principal: 500000, annualRatePercent: 8.5, tenureMonths: 240 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.emi).toBeGreaterThan(0);
  });

  it('EMICalculator.execute() resolves correctly', async () => {
    const r = await EMICalculator.execute({ principal: 800000, annualRatePercent: 9, tenureMonths: 60 });
    expect(r.success).toBe(true);
  });

  it('SIPCalculator.execute() resolves correctly', async () => {
    const r = await SIPCalculator.execute({ monthlyInvestment: 10000, annualRatePercent: 12, tenureMonths: 120 });
    expect(r.success).toBe(true);
  });

  it('CompoundInterestCalculator.execute() resolves correctly', async () => {
    const r = await CompoundInterestCalculator.execute({ principal: 100000, annualRatePercent: 8, years: 5, compoundingsPerYear: 12 });
    expect(r.success).toBe(true);
  });

  it('GSTCalculator.execute() resolves correctly', async () => {
    const r = await GSTCalculator.execute({ amount: 10000, gstPercent: 18, mode: 'exclusive' });
    expect(r.success).toBe(true);
  });

  it('UnitConverter.execute() resolves correctly', async () => {
    const r = await UnitConverter.execute({ value: 100, from: 'km', to: 'mi' });
    expect(r.success).toBe(true);
  });

  it('PasswordGenerator.execute() resolves correctly', async () => {
    const r = await PasswordGenerator.execute({ length: 12, includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: false, excludeAmbiguous: false, count: 1 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.passwords.length).toBe(1);
  });

  it('UUIDGenerator.execute() resolves correctly', async () => {
    const r = await UUIDGenerator.execute({ count: 3, version: 'v4', uppercase: false });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.uuids.length).toBe(3);
  });
});

describe('@toolbox/sdk raw functions', () => {
  it('calculateLoan is re-exported and works', () => {
    const r = calculateLoan({ principal: 100000, annualRatePercent: 8, tenureMonths: 12 });
    expect(r.success).toBe(true);
  });

  it('convertUnit is re-exported and works', () => {
    const r = convertUnit({ value: 1, from: 'km', to: 'm' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.value).toBe(1000);
  });

  it('generatePassword is re-exported and works', () => {
    const r = generatePassword({ length: 8, includeLowercase: true, includeUppercase: false, includeNumbers: false, includeSymbols: false, excludeAmbiguous: false, count: 1 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.passwords[0]?.length).toBe(8);
  });
});

describe('@toolbox/sdk registry dynamic dispatch', () => {
  it('registry.execute dispatches loan-calculator via SDK', async () => {
    const r = await registry.execute('loan-calculator', { principal: 200000, annualRatePercent: 7.5, tenureMonths: 60 });
    expect(r.success).toBe(true);
  });

  it('registry.execute returns NOT_FOUND for unknown tool', async () => {
    const r = await registry.execute('not-a-tool', {});
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.code).toBe('NOT_FOUND');
  });

  it('registry.list() returns 8 tool ids', () => {
    expect(registry.list().length).toBe(8);
  });
});
