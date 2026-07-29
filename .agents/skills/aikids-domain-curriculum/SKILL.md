---
name: aikids-domain-curriculum
description: >-
  UI constraints for AI Kids learning journeys, child-safe creation and parent
  visibility. Use when changing lesson, course, progress or creative screens.
---

# Learning experience boundaries

- Learning flow: learn → practice → check.
- Catalog, enrollment, unlock state and progress come from core-lms-api via Hub.
- FE must not create a second catalog or authorization source of truth.
- Client-only creation helpers live in `shared/lib/creation`.
- Student identity uses nickname/avatar; do not request email or phone.
- Free-form child input must be validated by the owning backend.
- Portfolio stays private until parent approval.
- Leaderboards are class-scoped, never global public.

When a required backend field/endpoint is missing, update the documented
gateway contract or the owning core service; do not restore a local API or
hardcode production data in FE.
