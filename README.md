# Toolbox

A scalable monorepo of reusable utilities, calculators, converters, and productivity tools.

Every tool exposes the same interface: **TypeScript functions → REST API → Web UI → CLI**.  
Business logic is written once and consumed everywhere.

## Repository Structure

```
toolbox/
├── apps/
│   └── web/              # Next.js 15 App Router (auto-discovers tools from registry)
├── packages/
│   ├── shared/           # Types, Result<T>, formatters, math helpers, Zod schemas
│   ├── finance/          # Loan, EMI, SIP, Compound Interest, GST calculators
│   ├── utilities/        # Unit Converter
│   ├── developer/        # Password Generator, UUID Generator
│   └── registry/         # Central tool registry — single source of truth
├── api/                  # Express REST API (thin wrappers around package functions)
└── cli/                  # Commander CLI (thin wrappers around package functions)
```

## Quick Start

```bash
# Install all dependencies
npm install

# Run everything in parallel (web + api)
npm run dev

# Run all tests
npm test

# Build everything
npm run build
```

## Tools (10)

| Tool | Category | Package |
|------|----------|---------|
| Loan Calculator | finance | `@toolbox/finance` |
| Reverse Loan Calculator | finance | `@toolbox/finance` |
| Prepayment Simulation | finance | `@toolbox/finance` |
| EMI Calculator | finance | `@toolbox/finance` |
| SIP Calculator | finance | `@toolbox/finance` |
| Compound Interest | finance | `@toolbox/finance` |
| GST Calculator | finance | `@toolbox/finance` |
| Unit Converter | utilities | `@toolbox/utilities` |
| Password Generator | developer | `@toolbox/developer` |
| UUID Generator | developer | `@toolbox/developer` |

## Architecture Principles

1. **Business logic never lives in React components** — all calculations are pure functions in packages.
2. **APIs are thin wrappers** — `api/` does no computation, it only routes + validates.
3. **Registry is the single source of truth** — navigation, search, sitemaps, and API docs all derive from `@toolbox/registry`.
4. **Every tool has a manifest** — `manifest.ts` contains id, slug, name, category, tags, inputs, outputs, examples.
5. **Result<T> pattern** — no throwing, all functions return `{ success: true, data } | { success: false, error }`.
6. **Zod for all validation** — shared schemas in `@toolbox/shared`.

## Adding a New Tool

See [TOOL_CREATION_GUIDE.md](./TOOL_CREATION_GUIDE.md) for the step-by-step guide.

**Minimal steps:**
1. Create `packages/<category>/src/<tool-name>/` with `index.ts`, `schema.ts`, `manifest.ts`, `index.test.ts`
2. Export the Capability object and manifest from `packages/<category>/src/index.ts`
3. Add a `TOOL_ENTRIES` entry in `packages/registry/src/index.ts` — import the Capability object and manifest, then add `{ manifest, capability }` to the array
4. (Optional) Add API route in `api/src/routes/<category>.ts`
5. (Optional) Add web page in `apps/web/src/app/<category>/<tool-name>/page.tsx`

## Package Dependency Graph

```
@toolbox/shared          (no internal deps)
@toolbox/finance         → @toolbox/shared
@toolbox/utilities       → @toolbox/shared
@toolbox/developer       → @toolbox/shared
@toolbox/registry        → @toolbox/shared + all tool packages
api                      → all packages + @toolbox/registry
cli                      → all packages + @toolbox/registry
apps/web                 → all packages + @toolbox/registry
```

## Tech Stack

- **Monorepo**: npm workspaces + Turborepo
- **Language**: TypeScript 5 (strict)
- **Validation**: Zod 3
- **Testing**: Vitest
- **API**: Express 4
- **Web**: Next.js 15 App Router
- **CLI**: Commander 12 + Chalk 5
- **Build**: tsup (ESM + CJS dual output)

## License

MIT
