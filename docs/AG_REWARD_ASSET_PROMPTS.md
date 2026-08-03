# AI Kids Reward Asset — Generation Prompts

Tài liệu này dùng để generate asset cho Profile/Reward bằng các công cụ AI image generation.

## 1. Art direction chung

Thêm đoạn sau vào cuối mọi prompt:

> Premium kids edtech game collectible, ages 8–11, soft clay 3D illustration, rounded friendly shapes, polished mobile game UI asset, bright but harmonious colors, clear silhouette at small size, soft studio lighting, subtle depth, no photorealism, no scary details, no weapons pointed at viewer, no brand logo, no watermark, no UI screenshot, no mockup, no text, no letters, no numbers.

Negative prompt:

> photorealistic, horror, dark violence, sharp dangerous edges, noisy background, excessive particles, illegible text, typography, watermark, logo, frame cropped by canvas, object touching canvas edge, low contrast, muddy color, malformed character, extra limbs, duplicate objects, checkerboard pattern, fake transparency, white background, colored square background, mockup canvas.

`Transparent background` nghĩa là file có **alpha channel thật**. Tuyệt đối không
vẽ ô caro/checkerboard hoặc nền trắng để giả trong suốt. Sau khi generate phải
background-remove và kiểm tra alpha bằng công cụ xuất file trước khi upload.

## 2. Quy chuẩn xuất file

| Loại | Kích thước generate | File sử dụng | Nền |
|---|---:|---:|---|
| Achievement badge | 1024×1024 | 512×512 WebP/PNG | Transparent |
| Avatar frame | 2048×2048 | SVG hoặc 1024×1024 PNG | Transparent |
| Level plaque của frame | 1600×400 | SVG/PNG 9-slice | Transparent |
| Companion | 1024×1024 | 512×512 WebP/PNG | Transparent |
| Profile background | 1920×720 | 1600×600 WebP | Full canvas |
| App theme | 1920×1080 | 1920×1080 WebP | Full canvas/seamless |
| Effect overlay | 1024×1024 | 1024×1024 WebP/PNG | Transparent |

Luôn giữ `8–12% safe area` quanh asset.

### Các ngưỡng nghiệm thu đo được

| Loại | Quy cách bắt buộc |
|---|---|
| Badge | Alpha thật; artwork trong 76–84% canvas; không chạm mép |
| Frame | Alpha thật; outer diameter 86–90%; inner hole 62–68%; độ dày thị giác 11–15% chiều rộng canvas |
| Plaque | Tỷ lệ 4:1; hai đầu cố định ≤20% tổng rộng; vùng giữa co giãn ≥60%; alpha thật |
| Companion | Alpha thật; nhân vật trong 76–86% canvas; không có sàn/bóng nền hình chữ nhật |
| Effect | Alpha thật; vùng tròn giữa 54–60% hoàn toàn trong suốt; artwork chỉ nằm trong vành 60–94% |
| Profile background | 1600×600; vùng trái 34% và phải 28% ít chi tiết để đặt text/stats |
| Theme | Low contrast; không có vật thể đơn lớn hơn 15% viewport; vùng giữa 70% yên tĩnh |

Không đánh giá alpha bằng mắt. Nếu file là JPEG thì mặc định **không đạt** đối
với badge, frame, plaque, companion và effect.

---

# 3. Achievement badges

## Prompt template

> Create one collectible achievement badge for an AI learning game. Central symbol: **[SYMBOL]**. Badge material: enamel and soft clay, circular medal with a small ribbon base, layered rim, one strong focal point, readable at 48 px. Primary colors: **[COLORS]**. Rarity: **[RARITY]**. Transparent background, centered object, generous padding.

## Badge prompts

### Tia Sáng Đầu Tiên

> Create one collectible achievement badge featuring a small golden sunrise star emerging above a lavender horizon, warm yellow core, violet enamel rim, tiny hopeful sparkles, beginner rarity, transparent background.

### Người Tìm Tòi

> Create one collectible achievement badge featuring a friendly magnifying glass discovering a glowing question-shaped light, cyan and violet enamel, curious playful mood, uncommon rarity, transparent background.

### Nhà Khám Phá

> Create one collectible achievement badge featuring a colorful compass pointing toward a tiny glowing AI portal, turquoise, orange and violet palette, uncommon rarity, transparent background.

