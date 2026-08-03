# Hướng dẫn thiết kế, sửa và upload Reward

Tài liệu này dành cho designer/admin tạo reward mới cho AI Kids. Luồng chuẩn:

```text
Thiết kế → Reward Pack ZIP → validate → upload draft
→ admin preview → approve → publish
```

## 1. Nguyên tắc lưu trữ

- Mỗi reward có `id` ổn định dạng kebab-case, ví dụ `frame-cloud-summer`.
- Database, inventory và frontend chỉ lưu `rewardId`/`assetId`; không lưu URL
  CDN, `storage.storymee.com` hoặc đường dẫn `/assets/...`.
- Designer không nhận MinIO key. CLI gọi backend Ubuntu; backend cấp URL ngắn
  hạn để ZIP đi tới storage VPS Đức.
- Release đã publish là bất biến. Muốn sửa asset phải tạo release mới.
- Upload chỉ tạo draft. Admin phải preview và duyệt trước khi publish.

## 2. FRAME CẤP ĐỘ: yêu cầu bắt buộc

> Frame cấp độ không chỉ là vòng tròn quanh avatar.
>
> Một frame hoàn chỉnh bắt buộc gồm **vòng khung avatar** và **background của
> nhãn cấp độ**. Background phải bao toàn bộ `CẤP 1`, `CẤP 100` hoặc nhãn dài
> hơn, không hở nền, vỡ ảnh hay đè chữ.

Frame cấp độ theo Profile Composition v1 dùng **một canvas tích hợp**:

```text
frame-level-15.webp              # vòng khung + nền badge, không chứa chữ/số
```

Nên cung cấp đủ các derivative cùng bố cục:

```text
frame-level-15.webp
frame-level-15--preview.webp
frame-level-15--thumbnail.webp
```

### Primary — vòng khung avatar

- Canvas đề xuất `1024 × 1024 px`, PNG/WebP trong suốt.
- Vùng avatar an toàn ở giữa tối thiểu 58% đường kính.
- Không đặt badge, chữ `CẤP`, tên học sinh hay số cấp vào ảnh. Cấp độ là UI
  độc lập cạnh tên, không thuộc artwork frame.
- Chi tiết quan trọng cách mép ngoài ít nhất 5%.
- Outer diameter: 86–90% canvas.
- Inner hole trong suốt: 62–68% canvas.
- Độ dày thị giác: 11–15% chiều rộng canvas.
- Bốn góc và toàn bộ inner hole phải có alpha bằng 0.
- Checkerboard nhìn thấy trong pixel không phải transparency và bị từ chối.

### Plaque — chỉ dành cho frame legacy/không theo Composition v1

- Không dùng plaque tách riêng cho reward chuẩn `frame-level-{number}`.
- Frame legacy hoặc frame sự kiện dùng ID khác vẫn cần plaque để tương thích.
- Ưu tiên SVG, viewBox đề xuất `0 0 600 160`.
- Hai đầu trang trí cố định, mỗi đầu tối đa khoảng 80 px.
- Vùng giữa phải kéo ngang được để chứa text dài.
- Safe area chữ đề xuất: `x=90..510`, `y=42..122`.
- Nền phải phủ kín phía sau chữ, không chỉ là icon nhỏ dưới avatar.
- Không nhúng text vào SVG. Hệ thống tự render `CẤP {level}`.
- Không dùng cách scale tạo khoảng trống hai bên khi label dài; artwork phải hỗ
  trợ kéo ngang hoặc cấu trúc 9-slice.

Với **Khung Mây Mùa Hè**, plaque phải là một dải mây liền: cụm mây hai đầu và
thân mây liên tục ở giữa. Khi đổi `CẤP 8` thành `CẤP 100`, mây vẫn bao toàn bộ
label.

Checklist frame Composition v1:

- [ ] Vòng frame không che mặt avatar.
- [ ] Frame chỉ chứa trang trí quanh avatar, không chứa badge hay text/số.
- [ ] Preview giữ nguyên tọa độ avatar và frame của primary.
- [ ] Thumbnail vẫn rõ ở kích thước 128 px.
- [ ] Filename trùng tuyệt đối với `reward.id`.

