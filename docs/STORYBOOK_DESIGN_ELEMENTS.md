# Storybook of Legends — Design Elements Handoff

> Cập nhật: 30/07/2026  
> Phạm vi: thiết kế visual cho Storybook, sticker, Chapter reward, Gallery và Profile  
> Source of truth nghiệp vụ: `STORYBOOK_OF_LEGENDS_MASTER.md` và Core Gamification  
> Source of truth dữ liệu hiện hành: `storybook-data.ts`, `creation/storybook.ts`

## 1. Mục tiêu tài liệu

Tài liệu này là brief chung cho product designer, illustrator và frontend khi
thiết kế các element Storybook. Mỗi asset phải:

- nhận ra được ở kích thước nhỏ;
- thân thiện với trẻ 8–11 tuổi;
- cùng ngôn ngữ Soft Clay với AIKid;
- có phiên bản locked và unlocked không gây layout shift;
- không chứa dữ liệu cá nhân hoặc hình trẻ thật;
- dùng được trên Web, mobile và Profile reward.

Không dùng tài liệu này để thay đổi điều kiện unlock. `unlockRule`, inventory,
claim và quyền chia sẻ vẫn thuộc backend.

## 2. Anatomy tổng thể

```text
Storybook shell
├── Hero / tên cuốn sách
├── Tab Cuốn sách
│   ├── Chapter navigation
│   ├── Book spread
│   │   ├── Trang trái: environment + story
│   │   └── Trang phải: grid 3×3 sticker
│   └── Chapter reward card
├── Tab Triển lãm
│   ├── Approved work card
│   └── Reaction bar
├── Tab Vinh danh
│   ├── Received board
│   └── Given board
└── Tab Tương tác
    ├── Weekly prompt
    └── Remix / Challenge / Inspire cards
```

Một Chapter gồm đúng:

- 1 chapter cover;
- 1 background trang kể chuyện;
- 1 texture trang sticker;
- 8 sticker thường;
- 8 placeholder tương ứng;
- 1 Boss sticker;
- 1 Boss placeholder;
- 1 Chapter reward.

Tổng bộ P01–P08:

- 8 chapter cover;
- 16 page background/texture;
- 72 sticker unlocked;
- 72 placeholder locked;
- 8 Chapter reward.

## 3. Ngôn ngữ hình ảnh

### Tính cách

- Ấm áp, tò mò, có chất thủ công.
- Hình khối tròn, silhouette rõ, biểu cảm tích cực.
- Chi tiết vừa đủ; không chibi quá nhỏ hoặc photoreal.
- Ánh sáng mềm, vật liệu clay/paper/fabric.
- Một element chỉ có một điểm nhấn thị giác chính.

### Không sử dụng

- Neon/cyberpunk, chrome kim loại hoặc glassmorphism.
- Robot/brain AI sáo rỗng làm hình ảnh duy nhất.
- Text nhỏ được rasterize vào sticker.
- Glow mạnh quanh mọi element.
- Vương miện, cúp hoặc thứ hạng cho mọi thành tích.
- Khuôn mặt trẻ thật hoặc hình có thể nhận diện cá nhân.

### Palette hệ thống

| Vai trò | Màu |
|---|---|
| Brand | `#6D5EFC` |
| Sky | `#3DBFFF` |
| Mint | `#3ED9A0` |
| Sun | `#FFC94A` |
| Coral | `#FF7B93` |
| Text | `#1E2740` |
| Paper | `#FFF9DF` |
| Book border | `#6F351D` |

Mỗi Chapter được phép có palette riêng nhưng phải giữ Paper, Text và hệ accent
chung để cuốn sách vẫn là một sản phẩm thống nhất.

## 4. Art direction từng Chapter

