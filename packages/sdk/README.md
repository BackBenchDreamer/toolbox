# @toolbox/sdk

> Unified entry point for all toolbox capabilities — one import, every tool.

Instead of tracking which tool lives in which internal package, just use the SDK:

```ts
import { LoanCalculator, UnitConverter, registry } from '@toolbox/sdk';
```

---

## Installation

```bash
npm install @toolbox/sdk
```

---

## Usage

### Named imports (compile-time known)

```ts
import { LoanCalculator, UnitConverter, PasswordGenerator } from '@toolbox/sdk';

// Execute with full type safety
const result = await LoanCalculator.execute({
  principal: 5_000_000,
  annualRatePercent: 8.5,
  tenureMonths: 240,
});

if (result.success) {
  console.log(result.data.emi);       // 43391.16
  console.log(result.data.totalInterest); // 5413878.40
}
```

### Dynamic dispatch (runtime id resolution)

Ideal for CLIs, AI agents, MCP tools, and any adapter that resolves tools at runtime.

```ts
import { registry } from '@toolbox/sdk';

// Execute by id — no static import required
const result = await registry.execute('loan-calculator', {
  principal: 5_000_000,
  annualRatePercent: 8.5,
  tenureMonths: 240,
});

// Discover what's available
const ids = registry.list();
// → ['loan-calculator', 'emi-calculator', 'sip-calculator', ...]

// Check before dispatch
if (registry.has('unit-converter')) {
  await registry.execute('unit-converter', { value: 100, from: 'km', to: 'mi' });
}

// Inspect the manifest
const manifest = registry.manifest('gst-calculator');
// → { id: 'gst-calculator', name: 'GST Calculator', inputs: [...], ... }
```

### Raw calculation functions

Every raw function is also re-exported for cases where you don't want the Capability wrapper:

```ts
import { calculateLoan, calculateEMI, convertUnit } from '@toolbox/sdk';

const result = calculateLoan({ principal: 500000, annualRatePercent: 8.5, tenureMonths: 240 });
```

### Search and browse the registry

```ts
import { searchTools, ALL_TOOLS, getToolsByCategory } from '@toolbox/sdk';

searchTools('loan');            // fuzzy search by name/tags/description
getToolsByCategory('finance');  // all finance tools
ALL_TOOLS;                      // the complete registry
```

---

## What's included

| Export | Type | Description |
|--------|------|-------------|
| `registry` | Object | Dynamic dispatch — `execute`, `has`, `list`, `manifest` |
| `ALL_TOOLS` | `ToolManifest[]` | Complete registry array |
| `CAPABILITIES` | `Map<string, Capability>` | All Capability objects by id |
| `LoanCalculator` | `Capability` | Finance — loan repayment |
| `EMICalculator` | `Capability` | Finance — EMI |
| `SIPCalculator` | `Capability` | Finance — SIP future value |
| `CompoundInterestCalculator` | `Capability` | Finance — compound interest |
| `GSTCalculator` | `Capability` | Finance — GST inclusive/exclusive |
| `UnitConverter` | `Capability` | Utilities — unit conversion |
| `PasswordGenerator` | `Capability` | Developer — secure passwords |
| `UUIDGenerator` | `Capability` | Developer — UUID v4/v7 |
| `calculate*`, `convert*`, `generate*` | Functions | Raw calculation functions |
| `ToolManifest`, `Capability`, `Result` | Types | Core shared types |

---

## Error handling

Every `execute()` call returns `AsyncResult<T>` — never throws:

```ts
const result = await registry.execute('loan-calculator', badInput);

if (!result.success) {
  console.error(result.error.code);    // 'VALIDATION_ERROR'
  console.error(result.error.message); // human-readable explanation
}
```

---

## Dependency diagram

```
@toolbox/sdk  (this package — leaf node)
  ├── @toolbox/registry
  ├── @toolbox/finance
  ├── @toolbox/utilities
  ├── @toolbox/developer
  └── @toolbox/shared
```

Nothing in the monorepo depends on `@toolbox/sdk`. It is always a leaf.

---

## Version policy

`@toolbox/sdk` version tracks the highest version of any re-exported package.
A patch bump in `@toolbox/finance` → patch bump in `@toolbox/sdk`.
A breaking change in any dependency → major bump in `@toolbox/sdk`.