### Người Săn Ý Tưởng

> Create one collectible achievement badge featuring a bright light bulb catching three floating idea stars, yellow, coral and sky blue palette, rare rarity, transparent background.

### Nhà Thám Hiểm Ánh Sao

> Create one collectible achievement badge featuring a small rocket crossing a five-point star trail, deep violet, cyan and gold palette, rare rarity, transparent background.

### Người Dẫn Đường

> Create one collectible achievement badge featuring a warm lantern illuminating a winding learning path, amber, mint and navy palette, epic rarity, transparent background.

### Kiến Trúc Sư Thế Giới

> Create one collectible achievement badge featuring colorful building blocks forming a magical digital city, blueprints and tiny stars, cyan, orange and violet palette, epic rarity, transparent background.

### Người Truyền Lửa

> Create one collectible achievement badge featuring a friendly heart-shaped flame surrounded by small learning sparks, coral, amber and magenta palette, epic rarity, transparent background.

### Người Giữ Ánh Sao

> Create one collectible achievement badge featuring two gentle hands protecting a glowing star orb, midnight blue, violet and gold palette, legendary rarity, transparent background.

### Huyền Thoại Trẻ

> Create one premium collectible achievement badge featuring a golden trophy with a small AI star crystal, royal violet enamel, rainbow highlights, laurel details, legendary rarity, transparent background.

---

# 4. Avatar frames + level plaque

## Yêu cầu bắt buộc

- Generate `frame ring` và `level plaque` thành hai asset riêng.
- Frame không chứa chữ `Cấp/Level`.
- Level plaque phải co giãn ngang bằng 9-slice.
- Hai đầu plaque có trang trí, vùng giữa phẳng để render text bằng HTML.
- Không vẽ background full card trong asset frame.
- Outer diameter của frame chiếm 86–90% canvas.
- Inner hole chiếm 62–68% canvas và phải alpha bằng 0 hoàn toàn.
- Độ dày thị giác của khung nằm trong 11–15% chiều rộng canvas; không tạo vòng
  dày che vai/mặt, cũng không mảnh đến mức mất ở kích thước 64 px.
- Bốn góc canvas phải trong suốt; không có checkerboard hoặc nền vuông.
- Plaque xuất tỷ lệ 4:1 (`1600×400` hoặc SVG viewBox tương đương), không phải
  ảnh vuông/ngang 3:2 bị kéo méo.

## Khung Cầu Vồng

Frame:

> Create a circular avatar frame made from seven soft rainbow bands, tiny cloud puffs and two subtle star glints, white inner rim, cheerful premium kids game reward, empty transparent center, transparent outer background.

Level plaque:

> Create a horizontally stretchable rainbow level plaque, rounded capsule silhouette, small white cloud caps on both ends, clean empty center for dynamic level text, transparent background, no text.

## Khung Mây Mùa Hè

Frame:

> Create a circular summer-sky avatar frame made from fluffy white clouds, cyan sky arcs, warm sunlight dots and one tiny golden sun, airy soft clay style, empty transparent center, transparent background.

Level plaque:

> Create a horizontally stretchable cloud level plaque for values from 1 to 100, fluffy cloud ends and a smooth cyan-to-violet center ribbon, enough width for long level numbers, transparent background, no text.

## Khung Dải Ngân Hà

Frame:

> Create a circular galaxy avatar frame with a deep indigo orbit ring, violet nebula glow, tiny cyan stars and a small golden planet, magical but readable, empty transparent center, transparent background.

Level plaque:

> Create a stretchable galaxy level plaque, indigo capsule with violet nebula edge glow and small gold star end caps, clean center for dynamic text, transparent background, no text.

## Khung Thư Viện Cổ

Frame:

> Create a circular magical library avatar frame made from warm carved wood, small emerald book corners, subtle golden runes and soft paper highlights, friendly storybook mood, empty transparent center, transparent background.

Level plaque:

> Create a stretchable ancient-library level plaque made from warm parchment and carved wood end caps, emerald and gold accents, clean center for dynamic text, transparent background, no text.

## Khung Đỉnh Núi Vàng

Frame:

