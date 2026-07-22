# Hồ sơ năng lực 2.000 người dùng và kiến trúc Firebase

> **Hệ thống:** AI Kids Creator Academy  
> **Firebase project:** `storymee-35093`  
> **Ngày đối chiếu source và hạ tầng:** 22/07/2026 (Asia/Saigon)  
> **Phạm vi:** monorepo hiện tại, PostgreSQL/Supabase, Redis/BullMQ, Firebase và kịch bản k6  
> **Trạng thái:** AMBER — nền tảng đã có, chưa có bằng chứng chịu tải 2.000 người dùng  
> **Bảo mật:** tài liệu không chứa private key, database password, session token hoặc secret thật

Tài liệu này mô tả **đúng cấu trúc đang tồn tại trong repository**. Mọi số liệu chưa được đo đều được ghi là giả thuyết hoặc mục tiêu, không được trình bày như năng lực Production đã chứng minh.

Tài liệu go-live và bàn giao bảo mật chi tiết: [FIREBASE_PRODUCTION_HANDOVER.md](./FIREBASE_PRODUCTION_HANDOVER.md).

## 1. Kết luận điều hành

PostgreSQL/Supabase hiện là nguồn dữ liệu chuẩn của hệ thống. Redis phục vụ cache, distributed rate limit và BullMQ; Firebase được dùng có giới hạn cho Authentication bridge, Firestore projection realtime, Cloud Storage signed URL và Firebase Cloud Messaging. RabbitMQ không có trong source và không thuộc kiến trúc hiện tại.

Các kết quả đã xác minh:

- Domain/API/Web có 138 test đạt và build Production thành công tại lần kiểm tra gần nhất.
- PostgreSQL có 5 migration và schema hiện tại là up to date.
- Firebase Authentication và Firestore của project `storymee-35093` truy cập được bằng Admin SDK.
- Firestore Rules đã được phát hành với ruleset `7c413641-0aa8-40a0-bd39-af751cb5aec4`.
- Docker Compose hợp nhất base + Firebase override hợp lệ.
- Storage, Web Push và push queue đang tắt theo cơ chế fail-closed.

Chưa thể xác nhận hệ thống chịu được 2.000 người dùng vì:

- máy kiểm tra hiện chưa cài `k6` và chưa có kết quả chạy tải;
- chưa có topology Production, số API replica, CPU/RAM, Redis HA hoặc pool size được phê duyệt;
- kịch bản hiện tại chỉ đo một hành trình read-heavy, chưa đo write/progress, Firebase, upload, FCM hoặc AI generation;
- 2.000 VU không tương đương một RPS cố định; throughput phụ thuộc latency và thời gian sleep của script;
- Storage bucket, VAPID, App Check và observability Production chưa hoàn tất;
- service-account key từng xuất hiện trong hội thoại phải được rotate trước Production.

## 2. Quy ước trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| ✅ Verified | Có bằng chứng từ source và lệnh kiểm tra trực tiếp |
| 🟡 Implemented, not E2E | Code đã có nhưng thiếu hạ tầng hoặc kiểm thử end-to-end |
| ⛔ Blocked | Cần billing, credential, quyền quản trị hoặc quyết định vận hành |
| ⬜ Not implemented | Chưa có trong repository |
| 🎯 Target | Mục tiêu cần load test xác nhận, không phải hiện trạng |

## 3. Cấu trúc thực tế của repository

| Thành phần | Công nghệ/vai trò thực tế | Nguồn kiểm chứng |
|---|---|---|
| `apps/web` | React + Vite; gọi Fastify API; lazy-load Firebase Web SDK | `apps/web/src/shared/lib/firebase-client.ts` |
| `apps/api` | Fastify, session cookie, Prisma, RBAC, Firebase Admin | `apps/api/src/app.ts` |
| `packages/domain` | Luật nghiệp vụ thuần, không I/O/secret | `packages/domain/src/` |
| Database | PostgreSQL do Supabase quản lý; SQLite đã bị loại bỏ | `apps/api/prisma/schema.prisma`, `apps/api/src/config/env.ts` |
| Cache/rate limit | Redis nếu kết nối thành công; fallback in-memory cho single process | `apps/api/src/infrastructure/cache/` |
| Background push | BullMQ + Redis + worker riêng | `apps/api/src/modules/notification/`, `apps/api/src/workers/` |
| Firebase | Admin/Auth, Firestore, Storage signed URL, FCM | `apps/api/src/infrastructure/firebase/` và các module liên quan |
| Containers | 1 Redis, 1 API, 1 Web; thêm 1 push-worker khi bật profile `push` | `docker-compose.yml`, `docker-compose.firebase.yml` |

