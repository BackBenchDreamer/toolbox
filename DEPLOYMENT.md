# Domain Configuration Guide

This document explains how to configure custom domains for the Toolbox platform
once DNS access is available.

## Target domains

| Domain | Purpose | DNS record type |
|--------|---------|----------------|
| `toolbox.jeyv.in` | Web application (Next.js on Vercel) | CNAME |
| `api.toolbox.jeyv.in` | REST API server (standalone Node.js — future) | A / CNAME |

---

## `toolbox.jeyv.in` → Vercel (web app)

The web application is deployed on Vercel at:

```
https://toolbox-woad-chi.vercel.app
```

### Step 1 — Add the domain in Vercel

```bash
vercel domains add toolbox.jeyv.in --yes
```

Or via the Vercel dashboard:
1. Open https://vercel.com/jeyadheep-vs-projects/toolbox
2. Settings → Domains → Add `toolbox.jeyv.in`

### Step 2 — Create the DNS record

In your DNS provider (wherever `jeyv.in` is managed), add:

```
Type:  CNAME
Name:  toolbox
Value: cname.vercel-dns.com.
TTL:   300
```

If your DNS provider does not allow a CNAME at the apex (`jeyv.in`), use an
ALIAS or ANAME record pointing to `alias.vercel-dns.com`.

### Step 3 — Verify

Vercel will automatically provision a TLS certificate via Let's Encrypt once
DNS propagates (typically < 5 minutes for low-TTL records).

```bash
curl -sI https://toolbox.jeyv.in | head -5
```

---

## `api.toolbox.jeyv.in` → API server (future)

The REST API (`api/`) is a standalone Express server, not currently deployed.
When deployed, add:

```
Type:  A (or CNAME)
Name:  api.toolbox
Value: <server IP or CNAME target>
TTL:   300
```

### If deployed on Railway / Render / Fly.io

Each platform provides a CNAME alias. Add a CNAME record pointing
`api.toolbox.jeyv.in` to the platform-provided hostname.

### If self-hosted on a VPS

Use an A record pointing to the server's public IPv4 address.
Configure nginx or caddy as a reverse proxy to port 3001.

---

## No changes needed in this repository

The `vercel.json` at the repository root already contains all required
build and deployment configuration. No environment variables are required
for the Next.js web application — all computation runs client-side using
pre-built package functions bundled into the Next.js output.

---

## Environment variables (for future API deployment)

When deploying the API server, set:

```bash
PORT=3001
NODE_ENV=production
```

No secrets are required — the API performs only stateless calculations.

---

## Vercel project details

| Field | Value |
|-------|-------|
| Project URL | https://toolbox-woad-chi.vercel.app |
| Vercel project | jeyadheep-vs-projects/toolbox |
| Region | bom1 (Mumbai) |
| Framework | Next.js 15 App Router |
| Node version | 22 (per engines field) |
| Build command | `npm run build` (turbo → all packages + Next.js) |
| Output directory | `apps/web/.next` |