CLI cho phép `frame-level-{number}` không có plaque. Các frame ID khác vẫn bị
từ chối nếu thiếu `assets.plaque` để giữ tương thích với renderer legacy.

## 3. Quy cách các loại reward

| Kind | Kích thước đề xuất | Ghi chú |
|---|---:|---|
| `frame` | 1024×1024 | Vòng khung trong suốt; không badge, không text |
| `background` | 1920×640 | Nền header 3:1, chừa safe area trung tâm |
| `companion` | 512×512 | Trong suốt, không che avatar |
| `effect` | 1024×1024 | Không chớp mạnh, không che mặt |
| `title` | 1200×320 | Chừa safe area chữ 70% × 55% |
| `avatar` | 1024×1024 | Mặt nằm trong vòng giữa 72% |
| `theme` | 1440×2160 WebP | Canvas dọc 2:3, low contrast, repeat-safe |
| `perk` | 512×512 | Icon rõ ở kích thước nhỏ |

### Profile Composition v1 — chuẩn bắt buộc

Mọi bộ reward profile mới dùng chung một hệ tọa độ. Designer không căn theo
ảnh chụp màn hình hoặc kích thước card của riêng một breakpoint.

```text
PROFILE BACKGROUND · 1920 × 640 · 3:1
┌──────────────────────────────────────────────────────────────┐
│ 20% crop-safe │        SAFE CONTENT 60%        │ 20% crop-safe │
│               │ avatar + tên      thống kê     │               │
└──────────────────────────────────────────────────────────────┘

FRAME COMPOSITION · 1024 × 1024
┌──────────────────────────────────────┐
│ companion anchor: x 90%, y 16%      │
│                                      │
│          avatar center               │
│          x 50%, y 50%                │
│          diameter 67%                │
└──────────────────────────────────────┘
```

#### Nền profile (`background`)

- Export chính xác `1920 × 640 px`, tỷ lệ `3:1`, WebP/AVIF.
- Safe area nội dung: `x=384..1536`, `y=64..576`.
- Hai vùng ngoài cùng, mỗi bên 20%, được phép bị crop trên mobile.
- Không đặt chữ, logo, nhân vật hoặc chi tiết bắt buộc đọc được ngoài safe area.
- Focal point mặc định: `50% 0%`; frontend dùng `background-position: center top`.
- Preview và thumbnail giữ tỷ lệ 3:1; không tạo bản vuông riêng.

#### Theme trang (`theme`)

- Export `1440 × 2160 px`, tỷ lệ dọc `2:3`.
- 70% chiều rộng trung tâm phải yên tĩnh để đặt card nội dung.
- Mép trên và dưới phải nối mềm hoặc chuyển về cùng một màu nền để có thể
  `repeat-y` trên trang dài.
- Không đặt một nhân vật lớn chính giữa; artwork trang trí ưu tiên hai mép.
- Mobile crop hai bên nhưng không được làm mất ý nghĩa của theme.
- Nếu chỉ gồm gradient/pattern, ưu tiên metadata token/CSS thay vì raster.

#### Avatar + frame + effect

- Avatar hiển thị trong đường tròn đường kính khoảng 67% canvas frame.
- Avatar, frame và effect dùng cùng canvas vuông và cùng tâm `x=50%`, `y=50%`.
- Artwork frame không được lấn vào vùng mặt trung tâm quá 3% đường kính avatar.
- Effect chỉ trang trí chu vi, không che mặt và không thay đổi tâm theo breakpoint.
- Cấp độ được frontend hiển thị thành chip cạnh tên và tự xuống dòng trên mobile.
- Preview không được tự đổi tâm/avatar hole so với primary.

#### Companion