| Slug | Chapter | Chủ đề visual | Palette chính | Motif | Reward |
|---|---|---|---|---|---|
| P01 | Cánh Cổng Thế Giới AI | Cánh cổng khám phá, sao và bản đồ | Violet + Sun | portal, trail, star | Background Bình Minh Cổng AI |
| P02 | Vương Quốc Ngôn Ngữ | Thư viện cổ thân thiện | Forest + Gold | book, letter, scroll | Khung Thư Viện Cổ |
| P03 | Đại Dương Hình Ảnh | Đại dương của ý tưởng | Sky + Coral | wave, shell, paint | Background Đại Dương Sáng Tạo |
| P04 | Đỉnh Núi Tri Thức | Leo núi và nhìn lại hành trình | Amber + Sun | summit, gem, flag | Khung Đỉnh Núi Vàng |
| P05 | Xưởng Của Paco | Xưởng chế tạo ấm áp | Orange + Sun | gear, tool, blueprint | Theme Xưởng Paco |
| P06 | Rừng Nhân Vật | Rừng sống động và bạn bè | Forest + Lime | leaf, mask, owl | Background Rừng Hộ Vệ |
| P07 | Thiên Hà Câu Chuyện | Không gian của các câu chuyện | Indigo + Lavender | planet, page, comet | Khung Người Kể Chuyện Thiên Hà |
| P08 | Trái Tim Kết Nối | Cộng đồng an toàn, nâng đỡ nhau | Pink + Coral | heart, link, hand | Theme Trái Tim Kết Nối |

## 5. Sticker system

### Canvas

| Asset | Canvas | Format | Dung lượng |
|---|---:|---|---:|
| Sticker unlocked | 512×512 | PNG/WebP/SVG | ≤ 500 KB |
| Placeholder locked | 512×512 | PNG/WebP/SVG | ≤ 300 KB |
| Boss sticker | 768×768 | PNG/WebP/SVG | ≤ 800 KB |

Quy chuẩn:

- Nền trong suốt.
- Artwork nằm trong safe area giữa 80%.
- Padding quang học đồng đều giữa cả 9 slot.
- Silhouette nhận ra ở 48×48 px.
- Không có text dài trong artwork.
- Cặp unlocked/placeholder cùng canvas, tâm và tỷ lệ.

### Trạng thái

| State | Visual |
|---|---|
| Locked | Silhouette dịu, grayscale, opacity khoảng 45% |
| Hint revealed | Silhouette rõ hơn; hiện icon/motif, chưa hiện màu đầy đủ |
| Unlocked | Màu đầy đủ, shadow nhẹ, không animation lặp |
| Boss hidden | Dấu hỏi hoặc silhouette bí ẩn |
| Boss ready | Accent violet/sun, một pulse ngắn |
| Boss claimed | Artwork đầy đủ + label hoàn thành |

Placeholder không được làm trẻ thấy thất bại. Dùng ngôn ngữ “đang chờ được
khám phá”, không dùng khóa sắt nặng, màu danger hoặc mặt buồn.

### Naming

```text
storybook/{slug}/stickers/{slug}-S01.webp
storybook/{slug}/stickers/{slug}-S01-locked.webp
storybook/{slug}/stickers/{slug}-S09-boss.webp
storybook/{slug}/stickers/{slug}-S09-boss-locked.webp
```

ID runtime hiện dùng `P01-S1`…`P01-S9`; số `01` trong filename chỉ để sort file.

## 6. Danh mục 72 sticker

Tên, hint và điều kiện chi tiết nằm trong
`apps/web/src/features/storybook/storybook-data.ts`. Khi thiết kế, dùng bảng
dưới làm hướng art direction; không tự đổi ID.

### P01 — Cánh Cổng Thế Giới AI

1. Bước Chân Đầu Tiên — giày/bước chân phát sáng.
2. Người Đặt Câu Hỏi — bong bóng hỏi đáp.
3. Ngôi Sao Đầu Tiên — sao mềm có quỹ đạo.
4. 3 Ngày Liên Tiếp — ngọn lửa nhỏ ba lớp.
5. Tốt Nghiệp Chương 1 — mũ tốt nghiệp.
6. Nhà Sưu Tầm Sao — lọ sao/bầu trời.
7. Tuần Lễ Chăm Chỉ — tia chớp tích cực.
8. Người Khám Phá — bản đồ và la bàn.
9. Boss: Paco’s Chosen One — Paco + portal star.

