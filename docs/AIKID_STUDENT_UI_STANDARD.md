# AIKid Student UI Standard

## Visual language

- Student surfaces use the original AIKid illustrated backgrounds selected by route.
- Functional navigation artwork uses the generated clay image family in `public/assets/aikid-ui/generated`.
- Do not mix outline SVG navigation icons with clay navigation images in the student shell.
- Utility controls such as close, back, visibility and menu may remain simple vector icons.

## Fixed component grammar

- Main content width: `max-w-6xl`; creative canvas may use `max-w-[1440px]`.
- Page gap: `1.25rem`; section padding: `1.25rem` mobile and `1.5rem` desktop.
- Primary cards: solid white, `1.5px` border, `1.75rem` radius, no glass blur.
- Primary action: coral background, white label, minimum height `44px`.
- Secondary action: white background, visible neutral border, violet label.
- Selected navigation: pale violet container; do not recolor the clay artwork.
- Learning status colors: mint completed, coral current action, violet progress, neutral locked, yellow reward.

## Generated student icon family

| Purpose | Asset |
| --- | --- |
| Home | `home.webp` |
| Learning map | `world.webp` |
| Creative workshop | `creative.webp` |
| Progress | `progress.webp` |
| Event | `event.webp` |
| Storybook | `storybook.webp` |
| Achievement | `badge.webp` |
| Backpack | `backpack.webp` |
| Profile | `profile.webp` |
| Level/trophy | `level.webp` |
| Reward star | `star.webp` |
| Locked state | `lock.webp` |

## Usage rules

- Render generated icons through `KidImageIcons.tsx`; do not repeat raw asset paths in pages.
- Use one semantic image per action. Do not add decorative emoji beside it.
- Navigation artwork renders at 30–38px. Feature/stat artwork may render at 48–72px.
- All generated artwork is decorative (`alt=""`); the adjacent visible label supplies the accessible name.
- Child-facing locked content must explain the unlock condition instead of showing only a lock.

## Flat Mee mascot family

Use `AikidCatCharacter.tsx` for all child-facing mascot placements. The six approved poses are `welcome`, `guide`, `walking`, `thinking`, `celebrate`, and `support`. These assets preserve the flat white-orange geometry of the login cat; do not replace them with clay, 3D, textured or photoreal variants.
