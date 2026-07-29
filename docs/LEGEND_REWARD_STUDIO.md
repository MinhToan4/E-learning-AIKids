# Legend & Reward Studio

Trang quản trị: `/admin/legends`.

## Phạm vi

- Reward: frame, background, companion, effect, theme, title, avatar, perk và vé sự kiện.
- Chapter: nội dung, hình ảnh và display config cho Storybook.
- Event: metadata, lịch và cấu hình hoạt động theo mùa.

Ba loại dùng chung catalog/version/workflow, nhưng dùng ba editor khác nhau:

- Reward Designer dùng asset template, slot và layer.
- Storybook Chapter Editor dùng spread hai trang, mã trang, nhóm hành trình,
  màu trang, lời kể và đúng 9 sticker (sticker thứ 9 là Boss). Admin có thể
  upload riêng ảnh bìa, background trang trái và texture trang sticker.
- Event Builder dùng banner, thời gian bắt đầu/kết thúc, luật tham gia và reward
  pool. Event không dùng layer avatar và Chapter không dùng template Reward.

Chapter đã publish có thể override P01–P08 theo `slug`, hoặc thêm trang mới từ
P09 trở đi. Client chỉ nhận chapter mới khi có `story` và đúng 9 sticker.

Mỗi sticker hỗ trợ:

- `imageUrl`: PNG/WebP/SVG nền trong suốt, hiển thị sau khi đã đạt.
- `placeholderUrl`: silhouette/outline cùng kích thước và hình dáng, hiển thị
  khi chưa đạt.
- `icon`: emoji fallback nếu chưa có asset riêng.
- `unlockRule`: điều kiện máy thực thi gồm `metric`, `operator: gte` và `target`.

Runtime giữ nguyên slot của sticker: trạng thái locked render `placeholderUrl`,
trạng thái unlocked thay trực tiếp bằng `imageUrl`, không thay đổi kích thước
card. Vì vậy designer phải xuất cặp placeholder/sticker trên cùng một canvas
vuông, cùng padding và cùng tâm ảnh.

### Điều kiện mở sticker

Admin chọn một trong các metric đã có projection thật:

- `lessons_completed`: số bài học hoàn thành lần đầu từ LMS.
- `courses_completed`: số khóa học hoàn thành từ LMS.
- `stars`: tổng sao trong lesson completion ledger.
- `streak`: chuỗi ngày học hiện tại.
- `xp`: tổng XP hệ sinh thái.
- `level`: cấp XP hiện tại.

Backend đọc rule của mọi Chapter đã publish, tính metric từ XP ledger và
Gamification Profile, rồi hợp nhất kết quả với achievement/sticker cũ thành
`earnedStickerIds`. `hint` chỉ là câu thân thiện cho trẻ; `unlockRule` mới là
nguồn quyết định.

Boss sticker luôn dùng `chapter_regular_stickers >= 8`. Khi claim, backend kiểm
tra đủ 8 sticker thường, cấp `content.rewardId`, lưu boss sticker và tạo social
activity. Chapter động dùng mã `Pxx` và có cùng quy trình với P01–P08.

## Workflow

`draft → review/scheduled → published → retired`

Nội dung đã publish là immutable. Muốn sửa, admin tạo cùng `code`; backend tự
tăng `version`. Khi publish version mới, version published cũ chuyển sang
`retired`, nhưng asset và inventory cũ vẫn được giữ để không làm hỏng Profile.

## Template asset bắt buộc

| Reward | Kích thước | Định dạng | Dung lượng | Nền / vùng an toàn |
| --- | ---: | --- | ---: | --- |
| Background | 1600×1200 | WebP, JPG, PNG | 3 MB | Được phủ kín; giữ vùng giữa 60% thoáng |
| Avatar | 1024×1024 | WebP, PNG, JPG | 2 MB | Mặt trong vòng tròn giữa 72% |
| Frame | 1024×1024 | PNG, WebP | 2 MB | Bắt buộc trong suốt; giữa trống tối thiểu 58% |
| Companion | 512×512 | PNG, WebP | 1.5 MB | Bắt buộc trong suốt; chừa 5% mỗi cạnh |
| Effect | 1024×1024 | WebM, WebP, PNG | 4 MB | Trong suốt; không che vùng mặt giữa 50% |
| Title | 1200×320 | PNG, WebP | 1.5 MB | Trong suốt; chừa vùng chữ giữa 70%×55% |
| Theme | 1600×1200 canvas | JSON | 0.5 MB | Chỉ token màu/font, không nhúng base64 |
| Event ticket | 1200×675 | WebP, JPG, PNG | 2 MB | Chừa 20% bên trái cho text |
| Perk badge | 512×512 | PNG, WebP | 1 MB | Trong suốt; icon trong vùng giữa 80% |

Studio kiểm tra MIME, dung lượng và kích thước pixel trước khi upload. Với asset
ảnh cần trong suốt, UI còn kiểm tra kênh alpha. URL Media được lưu trong
`assets` của version, không lưu binary trong Gamification database.

## Quy tắc kết hợp reward

Mỗi loại dùng một `slot`; một profile chỉ được trang bị tối đa một reward trong
mỗi slot. Thứ tự render từ dưới lên:

1. layer 0: `profile_background`
2. layer 10: `profile_theme`
3. layer 20: `profile_avatar`
4. layer 30: `avatar_frame`
5. layer 40: `avatar_companion`
6. layer 50: `avatar_effect`
7. layer 60: `profile_title` hoặc `perk_badge`

Background là lớp duy nhất được phép phủ kín canvas. Frame, companion và effect
phải trong suốt; effect không được che safe area khuôn mặt. Khi admin đổi loại
reward, Studio tự sinh lại `displayConfig` gồm `slot`, `layer`, `canvas`,
`transparent` và `fit` để client render thống nhất.

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