### P02 — Vương Quốc Ngôn Ngữ

1. Từ Mới Đầu Tiên — thẻ từ.
2. Kể Chuyện Ngắn — sách mở.
3. Bạn Đọc Sách — bookmark.
4. Nhà Văn Nhỏ — bút lông.
5. 10 Quest — huy hiệu sách.
6. Song Ngữ — hai bong bóng hội thoại.
7. Được Yêu Thích — thư có tim.
8. 30 Ngôi Sao — vương miện bằng giấy.
9. Boss: Paco’s Storyteller — cuộn truyện huyền thoại.

### P03 — Đại Dương Hình Ảnh

1. Họa Sĩ Nhỏ — bảng màu.
2. Nhân Vật Đầu Tiên — chân dung clay.
3. Mee Ra Đời — Mee mascot.
4. Bộ Sưu Tập 5 — gallery mini.
5. Phong Cách Khác Biệt — mặt nạ/màu.
6. Tác Phẩm Bay Xa — artwork + tín hiệu.
7. Nghệ Sĩ 10 Tác Phẩm — cọ và canvas.
8. Nhà Sáng Tạo Comic — comic burst.
9. Boss: Ocean Artist — vỏ sò ngọc trai sáng tạo.

### P04 — Đỉnh Núi Tri Thức

1. Học Sinh Kiên Trì — viên ngọc.
2. Tốt Nghiệp Khóa 1 — trường học/flag.
3. 100 Ngôi Sao — cụm sao.
4. Nhà Vô Địch Tuần — huy chương, không dùng podium.
5. Bộ Sưu Tập Hoàn Hảo — chuỗi sao.
6. Ngọn Hải Đăng — đèn dẫn đường.
7. Người Truyền Cảm Hứng — hai bàn tay/bạn bè.
8. Streak Huyền Thoại — lửa ấm.
9. Boss: The Summit — đỉnh núi và cờ.

### P05 — Xưởng Của Paco

1. Mở Cửa Xưởng — chìa khóa.
2. Bản Vẽ Đầu Tiên — blueprint.
3. Ý Tưởng Lấp Lánh — bóng đèn.
4. Tác Phẩm Đầu Tay Được Yêu — artwork + tim.
5. Ngôi Sao Của Lớp — sao lớp học.
6. Paco Tự Hào — dấu chân Paco.
7. Nhà Thiết Kế — hộp dụng cụ.
8. Bậc Thầy Xưởng — bánh răng.
9. Boss: Master Inventor — cúp phát minh dạng clay.

### P06 — Rừng Nhân Vật

1. Người Bạn Đầu Tiên — chân dung nhân vật.
2. Tủ Trang Phục — costume rack.
3. Biểu Cảm — ba khuôn mặt cảm xúc.
4. Đội Phiêu Lưu — nhóm nhân vật.
5. Tiểu Sử Bí Mật — sổ tay.
6. Bạn Được Yêu — nhân vật + tim xanh.
7. Dàn Diễn Viên — mặt nạ sân khấu.
8. Người Thổi Hồn — spark/leaf.
9. Boss: Forest Guardian — cú bảo hộ.

### P07 — Thiên Hà Câu Chuyện

1. Trang Đầu Tiên — trang giấy.
2. Có Mở Có Kết — sách đóng hoàn chỉnh.
3. Cú Ngoặt Bất Ngờ — đường xoáy.
4. Ba Chương — ba quyển sách.
5. Người Kể Chuyện — micro/lời kể.
6. Truyền Cảm Hứng — hành tinh phát tín hiệu.
7. Tác Giả Nhí — bút và sao.
8. Viral Nhỏ — sao chổi lan tỏa.
9. Boss: Galaxy Storyteller — hành tinh sách.

### P08 — Trái Tim Kết Nối

