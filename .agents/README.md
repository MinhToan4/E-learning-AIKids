# AI Kids Agents Documentation

## Bugs đã fix gần đây
1. **Cookie proxy fix**: Đảm bảo browser luôn gọi qua proxy `/api` (không gọi trực tiếp backend) để cookie HttpOnly mang thông tin tiến trình học hoạt động chính xác.
2. **XP event missing xp+level**: Bổ sung `totalXp`, `level` trả về từ `submitCheck` và pass thẳng qua event `aikids:xp-updated`, giúp UI cập nhật tức thì qua `useProgression` thay vì chờ gọi API lại.
3. **persistJourneyStage 404**: Thêm guard `isLocalId` để chặn gọi `PUT /resume` với các curriculum local (`rule-*`, `bai-*`, `aiki-rules`).

## Data Sources
- Dữ liệu progression (XP, level) sử dụng `useProgression` hook làm Single Source of Truth, được đồng bộ qua event và delay query 2000ms.
- API Proxy: Vite (dev) / Vercel/Docker (prod) làm trung gian proxy requests bắt đầu bằng `/api/*`.

## Khi nào cần chạy test
Sau mỗi thay đổi logic hoặc types tại thư mục `apps/web`:
- Chạy kiểm tra kiểu (Typecheck): `cd apps/web && npm run typecheck`
- Chạy unit tests: `cd apps/web && npx vitest run --reporter=verbose`
*(Không dùng `pnpm --filter` từ root).*