> Create a circular summit avatar frame shaped by golden mountain ridges, sunrise rays, white snow caps and a small victory flag, prestigious soft clay game reward, empty transparent center, transparent background.

Level plaque:

> Create a stretchable summit level plaque, warm gold capsule supported by small mountain silhouettes on both ends, white highlight rim, clean center for dynamic text, transparent background, no text.

## Khung Người Kể Chuyện Thiên Hà

Frame:

> Create a circular cosmic storyteller avatar frame, open storybook pages forming the lower arc, violet galaxy orbit forming the upper arc, tiny narrative stars and one golden comet, legendary quality, empty transparent center, transparent background.

Level plaque:

> Create a stretchable cosmic storybook level plaque, violet ribbon center with small open-book end caps and subtle gold stars, clean center for dynamic text, transparent background, no text.

---

# 5. Companions

Companion phải nhìn rõ ở kích thước `36–64 px`, pose 3/4, có alpha thật. Nhân
vật chiếm 76–86% canvas; không có nền trắng, checkerboard, sàn studio hoặc bóng
đổ hình chữ nhật. Chỉ cho phép bóng mềm nhỏ nằm trong alpha nếu cần tách chân.

## Paco Xanh Đồng Hành

> Create a small friendly AI robot companion named Paco, rounded blue screen head, expressive cyan pixel eyes, compact white-and-sky-blue body, tiny floating pose, waving one hand, soft clay 3D mobile game mascot, strong silhouette, transparent background.

## Paco Ngôi Sao

> Create a small friendly AI robot companion wearing a soft golden star cape, blue screen face, happy pixel eyes, floating beside a tiny star orb, premium reward variant, transparent background.

## Paco Nhà Phát Minh

> Create a small friendly AI robot inventor companion, blue screen face, orange tool belt, tiny safe wrench and glowing idea antenna, playful soft clay style, transparent background.

## Paco Người Kể Chuyện

> Create a small friendly AI robot storyteller companion holding a tiny glowing book, violet scarf, floating story stars, warm expressive pixel eyes, transparent background.

---

# 6. Profile backgrounds

Background profile là ảnh ngang phía sau avatar, tên và stats.

Yêu cầu:

- Không đặt focal point sau vùng avatar bên trái.
- Không đặt chi tiết mạnh sau stats bên phải.
- Trung tâm có thể có illustration mờ.
- Không có text.
- Độ tương phản phải cho phép đặt chữ trắng.

## Bình Minh Cổng AI

> Create a wide profile card background showing a magical AI portal at sunrise, deep violet sky transitioning to warm golden horizon, cyan glowing arch positioned slightly right of center, soft sun orb near the lower-right, tiny restrained stars, left side calm and darker for avatar and name, right side clean for stats, premium kids edtech fantasy, no characters, no text.

## Đại Dương Sáng Tạo

> Create a wide profile card background of a playful creative ocean, turquoise-to-sky-blue gradient water, coral-pink light, floating paint droplets shaped like bubbles, a subtle shell portal near center-right, calm left area for avatar, clean right area for stats, no text.

## Rừng Hộ Vệ

> Create a wide profile card background of a friendly enchanted forest guardian world, emerald canopy, mint light rays, warm firefly dots, subtle tree-door portal near center-right, calm dark-green left area for avatar, clean right area for stats, no scary creatures, no text.

---

# 7. Full app themes

Theme phủ toàn bộ app phía sau các card trắng bán trong suốt.

Yêu cầu:

- Seamless hoặc không lộ điểm nối khi trang dài.
- Low contrast, không cạnh tranh với nội dung.
- Không chứa text, nhân vật lớn hoặc vật thể quan trọng ở trung tâm.
- Card trắng `90% opacity` phải đọc rõ trên theme.
- Không có nhân vật, bảng màu, cỗ máy hay vật thể đơn chiếm quá 15% viewport.
- 70% vùng giữa phải là texture/pattern yên tĩnh; trang có thể dài mà không lộ
  đường nối hoặc một hình minh họa khổng lồ phía dưới card.
- Theme là lớp môi trường nhẹ, không phải poster/hero illustration.

## Xưởng Paco

> Create a subtle full-screen background theme for Paco's creative AI workshop, pale cyan blueprint grid, tiny rounded technical dots, warm yellow workbench light, soft orange corner blobs, a few minimal friendly gear and circuit motifs near outer edges only, large quiet center area, seamless, low contrast, kids edtech, no characters, no text.