1. Người Đặt Tim Đầu Tiên — reaction heart.
2. Cổ Động Viên — loa động viên.
3. Ngôi Sao Nổi — gallery star.
4. Người Chia Sẻ — share ribbon.
5. Paco Tự Hào — Paco Pick.
6. Truyền Cảm Hứng — kết nối hai ý tưởng.
7. Trái Tim Vàng — trái tim sun.
8. Nghệ Sĩ Được Yêu — palette + reactions.
9. Boss: Community Legend — huy hiệu kết nối.

## 7. Chapter background assets

| Asset | Kích thước | Format | Yêu cầu |
|---|---:|---|---|
| Cover | 1600×900 | WebP/JPG | Subject ở giữa 60%, dùng được thumbnail |
| Left background | 1200×1200 | WebP/JPG | Chừa 45% phía dưới/trái cho text |
| Sticker page texture | 1200×1200 | WebP/JPG | Contrast thấp, không cạnh tranh sticker |

Gradient đen phủ trang trái hiện do runtime thêm. Designer không bake gradient
hoặc text vào ảnh.

Naming:

```text
storybook/{slug}/{slug}-cover.webp
storybook/{slug}/{slug}-left-bg.webp
storybook/{slug}/{slug}-sticker-page.webp
```

## 8. Book spread element spec

### Desktop

- Max width: 1024 px.
- Hai trang 1:1.
- Spine ở chính giữa.
- Min height mỗi trang: 432 px.
- Sticker grid 3×3.
- Border sách: 8 px.

### Mobile

- Hai trang xếp dọc.
- Story page trước, sticker page sau.
- Sticker card tối thiểu 96×112 px.
- Không thu nhỏ text dưới 12 px.
- Điều hướng trước/sau có touch target ≥44 px.

### Content hierarchy

Trang trái:

1. Chapter code + group.
2. Chapter title.
3. Story sentence.
4. Progress bar.
5. `x/9 sticker`.

Trang phải:

1. Sticker artwork.
2. Tên hoặc slot label.
3. Hint/trạng thái.

## 9. Chapter reward

Reward phải là element dùng được thật trên Profile, không phải badge trang trí.

| Kind | Canvas | Safe area |
|---|---:|---|
| Background | 1600×1200 | Giữa 60% thoáng |
| Frame | 1024×1024 transparent | Lỗ giữa ≥58% |
| Theme | Token JSON + preview 1600×1200 | Không nhúng base64 |

State reward card:

- `0–7/8`: grayscale, CTA “Còn n sticker”.
- `8/8`: màu đầy đủ, CTA “Nhận phần thưởng”.
- Claiming: giữ nguyên chiều rộng CTA.
- Claimed: CTA “Trang trí Profile”.
- Error: thông báo gần CTA, không lộ mã kỹ thuật.

## 10. Gallery và social elements

### Approved work card

- Thumbnail aspect ratio 4:3.
- Chỉ nội dung đã được phụ huynh duyệt.
- Tên trẻ chỉ là nickname.
- Hiển thị title, nickname, level và summary ngắn.
- Không hiển thị prompt, email, tuổi chính xác hoặc workspace riêng tư.

### Reaction set

| Type | Emoji | Ý nghĩa |
|---|---|---|
| EXCELLENT | 🌟 | Xuất sắc |
| CREATIVE | 🎨 | Sáng tạo |
| HOT | 🔥 | Nổi bật |
| LOVE | 🤩 | Mình thích |
| INSIGHTFUL | 💡 | Ý tưởng hay |
| PACO_PICK | 🐾 | Paco tự hào |

Không thiết kế dislike, reaction tiêu cực hoặc comment box.

### Vinh danh

Hai board ngang hàng:

- Nghệ sĩ được yêu thích.
- Người lan tỏa yêu thương.

Không dùng ngôn ngữ thắng/thua. Top position có thể dùng Sun accent nhưng không
làm các vị trí còn lại mờ hoặc kém giá trị.

## 11. Animation

