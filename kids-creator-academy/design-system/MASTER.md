# AI Kids Creator Academy — Design System Master

> Source of truth for visual design. Aligned with product spec + UI UX Pro Max (Claymorphism / Soft UI for children's education).

## Product context

- **Type:** Quest-based creative EdTech for ages 8–11
- **Language:** Vietnamese (vi-VN)
- **Tone:** Warm, playful, trustworthy — not babyish, not neon cyberpunk, not corporate dashboard

## UX rules (8–11, research-backed)

- One primary action per screen (large CTA “Làm tiếp / Bắt đầu ngay”)
- Max 4 student nav items: Nhà · Làm tiếp · Ba lô · Tôi
- Short Vietnamese sentences; no public leaderboard; no shame language
- Login: child avatar/nickname demo; adult PIN — no child email (COPPA pattern)
- Motion: transform/opacity only, ~150–280ms; respect prefers-reduced-motion
- Touch ≥ 48px; no hover-only critical actions

## Skills applied

- ui-ux-pro-max (Clay/Soft UI, a11y, anti AI-purple-neon)
- brand / design-system tokens (MASTER + CSS @theme)
- Product curriculum scaffolded for AI literacy + creative product

## Style

**Primary style:** Soft Clay UI Evolution

- Soft layered shadows (clay depth, not harsh drop shadows)
- Large rounded corners (cards 20–24px, buttons 14–18px)
- Tactile, inviting surfaces
- Soft pastel accent chips on calm light background
- Lucide SVG icons with labels (no emoji icons in chrome)

### Anti-patterns (never)

- AI purple/pink neon gradients as full-page backgrounds
- Glassmorphism on primary content
- Plastic “generic AI SaaS” look
- Infinite bounce / confetti spam
- Icon-only critical actions
- Dark patterns, streaks, leaderboards

## Color tokens

| Token | Value | Use |
|-------|-------|-----|
| brand-500 | `#6C5CE7` | Primary actions, focus accents |
| brand-600 | `#5947D6` | Pressed / strong brand |
| sky-400 | `#45C4F9` | World / info accents |
| mint-400 | `#58D8A3` | Success, complete |
| sun-400 | `#FFD166` | Rewards, highlights |
| coral-400 | `#FF7A90` | Soft attention (not danger-only) |
| bg | `#F7F8FC` | App background |
| surface | `#FFFFFF` | Cards, panels |
| text | `#24304A` | Body text |
| muted | `#667085` | Secondary text |
| border | `#D9DEEA` | Dividers |
| success | `#1F9D6A` | Success states |
| warning | `#B7791F` | Warnings |
| danger | `#C24156` | Errors (with icon + text) |
| focus | `#1D4ED8` | Focus ring |

## Typography

- **UI / body:** Nunito (Google Fonts) — rounded, soft, full Vietnamese
- **Display / titles:** Baloo 2 — playful “bubble” headings for ages 8–11
- Body 16–18px, buttons 16px semibold, H1 32–40px
- Line-height 1.4–1.6
- Full Vietnamese support
- No all-caps body text, no script fonts for main content

## Spacing scale

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

## Motion

- Micro: 150–240ms
- Quest complete: 600–1000ms
- Respect `prefers-reduced-motion`
- Skip animation always available for long sequences

## Touch & a11y

- Primary targets ≥ 48px
- Drag targets ≥ 56×56
- Focus visible rings
- WCAG 2.2 AA contrast
- Keyboard alternatives for every drag/drop

## Layout

### Student desktop ≥1200

Sidebar 72–88px + main + optional helper 280–320px

### Tablet 768–1199

Bottom nav (max 5) + helper drawer

### Mobile <768

World / quest / portfolio; editors show tablet advice

## Mascot

**Robot Mực Màu** — original friendly ink-squid robot illustrator. No third-party IP.
