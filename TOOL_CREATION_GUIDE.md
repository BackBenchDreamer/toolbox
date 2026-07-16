# Adding a New Tool to Toolbox

This guide walks through adding a new tool end-to-end.
The goal: **touch as few existing files as possible**.

---

## 1. Create the Package Module

Create a directory inside the appropriate package:

```
packages/<category>/src/<tool-slug>/
  index.ts       ← calculation function(s) + re-exported types
  schema.ts      ← Zod input/output schemas + TypeScript types
  manifest.ts    ← ToolManifest (id, name, category, tags, inputs, outputs…)
  index.test.ts  ← vitest unit tests
```

### `index.ts` pattern

```ts
import { ok, err, ErrorCode } from '@toolbox/shared';
import type { Result, Capability } from '@toolbox/shared';
import { MyInputSchema } from './schema.js';
import type { MyInput, MyOutput } from './schema.js';
import manifest from './manifest.js';
export type { MyInput, MyOutput } from './schema.js';

export function myTool(input: MyInput): Result<MyOutput> {
  const parsed = MyInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: ErrorCode.VALIDATION_ERROR, message: '...' });
  }
  // pure calculation — no side effects, no UI framework imports
  return ok({ /* result fields */ });
}

export const MyToolCapability: Capability<MyInput, MyOutput> = {
  manifest,
  execute: (input) => Promise.resolve(myTool(input)),
};
```

### `manifest.ts` pattern

```ts
import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'my-tool',
  slug: 'my-tool',
  name: 'My Tool',
  category: 'finance',            // or utilities / developer / engineering / etc.
  tags: ['keyword1', 'keyword2'],
  description: 'One-line description.',
  icon: 'Wrench',                 // any string — used in UI
  version: '0.1.0',
  packageName: '@toolbox/<category>',
  route: '/<category>/my-tool',
  apiEndpoint: '/api/<category>/my-tool',
  visibility: 'public',           // public | hidden | beta | deprecated
  featured: false,
  inputs: [
    { name: 'amount', label: 'Amount', type: 'number', unit: '₹' },
  ],
  outputs: [
    { name: 'result', label: 'Result', type: 'number', unit: '₹' },
  ],
  examples: [
    { label: 'Basic', input: { amount: 1000 }, output: { result: 1100 } },
  ],
  changelog: [{ version: '0.1.0', date: 'YYYY-MM-DD', changes: ['Initial release'] }],
};

export default manifest;
```

---

## 2. Export from the Package Barrel

In `packages/<category>/src/index.ts`, add:

```ts
export * from './<tool-slug>/index.js';
export { default as myToolManifest } from './<tool-slug>/manifest.js';
// Export the Capability object so the registry and SDK can import it by name
export { MyToolCapability } from './<tool-slug>/index.js';
```

---

## 3. Register in the Registry

In `packages/registry/src/index.ts`, add ONE entry to `TOOL_ENTRIES`:

```ts
import { myToolManifest, MyToolCapability } from '@toolbox/<category>';

const TOOL_ENTRIES = [
  // ... existing entries ...
  { manifest: myToolManifest, capability: MyToolCapability as Capability },
];
```

`ALL_TOOLS` and `CAPABILITIES` are derived from `TOOL_ENTRIES` automatically.
Homepage, search, sitemap, and `registry.execute()` all update without further changes.

---

## 4. (Optional) Add an API Route

In `api/src/routes/<category>.ts`:

```ts
import { MyToolCapability } from '@toolbox/<category>';

router.post('/my-tool', (req, res) => {
  void asyncSendResult(res, MyToolCapability.execute(req.body));
});
```

---

## 5. (Optional) Add a Web Page

Create `apps/web/src/app/<category>/<tool-slug>/page.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { myTool } from '@toolbox/<category>';
import { ToolLayout } from '@/components/ToolLayout';
import myToolManifest from '@toolbox/<category>/<tool-slug>';

export default function MyToolPage() {
  const [result, setResult] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const r = myTool({ /* parse fd */ });
    if (r.success) setResult(r.data);
  }

  return (
    <ToolLayout manifest={myToolManifest}>
      <form onSubmit={handleSubmit}>
        {/* inputs */}
      </form>
      {result && <div className="result-box">{/* outputs */}</div>}
    </ToolLayout>
  );
}
```

---

## Checklist

- [ ] `index.ts` — pure calculation function returns `Result<T>`, Capability object exported
- [ ] `schema.ts` — Zod schemas, exported TypeScript types
- [ ] `manifest.ts` — complete `ToolManifest` with inputs/outputs/examples
- [ ] `index.test.ts` — happy path + edge cases + invalid input tests
- [ ] Capability object and manifest exported from package `index.ts`
- [ ] Entry added to `TOOL_ENTRIES` in `packages/registry/src/index.ts`
- [ ] Capability added to `packages/sdk/src/index.ts` exports
- [ ] (Optional) API route uses `Capability.execute()` via `asyncSendResult`
- [ ] (Optional) Web page added