- Sticker unlock: scale `0.92 → 1`, fade, 400–600 ms.
- Boss ready: một pulse ngắn; không pulse vô hạn.
- Page transition: fade + translate 4–8 px, 180–280 ms.
- Claim reward: reveal 500–700 ms.
- Honor `prefers-reduced-motion`.
- Không animate spine, background lớn hoặc nhiều sticker cùng lúc.

## 12. Accessibility

- Artwork có label chữ bên cạnh dùng `alt=""`.
- Asset truyền tải nội dung độc lập cần alt ngắn.
- Locked/unlocked không chỉ phân biệt bằng màu.
- Focus ring theo token hệ thống.
- Text trên background đạt contrast 4.5:1.
- Zoom 200% không mất navigation hoặc CTA.
- Boss bí ẩn vẫn có accessible label “Boss sticker chưa mở”.

## 13. Runtime contract

Chapter Studio payload:

```ts
type ChapterDesignPayload = {
  code: string
  name: string
  description: string
  content: {
    slug: string
    story: string
    group: 'learning' | 'creative' | 'milestone' | 'social'
    rewardId: string
    stickers: Array<{
      id: string
      name: string
      hint: string
      icon: string
      boss?: boolean
      imageUrl?: string
      placeholderUrl?: string
      unlockRule: {
        metric: 'lessons_completed' | 'courses_completed' | 'stars' | 'streak' | 'xp' | 'level'
        operator: 'gte'
        target: number
      }
    }>
  }
  displayConfig: {
    colors: [string, string]
    emoji: string
    coverUrl?: string
    leftBackgroundUrl?: string
    stickerPageUrl?: string
  }
}
```

Chapter publish hợp lệ khi:

- có `story`;
- có đúng 9 sticker;
- sticker thứ 9 là Boss;
- mọi ID duy nhất;
- asset qua Media API;
- `rewardId` tồn tại;
- rule dùng metric backend hỗ trợ.

## 14. Delivery package

Mỗi Chapter bàn giao một folder:

```text
P01/
├── P01-cover.webp
├── P01-left-bg.webp
├── P01-sticker-page.webp
├── stickers/
│   ├── P01-S01.webp
│   ├── P01-S01-locked.webp
│   ├── ...
│   ├── P01-S09-boss.webp
│   └── P01-S09-boss-locked.webp
├── reward/
│   ├── background-ai-gate.webp
│   └── background-ai-gate-preview.webp
└── manifest.json
```

`manifest.json` ghi:

- canvas và format;
- asset URL sau upload;
- sticker ID;
- alt/label;
- unlock rule;
- reward ID;
- version và ngày bàn giao.

## 15. Checklist review

- [ ] Đủ 9 sticker và 9 placeholder.
- [ ] Placeholder cùng canvas/tâm với artwork.
- [ ] Silhouette đọc được ở 48 px.
- [ ] Không có text raster nhỏ.
- [ ] Background chừa vùng text.
- [ ] Texture trang sticker không gây nhiễu.
- [ ] Reward dùng được trên Profile.
- [ ] Không lộ dữ liệu trẻ.
- [ ] Không có social mechanic tiêu cực.
- [ ] Asset đúng naming convention.
- [ ] Kiểm tra 375/768/1280 px.
- [ ] Kiểm tra keyboard, contrast và reduced motion.
- [ ] Preview cạnh toàn bộ Chapter khác để đảm bảo cùng một họ visual.

## 16. File tham chiếu

- Product master: `docs/STORYBOOK_OF_LEGENDS_MASTER.md`
- Social safety: `docs/STORYBOOK_SOCIAL_INTERACTION.md`
- Studio workflow: `docs/LEGEND_REWARD_STUDIO.md`
- UI system: `docs/UI_DESIGN_SYSTEM.md`
- Page/sticker data: `apps/web/src/features/storybook/storybook-data.ts`
- Chapter contract: `apps/web/src/shared/lib/creation/storybook.ts`
- Book UI: `apps/web/src/features/storybook/components/BookSpread.tsx`
- Reward UI: `apps/web/src/features/storybook/components/ChapterRewardCard.tsx`
- Reward catalog: `apps/web/src/shared/lib/creation/rewards.ts`