## 4. Kiến trúc hiện tại

```text
Browser / React Web
  │
  ├── cookie aikids_session (httpOnly) ───────────────┐
  │                                                   ▼
  │                                            Fastify API
  │                                              │   │   │
  │                                              │   │   ├── Firebase Admin
  │                                              │   │   │    ├── verify/custom token
  │                                              │   │   │    ├── Firestore projection
  │                                              │   │   │    ├── Storage signed URL
  │                                              │   │   │    └── FCM dispatch
  │                                              │   │   │
  │                                              │   │   └── Redis/BullMQ
  │                                              │   └────── PostgreSQL/Supabase
  │                                              │
  └── Firebase Web SDK ─ custom token/Firestore read/FCM token

Optional push worker ─ BullMQ/Redis ─ FCM
```

### 4.1 Nguồn dữ liệu chuẩn

PostgreSQL là source of truth cho:

- user, role, family, classroom và session;
- course, quest, enrollment và progress;
- XP, achievement, asset, project và approval;
- notification, FCM device registration và Storage ownership metadata.

Firestore chỉ chứa projection ngắn hạn của sự kiện lớp học. Không nhân đôi course, progress, RBAC, subscription hoặc payment sang Firestore.

### 4.2 Ranh giới tin cậy

- Browser không nhận `DATABASE_URL`, `JWT_SECRET` hoặc service-account credential.
- Web Firebase API key là public client configuration, không phải authorization secret.
- Browser chỉ ghi dữ liệu nghiệp vụ qua Fastify API.
- Firebase Admin bypass Firestore Security Rules; route RBAC và Google Cloud IAM vẫn là lớp bảo vệ bắt buộc.
- Storage client rules deny all; quyền upload/read được cấp bằng signed URL ngắn hạn sau khi API kiểm tra session/ownership.

## 5. Hiện trạng triển khai so với kiến trúc mục tiêu

### 5.1 Docker Compose đang có

Compose hiện tại tạo:

| Service | Số instance được khai báo | Ghi chú |
|---|---:|---|
| `redis` | 1 | `redis:7-alpine`, volume cục bộ; không phải HA |
| `api` | 1 | Fastify API, port 4000 |
| `web` | 1 | Web/Nginx, port 8080 |
| `push-worker` | 0 mặc định / 1 khi `--profile push` | Chỉ chạy khi profile được bật |

Repository **không khai báo** CDN/WAF, load balancer, autoscaling, 6–8 API replica, 2 worker, Redis managed/HA hoặc multi-zone. Các thành phần này là mục tiêu Production, không phải hiện trạng.

### 5.2 Kiến trúc mục tiêu cho 2.000 user

```text
Browser ─ CDN/WAF ─ Load balancer ─ N Fastify replicas
                                  ├── Supabase/PostgreSQL
                                  ├── managed Redis HA ─ BullMQ ─ M push workers
                                  └── Firebase Admin

Browser ─ signed PUT ─ Cloud Storage
Browser ─ read-only subscription ─ Firestore
FCM ─ Web service worker
```

`N`, `M`, CPU/RAM và connection pool **không được hard-code trong tài liệu** trước khi có baseline và load test. Quy trình đúng:

1. đo một API replica với resource limit giống Production;
2. xác định saturation point của CPU, event-loop, Prisma pool và database;
3. scale ngang từng bước;
4. xác nhận Redis/DB/Firebase quota không trở thành bottleneck;
5. chọn min/max replica và autoscaling threshold từ kết quả đo.

## 6. PostgreSQL, Prisma và connection pool

Trạng thái đã xác minh:

| Thuộc tính | Giá trị an toàn được phép ghi |
|---|---|
| Provider | PostgreSQL |
| Host class | Supabase shared pooler |
| Endpoint hiện dùng | `aws-0-ap-southeast-1.pooler.supabase.com:5432` |
| Pool mode theo tài liệu Supabase | Supavisor session mode |
| Schema | `public` |
| Migration | 5/5, up to date |
| Prisma explicit `connection_limit` | Chưa cấu hình trong URL |
| `DIRECT_URL` riêng cho migration | Chưa có trong Prisma schema/config |