- Canvas `512 × 512 px`, alpha thật; artwork chiếm 76–86% canvas.
- Anchor hiển thị là `x=90%`, `y=16%` tính trên canvas frame.
- Nhân vật phải nhìn vào trong composition; không kèm nền, sàn hoặc khung vuông.
- Không gộp companion vào file frame để vẫn có thể thay từng slot độc lập.

#### Responsive contract

| Viewport | Header | Nội dung profile |
|---|---|---|
| `375–767` | Avatar giữa; background crop hai bên | Một cột |
| `768–1023` | Avatar + tên; thống kê xuống hàng khi cần | Một hoặc hai cột |
| `≥1024` | Avatar/tên trái, thống kê phải | Main 2/3 + sidebar 1/3 khi có module |

Theme chỉ thay canvas trang. Background chỉ thay header. Frame, badge cấp,
companion, danh hiệu và effect luôn là các slot độc lập; một asset không được
vẽ gộp nội dung thuộc slot khác.

Pack nhận `.avif`, `.png`, `.svg`, `.webp`. Không để PSD, AI, `.DS_Store` hay
`__MACOSX` trong ZIP.

### Alpha và bố cục bắt buộc

- Badge, frame, plaque, companion và effect phải có alpha channel thật.
- JPEG không được dùng cho các loại cần transparency.
- Không vẽ checkerboard, nền trắng, nền đen hoặc nền màu để giả alpha.
- Companion chiếm 76–86% canvas và không có sàn studio hình chữ nhật.
- Effect giữ vùng tròn giữa 54–60% hoàn toàn trong suốt; hạt/glow chỉ nằm ở
  vành 60–94%, tổng vùng có opacity đáng kể không vượt 25% canvas.
- Theme không được chứa vật thể đơn lớn hơn 15% viewport; 70% vùng giữa phải yên
  tĩnh, low contrast và dùng được khi trang kéo dài.
- Theme có thể đi kèm JSON design token trong metadata của manifest, nhưng file
  hình chính vẫn là WebP và tuyệt đối không nhúng URL CDN/base64 vào JSON.
- Profile background và theme là hai slot khác nhau: background chỉ nằm trong
  profile card; theme phủ trang nhưng không cạnh tranh với card nội dung.

### Cách kiểm tra transparency

Mở file trên hai lớp nền đối lập: trắng và tím đậm. Nếu thấy ô caro, viền trắng,
khối vuông hoặc nền studio thì file không đạt. Công cụ export phải báo có alpha;
không chỉ dựa vào preview của công cụ generate.

## 4. Cấu trúc Reward Pack

```text
summer-cloud-event/
├── manifest.json
└── assets/
    ├── frame-cloud-summer.webp
    ├── frame-cloud-summer--plaque.svg
    ├── frame-cloud-summer--preview.webp
    └── frame-cloud-summer--thumbnail.webp
```

Quy tắc filename:

- Primary: `{assetId}.{ext}`
- Plaque: `{assetId}--plaque.{ext}`
- Preview: `{assetId}--preview.{ext}`
- Thumbnail: `{assetId}--thumbnail.{ext}`

Không thêm `final`, `new`, `v2` vào filename. Phiên bản nằm ở `pack.release`.

## 5. Manifest frame mẫu

```json
{
  "schemaVersion": 1,
  "pack": {
    "id": "summer-cloud-event",
    "name": "Sự kiện Mây Mùa Hè",
    "release": "2026.08.0",
    "channel": "event"
  },
  "rewards": [{
    "id": "frame-cloud-summer",
    "kind": "frame",
    "name": "Khung Mây Mùa Hè",
    "rarity": "rare",
    "assets": {
      "primary": "assets/frame-cloud-summer.webp",
      "plaque": "assets/frame-cloud-summer--plaque.svg",
      "preview": "assets/frame-cloud-summer--preview.webp",
      "thumbnail": "assets/frame-cloud-summer--thumbnail.webp"
    },
    "unlock": {
      "type": "achievement",
      "achievementId": "summer-first-flight"
    }
  }],
  "achievements": [{
    "id": "summer-first-flight",
    "name": "Chuyến Bay Đầu Tiên",
    "description": "Hoàn thành hành trình đầu tiên của sự kiện hè.",
    "points": 10,
    "requirements": {
      "metric": "event_quests_completed",
      "operator": "gte",
      "target": 1
    },
    "rewardIds": ["frame-cloud-summer"]
  }],
  "bundles": [{
    "id": "summer-cloud-profile",
    "name": "Bộ Mây Mùa Hè",
    "rewardIds": ["frame-cloud-summer"]
  }]
}
```

