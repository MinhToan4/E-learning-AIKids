# Legend & Reward Studio

Trang quản trị: `/admin/legends`.

## Phạm vi

- Reward: frame, background, companion, effect, theme, title, avatar, perk và vé sự kiện.
- Chapter: nội dung, hình ảnh và display config cho Storybook.
- Event: metadata, lịch và cấu hình hoạt động theo mùa.

## Workflow

`draft → review/scheduled → published → retired`

Nội dung đã publish là immutable. Muốn sửa, admin tạo cùng `code`; backend tự
tăng `version`. Khi publish version mới, version published cũ chuyển sang
`retired`, nhưng asset và inventory cũ vẫn được giữ để không làm hỏng Profile.

## Asset

Studio upload asset qua Core Media. Định dạng UI chấp nhận PNG, WebP, JPEG, SVG,
Lottie JSON và WebM. URL Media được lưu trong `assets` của version, không lưu
binary trong Gamification database.

## Cấu hình

- `displayConfig`: glow, intensity, anchor, animation preset, `equipValue`.
- `unlockRule`: `xp_level`, `storybook_sticker` hoặc `event`.
- `content`: dữ liệu riêng của Chapter/Event, ví dụ `slug`, `story`, lịch và
  weekly prompt.

Client chỉ tải record `published`. Reward XP-level published được đồng bộ vào
inventory khi trẻ đọc Storybook/Reward projection.

## API

- `GET /api/v1/gamification/catalog`
- `GET /api/v1/gamification/admin/studio`
- `POST /api/v1/gamification/admin/studio`
- `PUT /api/v1/gamification/admin/studio/:id`
- `POST /api/v1/gamification/admin/studio/:id/publish`
- `POST /api/v1/gamification/admin/studio/:id/retire`

Các endpoint admin yêu cầu JWT actor `admin`; catalog published dành cho client
đã đăng nhập.
