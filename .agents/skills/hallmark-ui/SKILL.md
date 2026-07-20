---
name: hallmark-ui
description: >-
  Soft Clay / Hallmark-inspired UI craft for kids edtech (ages 8–11): warm
  palettes, rounded clay cards, readable type, anti-slop AI chrome. Use when
  building or polishing FE screens, landing shells, CMS chrome, or marketing
  moments in AI Kids Creator Academy. Adapted from nutlope/hallmark principles
  for production product UI (not full marketing microsites).
---

# Hallmark-style UI for AI Kids

## When to use

- New student-facing screens (home, world map, lesson, backpack)
- Adult CMS shells that should feel premium but calm (parent/teacher/admin)
- Avoiding generic “AI SaaS neon glassmorphism” slop

## Principles

1. **Warm, human color** — brand purple `#6d5efc`, sky, mint, sun, coral; soft gradients, not neon cyberpunk.
2. **Clay depth** — cards with soft shadows (`shadow-clay`), thick soft borders, press states.
3. **Readable type** — display font for titles (Baloo/Nunito), body ≥16–17px, high contrast.
4. **Kids-first targets** — min touch 44px, big buttons, short Vietnamese copy.
5. **Motion with care** — short fades; honor `prefers-reduced-motion`.
6. **Real assets** — prefer designer pack under `apps/web/public/assets/designer/`; map via `assets.ts`.

## Project tokens

Use CSS variables in `apps/web/src/shared/styles/index.css`:

- `--color-brand-*`, `--color-sky-*`, `--color-mint-*`, `--color-sun-*`, `--color-coral-*`
- Components: `.ui-card`, shared `Button`, `AppShell`

## Checklist before shipping UI

- [ ] No hardcoded production catalog content (load from API)
- [ ] Role-appropriate chrome (student play vs CMS density)
- [ ] Focus visible, contrast WCAG-ish for body text
- [ ] Images have empty alt when decorative; meaningful alt when not
- [ ] Loading and empty states are friendly Vietnamese

## Anti-patterns

- Plastic neon gradients + glass blur everywhere
- Tiny gray text on busy backgrounds
- Stock “robot brain” clichés as only visual language
- Embedding course lists in FE source

## References

- Upstream craft: https://github.com/nutlope/hallmark
- Design tokens live in-repo; keep skills thin and product-specific