File cũ gọi endpoint cổng 5432 là transaction pooler; điều này không đúng. Theo Supabase, shared pooler session mode dùng cổng 5432, transaction mode dùng cổng 6543. Với backend container chạy lâu dài, session mode có thể phù hợp khi cần IPv4, nhưng pool size vẫn phải đo theo compute tier và số replica.

Rủi ro capacity còn mở:

- Prisma v6 tự tạo application-side pool khi không có `connection_limit`; tổng connection tăng theo số process/replica.
- Chưa có số liệu Supabase compute tier, `max_connections`, Supavisor pool size hoặc pool wait.
- Migration hiện dùng cùng `DATABASE_URL`; chưa tách direct URL dành cho migrate/backup/admin tooling.
- Không được dùng lại giả định “10 connection/replica” nếu chưa đo và chưa kiểm tra giới hạn database.

Việc cần làm trước scale:

1. lấy giới hạn connection thật từ Supabase Dashboard/Observability;
2. đo `pg_stat_activity`, pool wait, query latency và slow query trong từng bậc tải;
3. quyết định `connection_limit`/`pool_timeout` cho Prisma từ số liệu;
4. đánh giá direct URL riêng cho migration theo hướng dẫn Supabase/Prisma;
5. bảo đảm tổng pool của API + worker + migration nhỏ hơn giới hạn database và có headroom vận hành.

## 7. Redis, session cache và rate limit

Luồng thực tế:

- Session nằm trong PostgreSQL; token hợp lệ được cache 5 phút.
- Khi Redis hoạt động, session cache và global rate limit dùng Redis.
- Rate-limit hook chạy ở `preHandler`, sau hook nạp session ở `onRequest`; key ưu tiên `user:{userId}`, nếu chưa đăng nhập mới dùng IP.
- `TRUST_PROXY=false` mặc định; chỉ bật khi request chắc chắn đi qua reverse proxy được kiểm soát.
- Nếu Redis không kết nối lúc khởi động, API fallback sang in-memory cache/rate limit theo từng process.

Đánh giá:

- Fallback in-memory phù hợp local/single instance, **không phù hợp multi-replica Production** vì quota và session cache không đồng nhất.
- Compose Redis hiện là single node và không cung cấp HA/failover.
- Push queue không chạy nếu thiếu Redis hoặc feature flag.
- Code hiện cho phép API tiếp tục khởi động với in-memory khi Redis lỗi; Production cần deployment gate/alert để không vô tình chạy nhiều replica trong trạng thái này.

## 8. Những năng lực đã có trong code

### 8.1 Tính toàn vẹn progress/XP

- Claim hoàn tất quest dùng `prisma.$transaction` và `updateMany` có điều kiện `status != completed`.
- Chỉ request claim thành công mới cộng XP, cập nhật level và mở quest tiếp theo.
- Retry song song không cộng XP hai lần.
- Badge/streak được tạo sau transaction cho request claim thành công; cần theo dõi khả năng partial failure sau commit và cân nhắc outbox nếu yêu cầu tuyệt đối nhất quán.

### 8.2 Query và index

- Asset có index `(userId, createdAt, id)`.
- Project có index `(userId, updatedAt, id)`.
- Notification có index `(pushStatus, pushNextAttemptAt)` và `(userId, read)`.
- Portfolio/backpack dùng cursor pagination.
- Achievement service gom các aggregate/query song song và tránh truy vấn theo từng course.

### 8.3 Authentication bridge

| Method | Endpoint | Trạng thái |
|---|---|---|
| `POST` | `/api/auth/login/firebase` | Verify ID token, account link/create; chưa E2E với StoryMee client thật |
| `POST` | `/api/auth/firebase/custom-token` | Tạo custom token từ app session |
| `GET` | `/api/auth/firebase/config` | Trả public config, không trả private credential |

Student không được đăng nhập bằng Firebase SSO; luồng nickname/PIN được giữ nguyên. Logout/chuyển child ngắt Firebase session và device token để giảm rủi ro thiết bị dùng chung.

### 8.4 Firestore projection

