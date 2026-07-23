# AI Kids Creator Academy

React frontend cho hệ thống StoryMee. Browser chỉ gọi
`VITE_API_URL` (mặc định `https://dev-hub.storymee.com`); Hub xác thực và chuyển
tiếp tới `core-account-api`, `core-lms-api`, `core-billing-api`,
`core-notification-api`, `core-gamification-api`, `core-media-api`,
`core-job-api` và `core-system-api`.

`apps/api` là mã nguồn lịch sử từ upstream, không còn nằm trong npm workspace,
không được build/deploy và không sở hữu database. Source of truth duy nhất là
PostgreSQL Ubuntu `omni_db.public` do các core service StoryMee quản lý.

## Chạy frontend

```bash
cp .env.example .env
npm install
npm run dev
```

## Kiểm tra

```bash
npm test
npm run build
```

Firebase/FCM được giữ ở trạng thái tùy chọn cho tới khi provider production được
cấu hình. Google GIS trực tiếp đã đi qua `core-account-api`.
