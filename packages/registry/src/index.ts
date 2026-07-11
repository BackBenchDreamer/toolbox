import type { ToolManifest, ToolCategory, Capability } from '@toolbox/shared';
import {
  loanCalculatorManifest,
  emiCalculatorManifest,
  sipCalculatorManifest,
  compoundInterestManifest,
  gstCalculatorManifest,
  LoanCalculator,
  EMICalculator,
  SIPCalculator,
  CompoundInterestCalculator,
  GSTCalculator,
} from '@toolbox/finance';
import { unitConverterManifest, UnitConverter } from '@toolbox/utilities';
import { passwordGeneratorManifest, uuidGeneratorManifest, PasswordGenerator, UUIDGenerator } from '@toolbox/developer';

export type { ToolManifest, ToolCategory, Capability };

/** All registered Capability objects, keyed by tool id. */
export const CAPABILITIES: ReadonlyMap<string, Capability> = new Map<string, Capability>([
  [LoanCalculator.manifest.id, LoanCalculator as Capability],
  [EMICalculator.manifest.id, EMICalculator as Capability],
  [SIPCalculator.manifest.id, SIPCalculator as Capability],
  [CompoundInterestCalculator.manifest.id, CompoundInterestCalculator as Capability],
  [GSTCalculator.manifest.id, GSTCalculator as Capability],
  [UnitConverter.manifest.id, UnitConverter as Capability],
  [PasswordGenerator.manifest.id, PasswordGenerator as Capability],
  [UUIDGenerator.manifest.id, UUIDGenerator as Capability],
]);

/** Lookup a Capability by its tool id. Returns undefined if not registered. */
export function getCapability(id: string): Capability | undefined {
  return CAPABILITIES.get(id);
}

/**
 * Execute a tool by its registry id — the primary dynamic dispatch entry point.
 *
 * This is the preferred interface for CLI, MCP, AI agents, and any consumer
 * that resolves tools at runtime rather than import-time.
 *
 * ```ts
 * // Instead of:
 * import { LoanCalculator } from '@toolbox/finance';
 * await LoanCalculator.execute(input);
 *
 * // Use:
 * import { registry } from '@toolbox/registry';
 * await registry.execute('loan-calculator', input);
 * ```
 *
 * Returns a failed Result if the tool id is not registered.
 */
export const registry = {
  /** Execute a registered tool by id. */
  execute(id: string, input: unknown): ReturnType<Capability['execute']> {
    const cap = CAPABILITIES.get(id);
    if (!cap) {
      return Promise.resolve({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `No tool registered with id "${id}". Check registry.list() for available ids.`,
        },
      });
    }
    return cap.execute(input);
  },

  /** Check whether a tool id is registered. */
  has(id: string): boolean {
    return CAPABILITIES.has(id);
  },

  /** Return all registered tool ids. */
  list(): string[] {
    return [...CAPABILITIES.keys()];
  },

  /** Return the manifest for a tool id, or undefined. */
  manifest(id: string): ToolManifest | undefined {
    return CAPABILITIES.get(id)?.manifest;
  },
} as const;

/**
 * Master registry — single source of truth for all capabilities.
 *
 * Dependency rule: entries must always point inward.
 *   UI → API → Registry → packages → shared
 *   Never sideways. Never upward.
 *
 * To add a new tool:
 *   1. Create the tool in the appropriate package.
 *   2. Import its manifest here.
 *   3. Append it to ALL_TOOLS.
 *   4. Everything else (homepage, search, API docs, sitemap) updates automatically.
 */
const ALL_TOOLS: readonly ToolManifest[] = [
  loanCalculatorManifest,
  emiCalculatorManifest,
  sipCalculatorManifest,
  compoundInterestManifest,
  gstCalculatorManifest,
  unitConverterManifest,
  passwordGeneratorManifest,
  uuidGeneratorManifest,
];

export { ALL_TOOLS };

/** Lookup a tool by its unique id */
export function getToolById(id: string): ToolManifest | undefined {
  return ALL_TOOLS.find((t) => t.id === id);
}

/** Lookup a tool by its URL slug */
export function getToolBySlug(slug: string): ToolManifest | undefined {
  return ALL_TOOLS.find((t) => t.slug === slug);
}

/** Filter tools by category, excluding hidden */
export function getToolsByCategory(category: ToolCategory): ToolManifest[] {
  return ALL_TOOLS.filter((t) => t.category === category && t.visibility !== 'hidden');
}

/** Get all featured tools */
export function getFeaturedTools(): ToolManifest[] {
  return ALL_TOOLS.filter((t) => t.featured && t.visibility !== 'hidden');
}

/** Get all public and beta tools */
export function getPublicTools(): ToolManifest[] {
  return ALL_TOOLS.filter((t) => t.visibility === 'public' || t.visibility === 'beta');
}

/** Get tools grouped by category (public + beta only) */
export function getToolsGroupedByCategory(): Map<ToolCategory, ToolManifest[]> {
  const groups = new Map<ToolCategory, ToolManifest[]>();
  for (const tool of getPublicTools()) {
    const list = groups.get(tool.category) ?? [];
    list.push(tool);
    groups.set(tool.category, list);
  }
  return groups;
}

/**
 * Resolve related tools from a tool's relatedTools id array.
 * Returns only tools that exist in the registry.
 */
export function getRelatedTools(toolId: string): ToolManifest[] {
  const tool = getToolById(toolId);
  if (!tool?.relatedTools?.length) return [];
  return tool.relatedTools
    .map((id) => getToolById(id))
    .filter((t): t is ToolManifest => t !== undefined);
}

/**
 * Search capabilities by query string (id, name, description, tags, category).
 * Case-insensitive, returns tools sorted by relevance score.
 */
export function searchTools(query: string): ToolManifest[] {
  const q = query.toLowerCase().trim();
  if (!q) return getPublicTools();

  return getPublicTools()
    .map((tool) => {
      let score = 0;
      if (tool.name.toLowerCase().includes(q)) score += 10;
      if (tool.id.includes(q)) score += 8;
      if (tool.description.toLowerCase().includes(q)) score += 5;
      if (tool.tags.some((tag) => tag.includes(q))) score += 3;
      if (tool.category.includes(q)) score += 2;
      return { tool, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ tool }) => tool);
}

/** All distinct categories that have at least one public tool */
export function getActiveCategories(): ToolCategory[] {
  return [...new Set(getPublicTools().map((t) => t.category))];
}

/** Get all tools that expose a given interface surface */
export function getToolsByInterface(surface: keyof ToolManifest['interfaces']): ToolManifest[] {
  return getPublicTools().filter((t) => t.interfaces[surface] === true);
}