| Thành phần | Hiện trạng |
|---|---|
| Server publish endpoint | `POST /api/realtime/classrooms/:classId/events` |
| Server authorization | Teacher sở hữu classroom hoặc Admin |
| Client write | Bị deny |
| Client read | Theo `classId/classIds`, teacher ownership hoặc Admin claim |
| Retention field | `expiresAt`, thời hạn code đặt là 24 giờ |
| TTL policy trên project | Chưa xác minh active |
| Web consumer sản phẩm | Chưa có screen/component sử dụng helper subscription |

`subscribeToClassroomEvents()` đã tồn tại trong Firebase client nhưng chưa được gọi từ feature UI. Vì vậy realtime infrastructure đã có, tính năng sản phẩm chưa hoàn tất end-to-end.

Custom token của teacher hiện chỉ nạp tối đa 20 classroom active (`take: 20`). Teacher có trên 20 lớp sẽ không có claim cho các lớp còn lại và Firestore Rules sẽ từ chối read. Trước khi mở rộng vượt giới hạn này cần thiết kế lại authorization projection; không nên tăng claim không giới hạn vì token cũng có giới hạn kích thước.

### 8.5 Cloud Storage

| Endpoint | Chức năng |
|---|---|
| `POST /api/storage/uploads` | Validate metadata/ownership, tạo signed V4 write URL 15 phút |
| `POST /api/storage/uploads/:id/finalize` | Kiểm tra object metadata thật, xóa object không khớp |
| `GET /api/storage/uploads/:id/read-url` | Signed read URL 10 phút cho owner |

Policy hiện có:

- avatar tối đa 5 MiB;
- portfolio tối đa 25 MiB;
- classroom tối đa 15 MiB;
- MIME allowlist theo purpose;
- object path do server tạo dưới `users/{userId}/...`;
- Storage Rules deny mọi client request trực tiếp.

Trạng thái: code backend đã có nhưng bucket chưa được provision, Storage env còn trống và Web chưa có consumer cho `/api/storage/*`. Cần Blaze plan, quyết định location, bucket, billing alert, deploy rules, cleanup lifecycle và E2E trước khi bật.

### 8.6 Firebase Cloud Messaging

Đã có:

- đăng ký/xóa device token theo app session;
- `tokenHash` SHA-256 unique, raw token chỉ nằm server-side;
- service worker background và listener foreground;
- polling notification dự phòng 5 phút khi tab visible;
- BullMQ `jobId=notificationId`, 5 attempts, exponential backoff 2 giây;
- batch tối đa 500 token/lần;
- disable invalid/unregistered token;
- retry transient/quota error và không retry permanent error.

Trạng thái: `FIREBASE_WEB_VAPID_KEY` trống, `FIREBASE_PUSH_ENABLED=false`, push queue disabled và chưa E2E trên browser thật.

### 8.7 AI generation

Các đường generation trong progress vẫn gọi adapter trong request và phụ thuộc latency/quota Vidtory. Chưa có generation queue/worker chung trả `202 Accepted`. Đây là một capacity boundary riêng và **không được coi là đã giải quyết bởi FCM push worker**.

## 9. Trạng thái Firebase `storymee-35093`

Kết quả `npm run firebase:check -w @aikids/api` ngày 22/07/2026:

| Check | Kết quả |
|---|---|
| `projectId` | `storymee-35093` |
| Authentication reachable | ✅ `true` |
| Firestore reachable | ✅ `true` |
| Storage configured | ⛔ `false` |
| Storage reachable | ⛔ `false` |
| Web Push configured | ⛔ `false` |
| Push queue enabled | ⛔ `false` |

Các kết quả này chứng minh Admin connectivity, không chứng minh browser E2E, IAM least privilege, Firestore Rules cho mọi role hoặc capacity/quota.

### Cảnh báo credential bắt buộc

Service-account private key đã từng được gửi trong hội thoại. Phải coi key đó là compromised và rotate/delete trước Production. Không được dùng kết quả connectivity hiện tại để chấp nhận key cũ.

`FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` chứa **base64 encoding, không phải mã hóa**. Giá trị này vẫn là critical secret và phải được inject bằng protected environment/secret mechanism; không commit vào Git, Docker image, frontend hoặc tài liệu.

## 10. Kịch bản k6 thực tế

Source: `load/k6-2000.js`.

### 10.1 Hành vi hiện tại

Với `MAX_VUS=2000`, script chạy:

| Giai đoạn | Thời lượng | Target VU |
|---|---:|---:|
| Ramp 1 | 2 phút | 200 |
| Ramp 2 | 5 phút | 1.000 |
| Ramp 3 | 5 phút | 2.000 |
| Hold | 10 phút | 2.000 |
| Ramp down | 3 phút | 0 |