Achievement không bắt buộc có reward. Nếu có, `rewardIds` phải trỏ tới reward
hợp lệ theo quy tắc publisher.

## 6. Tạo và validate ZIP

Đứng trong thư mục pack để `manifest.json` nằm ở root ZIP:

```bash
cd summer-cloud-event
zip -r ../summer-cloud-event.reward-pack.zip manifest.json assets \
  -x "*/.DS_Store" "__MACOSX/*"
cd ..
```

Validate từ repository AI Kids:

```bash
npm run rewards:pack -w @aikids/web -- validate \
  ./summer-cloud-event.reward-pack.zip
```

CLI kiểm tra ID, release, filename, variant, liên kết reward/achievement/bundle,
file thừa và path nguy hiểm. Nếu validate fail, không upload.

## 7. Upload draft

```bash
STORYMEE_API_ORIGIN=https://api.storymee.com \
STORYMEE_STORAGE_ORIGIN=https://storage.storymee.com \
STORYMEE_ADMIN_TOKEN="$SHORT_LIVED_TOKEN" \
npm run rewards:pack -w @aikids/web -- upload \
  ./summer-cloud-event.reward-pack.zip
```

Luồng thực tế:

```text
Designer CLI
  → backend Ubuntu xác thực và tạo upload session
  → URL upload ngắn hạn
  → ZIP tới storage VPS Đức
  → backend Ubuntu finalize, validate và tạo draft
```

Không lưu token vào source code/Figma và không cấp MinIO key cho designer.

## 8. Preview và publish

Trong Admin → Reward Pack:

1. Mở draft vừa upload và đọc báo cáo validation.
2. Preview từng reward ở desktop và mobile.
3. Với frame, test `CẤP 1`, `CẤP 100` và label dài.
4. Kiểm tra bundle frame/background/theme/companion.
5. Reviewer approve; publisher mới được publish.

```text
uploaded → validating → ready_for_review → approved → published
```

## 9. Sửa reward đã publish

Không ghi đè release cũ. Ví dụ đang là `2026.08.0`:

1. Giữ nguyên `reward.id` nếu ý nghĩa vật phẩm không đổi.
2. Export lại đúng filename.
3. Tăng release thành `2026.08.1`.
4. Tạo ZIP mới, validate, upload và preview.
5. Publish catalog mới; giữ release cũ để rollback.

Nếu đổi loại/ý nghĩa vật phẩm, tạo reward ID mới.

## 10. Đổi CDN

Không sửa reward ID, manifest hoặc inventory. Deployment chỉ thay origin/release
trong `apps/web/public/runtime-config.js`. Không đưa CDN domain vào component,
achievement hoặc catalog record.

## 11. Lỗi thường gặp

- **Frame chỉ có vòng tròn:** thiếu `--plaque`; CLI từ chối.
- **Mây không bao hết CẤP 100:** plaque không có vùng giữa co giãn.
- **Preview có nhưng app không hiện:** catalog chưa publish assetId/release.
- **404 sau publish:** filename, extension hoặc variant không khớp manifest.
- **Upload xong chưa dùng được:** đây mới là draft, chưa review/publish.
- **Đổi CDN phải sửa code:** dữ liệu đã lưu URL thay vì `assetId`.

Tài liệu liên quan:

- `docs/REWARD_PACK_IMPORT_CONTRACT.md`
- `docs/REWARD_ASSET_CATALOG_CONTRACT.md`
- `docs/reward-pack.example.json`
- `docs/AG_REWARD_ASSET_PROMPTS.md`
