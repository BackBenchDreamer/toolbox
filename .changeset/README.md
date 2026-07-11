# Changesets

This directory is managed by [Changesets](https://github.com/changesets/changesets).

## How to create a changeset

```bash
npx changeset
```

You will be prompted to:
1. Select which packages are affected
2. Choose a bump type — `major`, `minor`, or `patch`
3. Write a short description of what changed

This creates a temporary file under `.changeset/`. Commit it alongside your code changes.

## How versioning works

| Change type | When to use                                                |
|-------------|-----------------------------------------------------------|
| `patch`     | Bug fixes, documentation only, no public API changes      |
| `minor`     | New backwards-compatible features, new tools              |
| `major`     | Breaking changes to inputs/outputs or public API          |

## Release flow

Changesets are consumed during a release:

```bash
# Preview what will change
npx changeset version --dry-run

# Apply versions and generate CHANGELOG.md for each package
npx changeset version

# Publish all bumped packages to npm
npx changeset publish
```

The CI `release` workflow handles this automatically on `main` merges via the
Changesets GitHub Action.

## Package versioning principles

- `@toolbox/shared` bumps require a coordinated bump in all consumers
- `@toolbox/sdk` should mirror the highest version of any package it re-exports
- Tool packages (`@toolbox/finance`, `@toolbox/utilities`, `@toolbox/developer`) version independently
- `@toolbox/registry` follows `@toolbox/shared` versioning
- Patch bumps for tool additions; minor for new outputs or inputs; major for breaking schema changes