Mỗi iteration:

1. `GET /api/courses`;
2. `GET /api/notifications?limit=15`;
3. mỗi 3 iteration gọi thêm `GET /api/backpack?limit=40`;
4. sleep ngẫu nhiên 2–6 giây.

Health chỉ được gọi một lần trong `setup()`. Script không kiểm thử login, progress write, completion concurrency, Firebase Auth, Firestore subscription, Storage, FCM hoặc generation.

### 10.2 VU không phải RPS

`ramping-vus` là closed-model executor: mỗi VU lặp nhanh/chậm theo thời gian response và sleep. Do đó file không được khẳng định “2.000 VU = 200–500 RPS” hoặc “burst 1.000 RPS” trước khi đo. Nếu cần giữ request rate chính xác, phải bổ sung một scenario arrival-rate riêng.

### 10.3 Session data

Script mặc định đọc `load/session-tokens.json` thông qua đường dẫn `./session-tokens.json` tương đối với file script. File này đã được `.gitignore`.

Không dùng:

```bash
-e SESSION_TOKENS_FILE=./load/session-tokens.json
```

vì k6 resolve relative path từ thư mục chứa script và có thể thành `load/load/session-tokens.json`.

Dùng mặc định:

```bash
k6 run -e BASE_URL=https://staging.example.com -e MAX_VUS=100 load/k6-2000.js
```

Hoặc override đúng relative path:

```bash
k6 run -e BASE_URL=https://staging.example.com \
  -e SESSION_TOKENS_FILE=./session-tokens.json \
  -e MAX_VUS=100 load/k6-2000.js
```

Để mô phỏng 2.000 user thực, file nên có 2.000 session token staging thuộc 2.000 test user khác nhau. Nếu tái sử dụng ít token, rate limit theo `userId` và cache hit pattern sẽ làm kết quả sai lệch.

### 10.4 Threshold đang được code hóa

| Metric | Threshold |
|---|---|
| HTTP failed rate | `< 1%` |
| Tổng p95 | `< 500 ms` |
| Tổng p99 | `< 1.200 ms` |
| Health p95 | `< 150 ms` |
| Courses p95 | `< 400 ms` |
| Notifications p95 | `< 400 ms` |
| Backpack p95 | `< 600 ms` |
| Check pass rate | `> 99%` |

Đây là acceptance target của script, chưa phải SLO được chứng minh hoặc Product phê duyệt.

## 11. Kế hoạch kiểm thử 2.000 user đúng cách

### 11.1 Điều kiện trước khi chạy

- [ ] Cài k6 trên load-generator độc lập; máy hiện tại chưa có lệnh `k6`.
- [ ] Staging dùng image, resource limit và topology gần Production.
- [ ] Có 2.000 test users/session tokens; không dùng dữ liệu trẻ em hoặc Production secrets.
- [ ] Redis bắt buộc hoạt động; không chấp nhận in-memory fallback khi multi-replica.
- [ ] Có dashboard API/Node/DB/Redis/BullMQ/Firebase và đồng bộ thời gian.
- [ ] Có billing/quota guard và xác nhận không gọi vendor AI ngoài ý muốn.
- [ ] Backup/restore staging đã kiểm tra.

### 11.2 Các bậc tải

Chạy từng mức độc lập và chỉ tăng khi mức trước đạt:

```bash
k6 run -e BASE_URL=https://staging.example.com -e MAX_VUS=100  load/k6-2000.js
k6 run -e BASE_URL=https://staging.example.com -e MAX_VUS=500  load/k6-2000.js
k6 run -e BASE_URL=https://staging.example.com -e MAX_VUS=1000 load/k6-2000.js
k6 run -e BASE_URL=https://staging.example.com -e MAX_VUS=2000 load/k6-2000.js
```

Mỗi lệnh dùng stage tỷ lệ 10%/50%/100% của `MAX_VUS` và giữ target tối đa 10 phút. Không chạy 2.000 VU trực tiếp trên Production.

### 11.3 Chỉ số phải thu thập

