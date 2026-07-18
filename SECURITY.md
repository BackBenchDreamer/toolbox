# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| latest (`main`) | ✅ |
| older releases | ❌ |

Toolbox is under active development. Only the current release receives security fixes.

---

## Reporting a vulnerability

**Do not open a public GitHub Issue for security vulnerabilities.**

Report vulnerabilities privately via one of these channels:

1. **GitHub Security Advisories** — [Report a vulnerability](https://github.com/jeyadheepv/toolbox/security/advisories/new) (preferred)
2. **Email** — contact via the profile linked at https://jeyv.in

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested remediation (if any)

### Response timeline

| Action | Timeline |
|---|---|
| Acknowledge receipt | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix or mitigation | Depends on severity — critical issues are prioritised immediately |

---

## Scope

Toolbox performs **stateless, offline computation** — no user data is stored, no database is used, and no credentials are processed.

The primary attack surface is:

- **Input validation** — all inputs are validated with Zod schemas before any computation
- **Dependency supply chain** — third-party packages in `node_modules`
- **API server** — the Express REST API, when deployed

### Out of scope

The following are not in scope for the security programme:

- Bugs with no security impact (use GitHub Issues instead)
- Vulnerabilities in tools and libraries not maintained by this project
- Reports about missing security headers on third-party hosting platforms (Vercel)
- Denial of service via excessively large valid inputs (rate limiting is implemented at the API layer)

---

## Dependency security

Dependencies are monitored by:

- **Dependabot** — automatic PRs for dependency updates (see `.github/dependabot.yml`)
- **npm audit** — run `npm audit` locally at any time

Please report newly discovered CVEs in our dependencies via the private channel above rather than opening a public issue.
