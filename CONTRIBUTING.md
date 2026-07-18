# Contributing to Toolbox

Thank you for your interest in contributing. Toolbox is an open-source computational platform and every contribution — from bug fixes to entirely new capabilities — is welcome.

---

## Table of Contents

1. [Architecture overview](#architecture-overview)
2. [Development setup](#development-setup)
3. [Branching strategy](#branching-strategy)
4. [Adding a new capability](#adding-a-new-capability)
5. [Modifying an existing capability](#modifying-an-existing-capability)
6. [Running tests](#running-tests)
7. [Commit conventions](#commit-conventions)
8. [Opening a pull request](#opening-a-pull-request)
9. [Code style](#code-style)
10. [Release process](#release-process)

---

## Architecture overview

Toolbox is a **monorepo** built on npm workspaces and Turborepo.

```
toolbox/
├── packages/
│   ├── shared/      — shared types, schemas, formatting utilities
│   ├── registry/    — single source of truth for all registered tools
│   ├── finance/     — finance domain capabilities
│   ├── utilities/   — unit converters and general-purpose tools
│   ├── developer/   — developer productivity tools
│   └── sdk/         — typed client SDK
├── apps/
│   └── web/         — Next.js web application
├── api/             — Express REST API server
└── cli/             — Commander.js CLI
```

**The invariant that must never be violated:**

```
UI (web/api/cli/sdk) → registry → packages → shared
```

- Business logic lives **only** in `packages/`.
- `apps/web`, `api/`, `cli/`, and `packages/sdk` are thin consumers — they call capabilities, they do not contain calculation logic.
- The registry (`packages/registry`) is the single source of truth. Every tool must be registered there.

---

## Development setup

### Prerequisites

- **Node.js ≥ 22** (see `engines` field in `package.json`)
- **npm ≥ 10** (workspaces support)

### First-time setup

```bash
git clone https://github.com/jeyadheepv/toolbox.git
cd toolbox
npm install
```

### Development commands

| Command | What it does |
|---|---|
| `npm run build` | Build all packages (Turborepo, cached) |
| `npm test` | Run all tests across packages |
| `npm run typecheck` | TypeScript type check across all packages |
| `npm run lint` | ESLint across all packages |
| `npm run check:registry` | Validate all manifests conform to `ToolManifest` schema |

Run all checks before opening a PR:

```bash
npm run build && npm run typecheck && npm run lint && npm test
```

---

## Branching strategy

| Branch | Purpose |
|---|---|
| `main` | Production only — never commit directly |
| `develop` | Integration branch — all features merge here first |
| `feature/*` | New capabilities, improvements, bug fixes |
| `hotfix/*` | Emergency fixes branched from `main`, merged back to both `main` and `develop` |

**Workflow for a new feature:**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# ... implement and commit ...

git push -u origin feature/your-feature-name
# Open a PR targeting develop
```

After the PR merges, delete the branch both locally and remotely.

---

## Adding a new capability

All new capabilities follow the same six-step pattern. Use the loan calculator as a reference implementation.

### Step 1 — Create the package directory

Place new capabilities in the appropriate package:

```
packages/finance/src/my-tool/
├── schema.ts        — Zod input/output schemas and TypeScript types
├── index.ts         — calculateXxx() function + XxxCalculator Capability object
├── manifest.ts      — ToolManifest metadata
└── my-tool.test.ts  — unit tests
```

### Step 2 — Write the schema (`schema.ts`)

```ts
import { z } from 'zod';
import { positiveNumberSchema } from '@toolbox/shared';

export const MyToolInputSchema = z.object({
  value: positiveNumberSchema.describe('Input description'),
});

export const MyToolOutputSchema = z.object({
  result: z.number().describe('Output description'),
});

export type MyToolInput = z.infer<typeof MyToolInputSchema>;
export type MyToolOutput = z.infer<typeof MyToolOutputSchema>;
```

### Step 3 — Implement the capability (`index.ts`)

```ts
import { MyToolInputSchema } from './schema.js';
import type { MyToolInput, MyToolOutput } from './schema.js';
import type { Result, Capability } from '@toolbox/shared';
import { myToolManifest } from './manifest.js';

export type { MyToolInput, MyToolOutput } from './schema.js';

export function calculateMyTool(input: MyToolInput): Result<MyToolOutput> {
  const parsed = MyToolInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: 'INVALID_INPUT', message: parsed.error.issues[0].message } };
  }
  const { value } = parsed.data;
  return { success: true, data: { result: value * 2 } };
}

export const MyToolCalculator: Capability<MyToolInput, MyToolOutput> = {
  manifest: myToolManifest,
  async execute(input) { return calculateMyTool(input); },
};
```

### Step 4 — Write the manifest (`manifest.ts`)

```ts
import type { ToolManifest } from '@toolbox/shared';

export const myToolManifest: ToolManifest = {
  id: 'my-tool',
  slug: 'my-tool',
  name: 'My Tool',
  category: 'utilities',
  tags: ['example'],
  description: 'One sentence description.',
  icon: '🔧',
  version: '1.0.0',
  packageName: '@toolbox/utilities',
  route: '/utilities/my-tool',
  apiEndpoint: '/api/v1/tools/my-tool',
  visibility: 'public',
  featured: false,
  experimental: false,
  requiresAuth: false,
  complexity: 'O(1)',
  interfaces: { api: true, cli: true, web: true, mcp: true, npm: true },
  inputs: [{ name: 'value', label: 'Value', type: 'number' }],
  outputs: [{ name: 'result', label: 'Result', type: 'number' }],
  examples: [
    { label: 'Basic example', input: { value: 5 }, output: { result: 10 } },
  ],
};
```

### Step 5 — Register in the registry

Open `packages/registry/src/index.ts` and add **one entry** to `TOOL_ENTRIES`:

```ts
import { myToolManifest, MyToolCalculator } from '@toolbox/utilities';

const TOOL_ENTRIES = [
  // ... existing entries ...
  { manifest: myToolManifest, capability: MyToolCalculator as Capability },
];
```

This single addition makes the tool available to the web, API, CLI, and SDK automatically.

### Step 6 — Write a web page (if `interfaces.web: true`)

Create `apps/web/src/app/<category>/my-tool/page.tsx` following the controlled-input pattern used by existing tools (e.g. `emi-calculator/page.tsx`).

---

## Modifying an existing capability

- Changes to a capability's **calculation logic** belong in `packages/`.
- Changes to **output fields** require updating: schema → capability → manifest outputs → web page → CLI command.
- Never change a public output field name without a major version bump and changelog entry.

---

## Running tests

```bash
# All packages
npm test

# Single package
cd packages/finance && npx vitest run

# Watch mode (during development)
cd packages/finance && npx vitest
```

Tests must cover:
- Happy path for every public function
- All Zod validation error paths (missing fields, out-of-range values)
- Edge cases (zero values, boundary inputs, extreme tenures)

---

## Commit conventions

All commits must follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <description>

feat(finance): add mortgage affordability calculator
fix(api): correct /category/:cat route ordering
docs(contributing): add new capability guide
test(finance): add reverse loan edge case tests
chore(ci): pin setup-node to @v4.4.0
refactor(registry): derive ALL_TOOLS from TOOL_ENTRIES
```

| Type | When to use |
|---|---|
| `feat` | New capability, new output field, new interface surface |
| `fix` | Bug fix in calculation or behaviour |
| `docs` | Documentation only |
| `test` | New or updated tests |
| `chore` | Build, CI, dependency, config changes |
| `refactor` | Code restructuring with no behaviour change |
| `perf` | Performance improvement |

---

## Opening a pull request

1. Branch from `develop` (not `main`)
2. Run the full validation suite: `npm run build && npm run typecheck && npm run lint && npm test`
3. Fill in the PR template completely
4. Target `develop` — PRs targeting `main` will be closed

---

## Code style

- TypeScript strict mode is enabled — no `any` without a comment explaining why
- All public functions return `Result<T>` — never throw
- Formatting utilities live in `@toolbox/shared` — never in UI components
- CSS custom properties only in web — no hardcoded colour values in component files
- No external runtime dependencies in `packages/*` unless absolutely necessary

---

## Release process

Releases are managed through the `develop → main` merge cycle:

1. Features accumulate on `develop`
2. When ready to release, `develop` is merged to `main` via PR
3. The `release.yml` workflow triggers, tags the version, and publishes
4. Semantic versioning: `MAJOR.MINOR.PATCH`
   - `PATCH` — bug fixes only
   - `MINOR` — new capabilities, new output fields (non-breaking)
   - `MAJOR` — breaking changes to public API or calculation outputs

---

## Questions

Open a [Discussion](https://github.com/jeyadheepv/toolbox/discussions) for design questions or ideas. Use [Issues](https://github.com/jeyadheepv/toolbox/issues) for bugs and concrete feature requests.