- k6: VUs, RPS thực tế, p50/p95/p99, failure, checks, iteration duration;
- API: CPU/RAM, event-loop lag, GC, request concurrency, 4xx/5xx theo route;
- Prisma/PostgreSQL: active/idle connections, pool wait, query p95, locks, slow query, CPU/IO;
- Redis: latency, reconnect, memory, eviction, ops/sec;
- BullMQ: waiting/active/failed, retry rate, oldest job age;
- Firebase: Auth/Firestore/Storage/FCM errors, denied reads, operations và quota;
- load generator: CPU/RAM/network để bảo đảm k6 không tự trở thành bottleneck;
- Vidtory: latency, 429, quota và cost nếu chạy profile generation riêng.

### 11.4 Stop conditions

Dừng tăng tải khi xảy ra một trong các điều kiện:

- error rate vượt 1% trong 5 phút;
- p95 vượt 500 ms liên tục 5 phút ở read-heavy profile;
- database pool wait/connection rejection tăng liên tục;
- Redis reconnect/eviction hoặc API rơi về in-memory;
- BullMQ backlog không giảm sau khi ngừng tạo job;
- invariant nghiệp vụ bị vi phạm, ví dụ double XP hoặc đọc sai ownership;
- Firebase/vendor trả quota error bất thường;
- load generator đạt saturation.

### 11.5 Test profile còn phải bổ sung

| Profile | Hiện trạng |
|---|---|
| Read-heavy learner journey | Có |
| Controlled RPS/arrival-rate | Chưa có |
| Login/session churn | Chưa có |
| Progress write + atomic completion | Chưa có |
| Teacher/admin RBAC | Chưa có |
| Firestore publish/subscription | Chưa có |
| Storage signed upload/finalize/read | Chưa có và đang bị bucket block |
| FCM queue/worker delivery | Chưa có và đang bị VAPID block |
| AI generation soak/quota | Chưa có |
| Redis/DB/Firebase degradation | Chưa có |

## 12. Quy trình deploy khớp source hiện tại

### 12.1 Preflight

```powershell
npm ci
npm run test:all
npm run build
npm run firebase:check -w @aikids/api
docker compose -f docker-compose.yml -f docker-compose.firebase.yml config --quiet
```

### 12.2 Migration một lần

Entrypoint hỗ trợ `PROCESS_ROLE=migrate`. Với Compose hiện tại:

```powershell
docker compose -f docker-compose.yml -f docker-compose.firebase.yml run --rm `
  -e PROCESS_ROLE=migrate api
```

Không chạy `prisma db push` trong Production và không chạy migration đồng thời trên mọi API replica.

### 12.3 Khởi động core API/Web

```powershell
docker compose -f docker-compose.yml -f docker-compose.firebase.yml up --build
```

Lệnh này chạy single-host development/staging topology, không chứng minh HA hoặc capacity 2.000 user.

### 12.4 Bật push sau khi hoàn tất VAPID/E2E

Đặt `FIREBASE_PUSH_ENABLED=true`, bảo đảm Redis và credential mới hoạt động, sau đó:

```powershell
docker compose -f docker-compose.yml -f docker-compose.firebase.yml `
  --profile push up --build
```

### 12.5 Firebase Rules và TTL

- Firestore Rules source: `firebase/firestore.rules`.
- Storage Rules source: `firebase/storage.rules`.
- `firebase.json` trỏ đúng hai file trên.
- Repository chưa pin `firebase-tools`; CI cần pin phiên bản CLI trước khi tự động deploy rules.
- TTL cần tạo cho collection group `events`, field `expiresAt`; enablement phải được kiểm tra tới trạng thái active.
- Storage Rules chỉ deploy sau khi bucket thật được tạo.

## 13. Rollback và degradation

| Sự cố | Hành động an toàn | Tác động còn lại |
|---|---|---|
| FCM/worker lỗi | `FIREBASE_PUSH_ENABLED=false`, dừng worker | Notification PostgreSQL/polling vẫn hoạt động |
| Storage lỗi | Giữ bucket env trống/tắt feature | Upload Firebase trả 503; core learning không mất dữ liệu |
| Firestore lỗi | Dừng publish/realtime; không mở Rules public | PostgreSQL core vẫn là source of truth |
| Redis lỗi | Dừng scale/rollout, khôi phục Redis | Single process có thể fallback; multi-replica không được tiếp tục như bình thường |
| Firebase toàn phần lỗi | Có thể đặt `FIREBASE_ENABLED=false` | Firebase SSO/custom token/realtime/storage/push ngừng; user chỉ có Firebase SSO có thể không đăng nhập bằng password |
| App release lỗi | Rollback image digest | Migration additive giữ nguyên; ưu tiên forward-fix schema |

