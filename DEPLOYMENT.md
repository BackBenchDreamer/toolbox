# Deployment Guide

Current deployment topology for the Toolbox platform.

---

## Live environments

| Environment | URL | Service |
|---|---|---|
| Web (production) | https://toolbox-woad-chi.vercel.app | Vercel |
| Web (custom domain — pending DNS) | https://toolbox.jeyv.in | Vercel |
| API | Not publicly deployed | — |

---

## Web application — Vercel

The Next.js web application is deployed automatically on every push to `main`.

### Vercel project details

| Field | Value |
|---|---|
| Project | jeyadheep-vs-projects/toolbox |
| Framework | Next.js 15 App Router |
| Node version | 22 (matches `engines` in `package.json`) |
| Build command | `npm run build` (Turborepo) |
| Output directory | `apps/web/.next` |
| Region | bom1 (Mumbai) |

### Environment variables

No environment variables are required for the web application.
All computation runs at build time or client-side using pre-bundled capability functions.

### Deploy preview

Every PR automatically receives a Vercel preview URL.
Preview builds use the same Turborepo pipeline — `npm run build` is always the entry point.

---

## Custom domain setup — `toolbox.jeyv.in`

When DNS access to `jeyv.in` is available:

### Step 1 — Add domain in Vercel

```bash
vercel domains add toolbox.jeyv.in --yes
```

Or via Vercel dashboard: Settings → Domains → Add `toolbox.jeyv.in`.

### Step 2 — Create DNS record

```
Type:  CNAME
Name:  toolbox
Value: cname.vercel-dns.com.
TTL:   300
```

If the DNS provider does not support CNAME at the apex, use an `ALIAS` or `ANAME` record pointing to `alias.vercel-dns.com`.

### Step 3 — Verify

Vercel provisions a TLS certificate automatically once DNS propagates.

```bash
curl -sI https://toolbox.jeyv.in | head -5
```

---

## REST API — `api/`

The API server (`api/`) is a standalone Express application built for future deployment.

**Current status:** Not publicly deployed. Runs locally on `http://127.0.0.1:3001`.

### Local development

```bash
cd api
npm run dev     # ts-node-dev hot reload
npm run build   # compile to dist/
npm start       # run compiled output
```

### Future deployment options

The API is stateless and requires no database or persistent storage.

| Platform | DNS config | Notes |
|---|---|---|
| Railway | CNAME to Railway-provided hostname | Easiest — zero config |
| Render | CNAME to Render hostname | Free tier available |
| Fly.io | A record to Fly IPv4 | Best for low-latency |
| VPS | A record to server IP, nginx reverse proxy | Full control |

### Target domain

```
api.toolbox.jeyv.in
```

DNS record (once server is deployed):

```
Type:  CNAME (or A)
Name:  api.toolbox
Value: <platform hostname or IP>
TTL:   300
```

### Environment variables

```bash
PORT=3001
NODE_ENV=production
API_BASE_URL=https://api.toolbox.jeyv.in  # controls OpenAPI server URL
```

No secrets are required — the API performs only stateless calculations.

---

## CI/CD — GitHub Actions

All CI runs on `main` and `develop` pushes and on PRs to either branch.

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | Push/PR to `main`/`develop` | Build, typecheck, lint, test, registry check |
| `release.yml` | Push to `main` | Tags version, creates GitHub Release |
| `benchmark.yml` | Push/PR to `main`/`develop` | Runs performance benchmarks, fails on ≥15% regression |

### Release workflow

1. Features merge to `develop` via PRs
2. `develop` is merged to `main` via a release PR
3. `release.yml` fires on the `main` push, creates a GitHub Release with auto-generated changelog

---

## Turborepo caching

The build pipeline uses Turborepo's local filesystem cache.
Subsequent builds skip tasks whose inputs have not changed.

Remote caching (Vercel Remote Cache or Turborepo Cloud) can be enabled by adding:

```bash
TURBO_TOKEN=<your-token>
TURBO_TEAM=<your-team>
```

as repository secrets in GitHub Actions.

---

## No required secrets

The current setup requires **no repository secrets** to build and deploy.
Future secrets (when needed):

| Secret | When needed |
|---|---|
| `TURBO_TOKEN` | Remote cache (optional performance improvement) |
| `NPM_TOKEN` | Publishing SDK to npm registry |
