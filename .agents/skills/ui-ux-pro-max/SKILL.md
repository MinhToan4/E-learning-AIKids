---
name: ui-ux-pro-max
description: >-
  UI/UX professional checklist for layout, hierarchy, spacing, states, and
  accessibility when building React+Vite screens for AI Kids. Adapted from
  nextlevelbuilder/ui-ux-pro-max-skill for this monorepo.
---

# UI/UX Pro Max (AI Kids)

## Required source of truth

Read `../../../docs/UI_DESIGN_SYSTEM.md` in full before changing `apps/web`.
Use it as the authoritative production checklist, especially for the three
role-specific icon families and the rule that a page-level request must not
silently redesign global navigation or unrelated roles.

## When to use

- Building or reviewing any `apps/web` feature page
- CMS tables, forms, dashboards for admin/teacher/parent
- Fixing “looks unfinished” or inconsistent spacing

## Layout rules

1. **Hierarchy** — one H1 (`font-display`), supporting muted subtitle, primary CTA.
2. **Spacing scale** — gap-3/4/5; avoid one-off pixel soup.
3. **Grids** — mobile first; `sm:` / `lg:` columns for cards and CMS split panes.
4. **Density** — student UI airy; CMS denser but still ≥44px controls.
5. **Feedback** — success mint, danger coral, never silent failures.

## Interaction states

Every interactive control needs:

- default · hover · active/press · focus-visible · disabled · loading

## Forms (CMS)

- Label above field, bold
- Validate with API errors shown in-role
- Lecture **video URL** field always visible when editing lectures
- Never store secrets in client code

## Accessibility

- Semantic headings and buttons (not clickable divs)
- `role="alert"` for errors
- Keyboard path for tabs and tables
- Reduced motion respected in CSS

## Checklist

- [ ] Visual scan at 375px and 1280px
- [ ] Empty / loading / error / success covered
- [ ] Role guard redirects adults away from student routes
- [ ] No Lorem ipsum left in product paths

## References

- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Pair with `hallmark-ui` for kids visual voice
