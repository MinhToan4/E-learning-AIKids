# AI Kids Creator Academy

Frontend React + Vite của hệ sinh thái StoryMee. Browser chỉ gọi StoryMee Hub;
repo này không chứa API server, Prisma schema hay database.

## Chạy local

Yêu cầu Node.js 22+ và StoryMee Hub ở `http://127.0.0.1:5100`.

```powershell
npm ci
npm run dev
```

Vite phục vụ web tại `http://localhost:5173` và proxy `/api/*` sang Hub. Khi
deploy khác origin, cấu hình `VITE_API_URL` bằng origin HTTPS của Hub.

## Kiểm tra

```powershell
npm test
npm run typecheck
npm run build
```

## Cấu trúc

- `apps/web`: ứng dụng production.
- `apps/landing`: landing page tĩnh, không tham gia npm workspace.
- `.agents/skills`: hướng dẫn FE, domain, security và UI cho coding agents.
- `docs`: tài liệu sản phẩm/FE còn hiệu lực.

Logic dùng chung với backend thuộc core services tương ứng. FE chỉ giữ các
helper trình bày thuần client thực sự được UI sử dụng.
