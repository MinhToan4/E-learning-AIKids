---
name: aikids-security-rbac
description: >-
  OWASP-aligned frontend trust boundaries for AI Kids auth, role-aware routes,
  child privacy, browser storage and StoryMee Hub requests.
---

# Frontend security

- Browser code and every `VITE_*` value are public; never add secrets.
- Send requests only through StoryMee Hub and the shared API client.
- Route guards improve UX but never replace backend role and ownership checks.
- Never log or render access tokens, passwords, child PINs or sensitive API
  bodies.
- Do not persist learner data beyond the session unless explicitly designed;
  clear offline data when device ownership changes.
- Preserve CSP, HTTPS production origins and least-privilege Firebase use.
- Sanitize untrusted URLs and never inject HTML from API data.
- Student UI exposes nickname/avatar only; parent data must not cross families.

For auth contract changes, verify 401/403 behavior and the owning core-account
service. FE must fail closed when access context or age policy cannot load.
