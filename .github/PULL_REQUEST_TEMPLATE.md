## What type of change is this?

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New tool (new Capability, manifest, schema, tests)
- [ ] 🔨 Improvement to an existing tool
- [ ] 🏗️ Infrastructure / tooling
- [ ] 📖 Documentation only
- [ ] 🚨 Breaking change (changes public API or calculation outputs)

---

## Description

<!-- A clear, concise description of what this PR does. -->

## Related issues

<!-- Closes #NNN -->

---

## Checklist

### All PRs

- [ ] I ran `npm test` locally and all tests pass
- [ ] I ran `npm run typecheck` — no TypeScript errors
- [ ] I ran `npm run lint` — no lint errors

### New or modified tools

- [ ] `manifest.ts` is complete (all required fields present — `npm run check:registry` passes)
- [ ] `schema.ts` validates all inputs with Zod
- [ ] `index.ts` exports both the raw function **and** a `Capability` object
- [ ] Unit tests cover: happy path, edge cases, invalid inputs
- [ ] A changeset has been created (`npm run changeset`)
- [ ] `README.md` is present or updated in the tool directory

### Breaking changes

- [ ] I updated `CHANGELOG.md` or created a changeset with `major` bump
- [ ] Downstream consumers (api, cli, web, sdk) have been updated

---

## Test summary

<!-- Paste the vitest output here, or note which packages were affected -->

```
packages/finance: 18 passed
```

---

## Screenshots (web UI changes only)

<!-- Delete this section if not applicable -->