Không dùng public Firestore/Storage Rules, `db push --force-reset` hoặc xóa migration để chữa sự cố.

## 14. Danh sách chặn Production

### P0 — Security

- [ ] Rotate/delete service-account key đã xuất hiện trong hội thoại.
- [ ] Review IAM least privilege vì Admin SDK bypass Security Rules.
- [ ] Bật secret scanning và audit alert cho IAM/key changes.
- [ ] Không gọi base64 là encryption hoặc lưu nó trong tracked `.env`.

### P1 — Capacity/operations

- [ ] Cài k6 và chạy đủ 100/500/1.000/2.000 VU trên staging.
- [ ] Xác định số replica/resource/pool từ kết quả, không dùng giả định 6–8 replica.
- [ ] Thiết lập managed Redis HA và ngăn multi-replica chạy với in-memory fallback.
- [ ] Kiểm tra Supabase pool size/max clients/connection headroom.
- [ ] Dashboard, alert, on-call, backup/restore và rollback rehearsal.

### P1 — Firebase

- [ ] Tạo Storage bucket sau khi duyệt Blaze/location/budget alert.
- [ ] Deploy Storage Rules và E2E signed upload.
- [ ] Tạo VAPID, bật worker và E2E foreground/background/token rotation.
- [ ] Bật Firestore TTL `events.expiresAt` và kiểm tra active.
- [ ] Tích hợp realtime helper vào feature UI nếu thuộc release scope.
- [ ] Tích hợp App Check, chạy monitor trước rồi mới enforce.

### P2 — Test coverage và tối ưu

- [ ] Bổ sung controlled-RPS và write-heavy k6 profiles.
- [ ] Bổ sung Firestore Rules emulator tests cho mọi role.
- [ ] Tách/đánh giá direct DB URL cho migration.
- [ ] Thêm cleanup job/lifecycle cho Storage pending/orphan.
- [ ] Thiết kế generation queue/outbox nếu AI workload đồng loạt thuộc scope.
- [ ] Giải quyết 6 advisory moderate khi Firebase/Google Cloud dependency tree có bản vá tương thích; không `npm audit fix --force` để downgrade major.

## 15. Definition of Done cho tuyên bố “hỗ trợ 2.000 người dùng”

Chỉ được công bố hệ thống hỗ trợ 2.000 người dùng khi có đủ:

1. báo cáo k6 từ commit/image release, gồm RPS thực, p95/p99/error và resource graphs;
2. 2.000 test user/session riêng biệt hoặc mô hình workload được phê duyệt tương đương;
3. DB/Redis/Firebase quota và connection headroom sau khi giữ tải tối đa;
4. không vi phạm RBAC, ownership, idempotency và không double XP;
5. các Firebase capability được bật đều có E2E và degradation test;
6. topology Production, autoscaling, alert và rollback đã được diễn tập;
7. key đã lộ bị thu hồi và security checklist đạt;
8. Product/Engineering/Security/Platform ký duyệt kết quả.

## 16. Nguồn chính thức dùng để đối chiếu

- [Supabase — chọn direct/session/transaction connection](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Prisma PostgreSQL connector và connection pool parameters](https://docs.prisma.io/docs/orm/v6/overview/databases/postgresql)
- [Firebase Admin SDK setup](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules — Admin/server SDK bypass rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore TTL policies](https://firebase.google.com/docs/firestore/ttl)
- [Cloud Storage for Firebase setup](https://firebase.google.com/docs/storage/web/start)
- [Firebase App Check for Web](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [Firebase Cloud Messaging error codes](https://firebase.google.com/docs/cloud-messaging/error-codes)
- [Grafana k6 ramping-vus](https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/ramping-vus/)
- [Grafana k6 arrival-rate allocation](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/arrival-rate-vu-allocation/)
- [Grafana k6 large tests](https://grafana.com/docs/k6/latest/testing-guides/running-large-tests/)
- [Google Cloud service-account key security](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)

---

**Quyết định hiện tại:** tài liệu và source xác nhận hệ thống có nền tảng để tiến tới 2.000 user, nhưng chưa có quyền tuyên bố năng lực đó. Bước tiếp theo đúng là rotate credential, hoàn thiện staging/observability, chạy load test theo bậc và dùng kết quả để quyết định replica, pool và quota.
