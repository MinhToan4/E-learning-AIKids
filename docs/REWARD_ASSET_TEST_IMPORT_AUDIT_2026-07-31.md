# Reward asset test import audit — 2026-07-31

Source report:

`/Users/imam/.gemini/antigravity/brain/7743d117-16d8-412b-b416-d0e27da05a03/generated_rewards_and_badges.md`

## Upload result

- Files discovered: 29 JPEG files.
- Files uploaded and verified: 29/29.
- Bucket: `reward-assets`.
- Test prefix: `test-imports/2026.07.31-antigravity/`.
- Catalog activated: no.
- Production release modified: no.

Public test URL pattern:

```text
https://storage.storymee.com/reward-assets/test-imports/2026.07.31-antigravity/{filename}.jpg
```

Examples:

- `frame-cloud-summer.jpg`
- `frame-cloud-summer--plaque.jpg`
- `frame-galaxy.jpg`
- `frame-galaxy--plaque.jpg`
- `perk-sticker-sparkle.jpg`
- `paco-cloud-companion.jpg`

## Validation findings

The generated report says the files are production-ready, but the actual files
do not satisfy the current reward contract:

1. All 29 files are JPEG and have no alpha channel.
2. Frame, companion and effect assets therefore render as opaque squares.
3. The visible checkerboard is baked into several JPEGs; it is not transparency.
4. Both plaques are `1264 × 848`, not a horizontal scalable plaque around
   `600 × 160` or an equivalent 9-slice asset.
5. Backgrounds are `1376 × 768`, below the recommended profile background
   canvas of `1600 × 1200`.
6. Themes are JPEG images, while the current theme contract expects JSON design
   tokens and no embedded CDN URL.
7. The files were placed in `public/assets/rewards`, but runtime reward assets
   must be published to storage and addressed by `assetId`.

## Required correction before publishing

- Re-export frame, plaque, companion and effect assets as transparent PNG/WebP
  or SVG where appropriate.
- Remove the baked checkerboard and white backgrounds.
- Rebuild plaques as horizontal scalable assets with no embedded level text.
- Convert themes to the agreed JSON token format, or explicitly introduce a
  separate theme-background reward kind and contract.
- Build a valid Reward Pack ZIP, validate it, upload as draft, preview, approve
  and publish as a new immutable release.
