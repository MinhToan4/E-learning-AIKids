# Generated reward assets

Thả asset đã generate vào đúng thư mục và đặt **tên file bằng reward ID**.
Vite tự đưa file vào registry khi dev server restart hoặc production build.

```text
src/assets/rewards/
├── badges/
│   └── title-first-light.webp
├── frames/
│   ├── frame-cloud-summer.webp
│   └── frame-cloud-summer--plaque.webp
├── companions/
│   └── avatar-paco-blue.webp
├── backgrounds/
│   └── background-ai-gate.webp
├── themes/
│   └── theme-paco-workshop.webp
└── effects/
    └── perk-sticker-sparkle.webp
```

Quy tắc:

- Primary asset: `<reward-id>.webp` (ưu tiên), `.png`, `.svg` hoặc `.avif`.
- Level plaque tùy chọn: `<frame-id>--plaque.webp`.
- Không dùng dấu cách hoặc tên hiển thị tiếng Việt.
- Filename phải khớp `id` trong `REWARD_CATALOG` hoặc `code` trả về từ Reward Studio.
- Restart `npm run dev -w @aikids/web` sau khi thêm file mới.
- Nếu có nhiều extension cùng ID, chỉ giữ một file để tránh kết quả không xác định.
- Chạy `npm run assets:validate -w @aikids/web` trước khi bàn giao; production
  build cũng tự chạy bước này và từ chối filename sai, ID trùng hoặc file quá 4 MB.

Frontend không chứa fallback reward. Asset được publish lên storage theo release
bất biến và chỉ được truy cập qua `assetId`.

## Stable address và triển khai CDN/VPS

UI và dữ liệu chỉ lưu reward ID hoặc logical address:

```text
reward://frame-cloud-summer/primary
reward://frame-cloud-summer/plaque
```

Không lưu URL CDN hoặc đường dẫn file vào inventory. Khi dùng remote assets,
resolver tạo URL theo một quy ước duy nhất:

```text
{baseUrl}/rewards/{release}/{reward-id}.webp
{baseUrl}/rewards/{release}/{frame-id}--plaque.webp
{baseUrl}/rewards/{release}/{reward-id}--preview.webp
{baseUrl}/rewards/{release}/{reward-id}--thumbnail.webp
```

Ví dụ trên server:

```text
/srv/aikids-assets/
└── rewards/
    └── 2026.08.0/
        ├── frame-cloud-summer.webp
        └── frame-cloud-summer--plaque.webp
```

Sau khi build frontend, cấu hình bằng cách thay file `runtime-config.js`:

```js
window.__AIKIDS_RUNTIME_CONFIG__ = {
  rewardAssetBaseUrl: 'https://cdn.aikids.vn/aikids',
  rewardAssetRelease: '2026.08.0',
  rewardAssetFormat: 'webp',
}
```

Không cần rebuild JavaScript khi đổi domain CDN, VPS hoặc rollback release.
Nếu `rewardAssetBaseUrl` để trống, app sử dụng asset đã bundle trong Vite và
Nếu thiếu asset trong catalog hoặc release, UI bỏ qua ảnh và báo lỗi ở bước
preview/import; không tự suy đoán đường dẫn.

Mỗi release đã publish phải bất biến. Khi sửa artwork, tạo release mới rồi chỉ
đổi `rewardAssetRelease`; không ghi đè file của release cũ.
