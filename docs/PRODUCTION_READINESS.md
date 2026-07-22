# Production readiness — AI Kids Creator Academy

## Điều đã có trong mã nguồn

- Fastify, Helmet, CORS allow-list, cookie phiên `httpOnly`, RBAC theo route.
- Redis dùng chung cho session cache và rate limit; fallback bộ nhớ chỉ phù hợp local.
- PostgreSQL/Supabase, index cho tiến trình và biểu đồ; các danh sách admin đều có giới hạn.
- Truy vấn lớp/phụ huynh dùng aggregate theo nhóm, không chạy một query cho từng trẻ.
- Nội dung và sản phẩm của trẻ mặc định riêng tư; không trả bảng xếp hạng hoặc danh tính chéo lớp.

## Ngưỡng nghiệm thu đề xuất

Chạy trên staging giống production, với dữ liệu gần dung lượng thật:

```powershell
$env:LOAD_URL='https://staging.example.com/api/health'
$env:LOAD_CONCURRENCY='1000'
$env:LOAD_REQUESTS='20000'
npm run load:smoke
```

Sau health check, chạy lại trên một endpoint đăng nhập sẵn bằng `LOAD_COOKIE` (không đưa cookie vào log). Điều kiện tối thiểu:

- không có lỗi transport hoặc HTTP 5xx;
- p95 đọc catalog/progress dưới 500 ms, p99 dưới 1.000 ms;
- CPU mỗi replica dưới 70%, pool DB không cạn, Redis không eviction;
- rate limit 429 chỉ xuất hiện đúng theo chính sách, không do lỗi ứng dụng;
- theo dõi ít nhất 30 phút để phát hiện rò bộ nhớ và kết nối.

## Điều kiện để cam kết 1.000 người đồng thời

Docker Compose hiện là cấu hình local một replica, không phải bằng chứng chịu tải. Production cần load balancer, tối thiểu hai API replica stateless, Redis managed, Postgres connection pooler, autoscaling theo CPU/latency và giám sát p95/5xx/pool saturation. Chỉ cam kết sau khi báo cáo tải staging vượt các ngưỡng trên; không suy ra năng lực production từ build hoặc unit test.