## Xưởng Sáng Tạo

> Create a subtle full-screen creative workshop theme, warm cream base, soft orange and coral paper-cut shapes, tiny paint and craft motifs only near edges, gentle dotted grid, large quiet center area for UI cards, seamless, low contrast, no text.

## Storybook Huyền Thoại

> Create a subtle full-screen legendary storybook theme, pale lavender-to-cream gradient, faint page texture, small gold constellation lines and magical book-corner ornaments near the outer edges, quiet center for UI, seamless, low contrast, no text.

## Trái Tim Kết Nối

> Create a subtle full-screen friendship theme, pale pink, lavender and sky-blue gradient, tiny connected heart nodes and soft ribbon paths near edges, warm inclusive mood, large quiet center for UI cards, seamless, low contrast, no text.

---

# 8. Effects

Effect overlay phải có alpha thật và loop được. Vùng tròn giữa đường kính
`54–60%` canvas phải alpha bằng 0 hoàn toàn để không che mặt. Hạt sáng chỉ nằm
trong vành từ `60–94%`; tổng diện tích có opacity đáng kể không vượt 25% canvas.
Không có checkerboard, nền đen/trắng, vòng frame đặc hoặc glow phủ kín tâm.

## Hào Quang Lấp Lánh

> Create a transparent square effect overlay for a circular avatar: eight small golden-white star sparkles distributed around the outer ring, two cyan glints, soft radial glow, empty clear center, no frame, no text, seamless visual loop, transparent background.

## Hào Quang Cầu Vồng

> Create a transparent square avatar effect overlay with a soft rainbow orbit, tiny floating stars and subtle color particles around the perimeter, completely clear center, premium kids game reward, transparent background.

## Hiệu Ứng Thiên Hà

> Create a transparent square avatar effect overlay with a violet nebula orbit, three tiny planets, sparse cyan star particles and a gentle comet trail, empty clear center, transparent background.

## Hiệu Ứng Bình Minh

> Create a transparent square avatar effect overlay with warm sunrise rays, small golden dust particles and two soft lens glints around the lower perimeter, empty clear center, transparent background.

---

# 9. Reward Pack & naming convention

```text
reward-pack/
├── manifest.json
└── assets/
    ├── badge-first-lesson.webp
    ├── badge-level-path-100.webp
    ├── frame-cloud-summer.webp
    ├── frame-cloud-summer--plaque.webp
    ├── avatar-paco-blue.webp
    ├── background-ai-gate.webp
    ├── theme-paco-workshop.webp
    └── perk-sticker-sparkle.webp
```

Publisher nhận file theo `filename stem`:

- Reward asset: tên file phải bằng `reward.id`.
- Achievement badge: `badge-<achievement.type>`.
- Frame ring: `<frame-id>`.
- Level plaque: `<frame-id>--plaque`.
- Extension hỗ trợ: `.webp`, `.png`, `.svg`, `.avif`.
- Ưu tiên WebP cho bitmap; dùng PNG khi cần alpha chất lượng cao; dùng SVG cho vector sạch.
- Không copy asset runtime vào `src/assets` hoặc `public/assets` của frontend.
- Validate và upload ZIP theo `docs/REWARD_DESIGNER_UPLOAD_GUIDE.md`.
- Catalog chỉ kích hoạt `assetId` sau preview, approve và publish.

## Checklist trước khi đưa vào app

- [ ] Không có chữ/text sinh bởi AI.
- [ ] Không bị crop hoặc chạm mép canvas.
- [ ] Frame có tâm rỗng và avatar không bị che.
- [ ] Level plaque đủ rộng cho `CẤP 100`.
- [ ] Companion vẫn rõ ở 40 px.
- [ ] Background không làm chìm text trắng.
- [ ] Theme không cạnh tranh với card nội dung.
- [ ] Effect không che khuôn mặt avatar.
- [ ] PNG/WebP đã được nén và có đúng alpha channel.
- [ ] Không có checkerboard bị vẽ chết vào pixel.
- [ ] Frame đạt inner hole 62–68% và độ dày 11–15% canvas.
- [ ] Effect có vùng tâm 54–60% alpha bằng 0.
