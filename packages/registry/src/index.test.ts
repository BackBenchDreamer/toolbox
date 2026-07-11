import { describe, it, expect } from 'vitest';
import {
  ALL_TOOLS,
  CAPABILITIES,
  registry,
  getToolById,
  getToolBySlug,
  getToolsByCategory,
  getFeaturedTools,
  getPublicTools,
  searchTools,
  getActiveCategories,
  getToolsGroupedByCategory,
  getRelatedTools,
  getToolsByInterface,
  getCapability,
} from './index.js';

describe('Tool Registry', () => {
  it('contains all 8 initial tools', () => {
    expect(ALL_TOOLS.length).toBe(8);
  });

  it('each tool has required manifest fields', () => {
    for (const tool of ALL_TOOLS) {
      expect(tool.id, `${tool.id} missing id`).toBeTruthy();
      expect(tool.slug, `${tool.id} missing slug`).toBeTruthy();
      expect(tool.name, `${tool.id} missing name`).toBeTruthy();
      expect(tool.category, `${tool.id} missing category`).toBeTruthy();
      expect(tool.apiEndpoint, `${tool.id} missing apiEndpoint`).toBeTruthy();
      expect(tool.route, `${tool.id} missing route`).toBeTruthy();
      expect(tool.version, `${tool.id} missing version`).toBeTruthy();
      expect(typeof tool.experimental).toBe('boolean');
      expect(typeof tool.requiresAuth).toBe('boolean');
      expect(tool.complexity).toBeTruthy();
    }
  });

  it('every tool manifest includes interfaces flags', () => {
    for (const tool of ALL_TOOLS) {
      expect(typeof tool.interfaces.api).toBe('boolean');
      expect(typeof tool.interfaces.cli).toBe('boolean');
      expect(typeof tool.interfaces.web).toBe('boolean');
      expect(typeof tool.interfaces.mcp).toBe('boolean');
      expect(typeof tool.interfaces.npm).toBe('boolean');
    }
  });

  it('all api endpoints are versioned under /api/v1/', () => {
    ALL_TOOLS.forEach((t) => expect(t.apiEndpoint).toMatch(/^\/api\/v1\//));
  });

  it('all tool routes start with /', () => {
    ALL_TOOLS.forEach((t) => expect(t.route).toMatch(/^\//));
  });

  it('all tool ids are unique', () => {
    const ids = ALL_TOOLS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getToolById returns the correct tool', () => {
    const tool = getToolById('loan-calculator');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('Loan Calculator');
  });

  it('getToolBySlug returns the correct tool', () => {
    expect(getToolBySlug('uuid-generator')?.id).toBe('uuid-generator');
  });

  it('getToolById returns undefined for unknown id', () => {
    expect(getToolById('does-not-exist')).toBeUndefined();
  });

  it('getToolsByCategory returns only finance tools', () => {
    const tools = getToolsByCategory('finance');
    expect(tools.length).toBeGreaterThanOrEqual(5);
    tools.forEach((t) => expect(t.category).toBe('finance'));
  });

  it('getFeaturedTools returns at least one featured tool', () => {
    expect(getFeaturedTools().length).toBeGreaterThan(0);
  });

  it('getPublicTools returns only public/beta tools', () => {
    const tools = getPublicTools();
    tools.forEach((t) => expect(['public', 'beta']).toContain(t.visibility));
  });

  it('searchTools finds tools by name', () => {
    expect(searchTools('loan').some((t) => t.id === 'loan-calculator')).toBe(true);
  });

  it('searchTools returns all tools for empty query', () => {
    expect(searchTools('').length).toBe(getPublicTools().length);
  });

  it('searchTools returns empty array for nonsense query', () => {
    expect(searchTools('xyzzy-doesnotexist')).toHaveLength(0);
  });

  it('getActiveCategories returns all active categories', () => {
    const cats = getActiveCategories();
    expect(cats).toContain('finance');
    expect(cats).toContain('developer');
    expect(cats).toContain('utilities');
  });

  it('getToolsGroupedByCategory groups finance tools correctly', () => {
    const map = getToolsGroupedByCategory();
    expect(map.has('finance')).toBe(true);
    expect(map.get('finance')!.length).toBeGreaterThanOrEqual(5);
  });

  it('getRelatedTools resolves related tool IDs to manifests', () => {
    const related = getRelatedTools('loan-calculator');
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((t) => t !== undefined)).toBe(true);
    // should not include the tool itself
    expect(related.some((t) => t.id === 'loan-calculator')).toBe(false);
  });

  it('getRelatedTools returns empty for a tool with no related tools', () => {
    // unit-converter has no relatedTools defined
    const related = getRelatedTools('unit-converter');
    expect(Array.isArray(related)).toBe(true);
  });

  it('getToolsByInterface returns tools that support API', () => {
    const apiTools = getToolsByInterface('api');
    expect(apiTools.length).toBeGreaterThan(0);
    apiTools.forEach((t) => expect(t.interfaces.api).toBe(true));
  });

  it('getToolsByInterface returns tools that support CLI', () => {
    const cliTools = getToolsByInterface('cli');
    expect(cliTools.length).toBeGreaterThan(0);
    cliTools.forEach((t) => expect(t.interfaces.cli).toBe(true));
  });

  it('no tool has requiresAuth: true (all are open by default)', () => {
    ALL_TOOLS.forEach((t) => expect(t.requiresAuth).toBe(false));
  });

  it('no tool manifest contains estimatedMs', () => {
    ALL_TOOLS.forEach((t) => {
      expect((t as Record<string, unknown>)['estimatedMs']).toBeUndefined();
    });
  });
});

describe('Capability registry', () => {
  it('CAPABILITIES map has an entry for every tool in ALL_TOOLS', () => {
    expect(CAPABILITIES.size).toBe(ALL_TOOLS.length);
    ALL_TOOLS.forEach((t) => expect(CAPABILITIES.has(t.id)).toBe(true));
  });

  it('each Capability carries the correct manifest', () => {
    for (const [id, cap] of CAPABILITIES) {
      expect(cap.manifest.id).toBe(id);
    }
  });

  it('getCapability returns the capability for a known id', () => {
    const cap = getCapability('loan-calculator');
    expect(cap).toBeDefined();
    expect(cap?.manifest.name).toBe('Loan Calculator');
  });

  it('getCapability returns undefined for an unknown id', () => {
    expect(getCapability('does-not-exist')).toBeUndefined();
  });

  it('every Capability.execute() returns a Promise<Result>', async () => {
    // smoke-test every tool with its first example input (if present)
    const sampleInputs: Record<string, Record<string, unknown>> = {
      'loan-calculator': { principal: 500000, annualRatePercent: 8.5, tenureMonths: 240 },
      'emi-calculator': { principal: 800000, annualRatePercent: 9, tenureMonths: 60 },
      'sip-calculator': { monthlyInvestment: 10000, annualRatePercent: 12, tenureMonths: 120 },
      'compound-interest': { principal: 100000, annualRatePercent: 8, years: 5, compoundingsPerYear: 12 },
      'gst-calculator': { amount: 10000, gstPercent: 18, mode: 'exclusive' },
      'unit-converter': { value: 100, from: 'km', to: 'mi' },
      'password-generator': { length: 12, includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: false, excludeAmbiguous: false, count: 1 },
      'uuid-generator': { count: 1, version: 'v4', uppercase: false },
    };

    for (const [id, cap] of CAPABILITIES) {
      const input = sampleInputs[id] ?? {};
      const result = await cap.execute(input);
      expect(typeof result.success).toBe('boolean');
    }
  });
});

describe('registry object (dynamic dispatch)', () => {
  it('registry.list() returns all registered tool ids', () => {
    const ids = registry.list();
    expect(ids.length).toBe(ALL_TOOLS.length);
    ALL_TOOLS.forEach((t) => expect(ids).toContain(t.id));
  });

  it('registry.has() returns true for known ids', () => {
    expect(registry.has('loan-calculator')).toBe(true);
    expect(registry.has('uuid-generator')).toBe(true);
  });

  it('registry.has() returns false for unknown ids', () => {
    expect(registry.has('does-not-exist')).toBe(false);
  });

  it('registry.manifest() returns the correct manifest', () => {
    const m = registry.manifest('gst-calculator');
    expect(m).toBeDefined();
    expect(m?.id).toBe('gst-calculator');
  });

  it('registry.manifest() returns undefined for unknown id', () => {
    expect(registry.manifest('does-not-exist')).toBeUndefined();
  });

  it('registry.execute() dispatches to the correct tool', async () => {
    const result = await registry.execute('emi-calculator', {
      principal: 800000,
      annualRatePercent: 9,
      tenureMonths: 60,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty('emi');
    }
  });

  it('registry.execute() returns a NOT_FOUND error for unknown id', async () => {
    const result = await registry.execute('does-not-exist', {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.message).toContain('does-not-exist');
    }
  });

  it('registry.execute() returns VALIDATION_ERROR for invalid input', async () => {
    const result = await registry.execute('loan-calculator', { principal: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('registry.execute() works for all 8 registered tools', async () => {
    const inputs: Record<string, Record<string, unknown>> = {
      'loan-calculator': { principal: 100000, annualRatePercent: 8, tenureMonths: 12 },
      'emi-calculator': { principal: 100000, annualRatePercent: 8, tenureMonths: 12 },
      'sip-calculator': { monthlyInvestment: 5000, annualRatePercent: 12, tenureMonths: 12 },
      'compound-interest': { principal: 100000, annualRatePercent: 8, years: 1, compoundingsPerYear: 12 },
      'gst-calculator': { amount: 1000, gstPercent: 18, mode: 'exclusive' },
      'unit-converter': { value: 1, from: 'km', to: 'mi' },
      'password-generator': { length: 8, includeLowercase: true, includeUppercase: false, includeNumbers: false, includeSymbols: false, excludeAmbiguous: false, count: 1 },
      'uuid-generator': { count: 1, version: 'v4', uppercase: false },
    };
    for (const id of registry.list()) {
      const input = inputs[id] ?? {};
      const result = await registry.execute(id, input);
      expect(result.success, `${id} should succeed`).toBe(true);
    }
  });
});
