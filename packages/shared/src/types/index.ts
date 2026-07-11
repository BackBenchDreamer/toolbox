/**
 * Core result type — every capability returns this to avoid throwing.
 *
 * All tool functions return Promise<Result<T>> — even synchronous ones.
 * This future-proofs for tools that need to fetch external data (rates, APIs, AI).
 */
export type Result<T, E = ToolError> =
  | { success: true; data: T }
  | { success: false; error: E };

/** Async variant — all public tool functions use this signature */
export type AsyncResult<T, E = ToolError> = Promise<Result<T, E>>;

/**
 * Structured error type used across all tools.
 */
export interface ToolError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Tool category identifiers.
 * Extend this union as new domains are added — never remove existing values.
 */
export type ToolCategory =
  | 'finance'
  | 'engineering'
  | 'developer'
  | 'utilities'
  | 'productivity'
  | 'converters'
  | 'ai'
  | 'text'
  | 'graphics'
  | 'networking'
  | 'system';

/**
 * Tool visibility — controls whether a capability appears in public UI.
 */
export type ToolVisibility = 'public' | 'hidden' | 'beta' | 'deprecated';

/**
 * Complexity classification — used for UI indicators and benchmarking context.
 */
export type ToolComplexity = 'O(1)' | 'O(n)' | 'O(n log n)' | 'O(n^2)' | 'async';

/**
 * Supported interface surfaces — which consumers this capability supports.
 */
export interface ToolInterfaces {
  api: boolean;
  cli: boolean;
  web: boolean;
  mcp: boolean;
  npm: boolean;
}

/**
 * Field definition for tool manifest inputs/outputs.
 * Used for auto-generating documentation, OpenAPI schemas, and UI forms.
 */
export interface FieldDef {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'enum' | 'array' | 'object';
  description?: string;
  unit?: string;
  optional?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
}

/**
 * Canonical tool manifest shape — the single source of truth for each capability.
 *
 * Rule: outputs must always contain raw numeric/boolean/string values.
 * Formatting (currency symbols, locale strings) belongs in the UI layer, never here.
 *
 * Every tool package must export a default manifest conforming to this type.
 */
export interface ToolManifest {
  // Identity
  id: string;
  slug: string;
  name: string;

  // Classification
  category: ToolCategory;
  tags: string[];
  description: string;
  longDescription?: string;
  icon: string;

  // Versioning
  version: string;
  packageName: string;
  deprecatedSince?: string;

  // Navigation
  route: string;
  apiEndpoint: string;

  // Visibility & discoverability
  visibility: ToolVisibility;
  featured: boolean;
  experimental: boolean;

  // Interface support flags
  interfaces: ToolInterfaces;

  // Performance characteristics
  complexity: ToolComplexity;
  /** Rough expected execution time in ms (used by benchmark suite) */
  estimatedMs?: number;
  requiresAuth: boolean;

  // Schema
  inputs: FieldDef[];
  outputs: FieldDef[];

  // Discovery helpers
  relatedTools?: string[];          // array of tool IDs
  documentationUrl?: string;
  githubPath?: string;

  // Examples and changelog
  examples?: Array<{
    label: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  }>;
  changelog?: Array<{ version: string; date: string; changes: string[] }>;
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/** Standard API response envelope — wraps every REST response */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ToolError;
  meta?: Record<string, unknown>;
}
