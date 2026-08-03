# Reward asset additions — 2026-08-01

This mini-pack extends the existing Soft Clay reward family. The files are
staged under `apps/web/src/assets/rewards/` for the immutable Reward Pack
workflow; the frontend does not reference local asset paths at runtime.

## Assets

| ID | Kind | Size | Concept |
|---|---|---:|---|
| `frame-firefly-forest` | frame | 1024 × 1024 | Mint leaves, carved wood and friendly fireflies |
| `frame-firefly-forest--plaque` | frame plaque | 1600 × 400 | Stretchable mint ribbon with forest end caps |
| `effect-idea-bubbles` | effect | 1024 × 1024 | Bubbles and idea bulbs orbiting an empty avatar area |
| `effect-firefly-trail` | effect | 1024 × 1024 | Golden fireflies, flowers and leaf motes around an empty center |
| `badge-code-comet` | achievement badge | 512 × 512 | A friendly comet moving through code blocks |
| `badge-kind-collaborator` | achievement badge | 512 × 512 | Two hands protecting a heart and star |

### Explorer level frames

The complete level-frame progression now includes a primary frame and a
separate scalable plaque for every milestone defined by the gamification
catalog.

| Level | Reward ID | Vietnamese name | Direction |
|---:|---|---|---|
| 15 | `frame-level-15` | Khung Mầm Xanh | Mint sprouts, dew and pale wood |
| 25 | `frame-level-25` | Khung Sao Mai | Golden morning star and peach dawn clouds |
| 35 | `frame-level-35` | Khung Sóng Biển | Turquoise waves, pearl foam and coral shells |
| 45 | `frame-level-45` | Khung Lửa Nhỏ | Friendly heart flames, coral embers and violet rim |
| 55 | `frame-level-55` | Khung Cánh Mây | White clouds, soft wings and cyan sky arcs |
| 65 | `frame-level-65` | Khung Bản Đồ | Parchment, compass points and teal map details |
| 75 | `frame-level-75` | Khung Pha Lê | Rounded cyan/lavender crystals and pearl stars |
| 85 | `frame-level-85` | Khung Hành Tinh | Violet orbits, ringed planet and cyan moons |
| 95 | `frame-level-95` | Khung Vương Miện | Royal crown, golden laurels and pearl gems |

Each row is delivered as:

- `frame-level-<level>.png` — 1024 × 1024 RGBA frame.
- `frame-level-<level>--plaque.png` — 1600 × 400 RGBA plaque.

All files are RGBA PNGs with transparent corners and no embedded text. Their
filenames follow the stable reward asset ID contract.

## Generation prompts

All assets used the built-in image generation workflow followed by local
chroma-key removal. Shared direction:

> Premium kids edtech game collectible for ages 8–11, soft clay 3D,
> rounded friendly shapes, harmonious brand purple, sky, mint, sun and coral,
> clear at small size, no text, letters, numbers, logo, watermark, checkerboard,
> UI screenshot or mockup.

Specific subjects:

- **Firefly Forest frame:** circular carved-wood ring with rounded mint leaves,
  lavender buds and friendly golden fireflies; 88% outer diameter, 65% empty
  center and 12–14% visual thickness.
- **Firefly Forest plaque:** horizontal mint ribbon with carved-wood and leaf
  end caps, two golden fireflies and a wide calm center for HTML level text.
- **Idea Bubbles effect:** sparse sky-blue bubbles, coral light bulbs and small
  violet/sun dots within the 62–90% orbit band; center 58% empty.
- **Firefly Trail effect:** no more than twelve warm firefly/leaf/star groups
  following two gentle circular trails; center 58% empty.
- **Code Comet badge:** golden friendly comet weaving between rounded violet
  code blocks inside a purple-and-gold enamel medal.
- **Kind Collaborator badge:** two inclusive hands holding a coral heart under
  a golden star inside a mint, purple and gold enamel medal.

## QA performed

- Alpha channel present; all four corners are fully transparent.
- Frame and effects preserve a transparent center.
- Plaque is delivered at the required 4:1 canvas ratio with an empty center.
- All nine Explorer level frames were visually reviewed together on a
  checkerboard background to verify progression, silhouette and alpha edges.
- Asset filename and file-size validation passes with `npm run assets:validate
  -w @aikids/web`.
- No catalog data or production release was changed. Publish these through the
  Reward Pack draft → preview → approve workflow.
