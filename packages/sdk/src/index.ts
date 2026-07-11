/**
 * @toolbox/sdk
 *
 * Unified SDK — single import surface for all toolbox capabilities.
 *
 * Instead of knowing the internal package structure:
 *   import { LoanCalculator } from '@toolbox/finance';
 *   import { UnitConverter } from '@toolbox/utilities';
 *
 * Just use the SDK:
 *   import { LoanCalculator, UnitConverter } from '@toolbox/sdk';
 *
 * Or use dynamic dispatch (no import-time knowledge of tool ids required):
 *   import { registry } from '@toolbox/sdk';
 *   const result = await registry.execute('loan-calculator', { ... });
 *
 * Dependency rule: SDK depends on all tool packages + registry.
 * Nothing in the monorepo depends on SDK (it is a leaf).
 */

// ─── Core types ──────────────────────────────────────────────────────────────
export type {
  Result,
  AsyncResult,
  ToolError,
  ToolManifest,
  Capability,
  ToolCategory,
  ToolVisibility,
  ToolComplexity,
  ToolInterfaces,
  FieldDef,
  PaginationMeta,
  ApiResponse,
} from '@toolbox/shared';

// ─── Registry + dynamic dispatch ─────────────────────────────────────────────
export {
  registry,
  ALL_TOOLS,
  CAPABILITIES,
  getCapability,
  getToolById,
  getToolBySlug,
  getToolsByCategory,
  getFeaturedTools,
  getPublicTools,
  getToolsGroupedByCategory,
  getRelatedTools,
  searchTools,
  getActiveCategories,
  getToolsByInterface,
} from '@toolbox/registry';

// ─── Finance capabilities ─────────────────────────────────────────────────────
export {
  // Capability objects (preferred for SDK consumers)
  LoanCalculator,
  EMICalculator,
  SIPCalculator,
  CompoundInterestCalculator,
  GSTCalculator,
  // Raw functions (available for direct use)
  calculateLoan,
  calculateEMI,
  calculateSIP,
  calculateCompoundInterest,
  calculateGST,
  // Manifests
  loanCalculatorManifest,
  emiCalculatorManifest,
  sipCalculatorManifest,
  compoundInterestManifest,
  gstCalculatorManifest,
} from '@toolbox/finance';

export type {
  LoanInput,
  LoanOutput,
  EMIInput,
  EMIOutput,
  SIPInput,
  SIPOutput,
  CompoundInterestInput,
  CompoundInterestOutput,
  GSTInput,
  GSTOutput,
} from '@toolbox/finance';

// ─── Utilities capabilities ───────────────────────────────────────────────────
export {
  UnitConverter,
  convertUnit,
  unitConverterManifest,
  UNITS,
  UNIT_MAP,
} from '@toolbox/utilities';

export type {
  UnitConverterInput,
  UnitConverterOutput,
  UnitCategory,
  UnitDef,
} from '@toolbox/utilities';

// ─── Developer capabilities ───────────────────────────────────────────────────
export {
  PasswordGenerator,
  UUIDGenerator,
  generatePassword,
  generateUUID,
  passwordGeneratorManifest,
  uuidGeneratorManifest,
} from '@toolbox/developer';

export type {
  PasswordInput,
  PasswordOutput,
  UUIDInput,
  UUIDOutput,
} from '@toolbox/developer';
