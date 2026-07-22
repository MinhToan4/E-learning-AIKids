# Hồ sơ tổng kết và bàn giao Firebase Production

> **Hệ thống:** AI Kids Creator Academy  
> **Firebase project:** `storymee-35093`  
> **Ngày kiểm tra:** 22/07/2026 (Asia/Saigon)  
> **Phạm vi:** Git working tree hiện tại, Backend Fastify/Prisma, Frontend React, PostgreSQL/Supabase, Firebase Authentication, Cloud Firestore, Cloud Storage, Firebase Cloud Messaging, Redis/BullMQ và Docker  
> **Phân loại:** Nội bộ — không chứa private key, service-account JSON hoặc giá trị secret

## 1. Kết luận điều hành

Trạng thái tổng thể hiện tại là **AMBER — đã hoàn tất nền tảng kỹ thuật nhưng chưa đủ điều kiện phát hành toàn bộ tính năng Firebase lên Production**.

Các phần đã được xác minh hoạt động:

- Firebase Admin SDK đọc credential từ biến môi trường `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`; runtime không phụ thuộc đường dẫn file nằm ngoài dự án.
- Kết nối thật tới Firebase Authentication và Cloud Firestore của project `storymee-35093` thành công.
- Firestore Security Rules đã được phát hành; ruleset đang ghi nhận là `7c413641-0aa8-40a0-bd39-af751cb5aec4`.
- PostgreSQL có đủ 5 migration và trạng thái schema là up to date.
- Toàn bộ 138 test đã đạt: Domain 62, API 53, Web 23.
- Toàn bộ Domain, API và Web đã build Production thành công.
- `git diff --check` đạt; không phát hiện private key hoặc credential Firebase thật trong các file được Git theo dõi.

Các cổng chặn Production chưa hoàn tất:

1. **P0 — phải thu hồi/xoay vòng service-account key hiện tại.** Private key đã từng được gửi trực tiếp trong hội thoại, vì vậy phải coi là credential đã lộ. Không được tiếp tục dùng key này cho Production.
2. **P1 — Cloud Storage chưa có bucket.** Project cần bật billing Blaze, chọn location và tạo bucket trước khi kiểm thử upload end-to-end hoặc phát hành Storage Rules.
3. **P1 — Web Push chưa có VAPID key.** `FIREBASE_PUSH_ENABLED=false`, worker push chưa được bật và chưa thể kiểm thử FCM end-to-end trên trình duyệt thật.
4. **P1 — chưa chạy tải thực tế 2.000 người dùng**, chưa có số liệu độ trễ, error rate và giới hạn tài nguyên Production.
5. **P1 — App Check, giám sát/alert Production, TTL Firestore và pipeline CI/CD chưa được cấu hình/xác minh đầy đủ.**

Vì vậy, không nên tuyên bố hệ thống “hoàn tất 100%” hoặc “đảm bảo ổn định Production” cho tới khi toàn bộ mục bắt buộc trong [Go-live checklist](#15-go-live-checklist) được đóng bằng bằng chứng. Core API có thể tiếp tục chạy an toàn vì các tính năng Firebase chưa cấu hình đều **fail-closed**.

## 2. Quy ước trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| ✅ Đã xác minh | Có mã nguồn, cấu hình và bằng chứng kiểm tra trực tiếp |
| 🟡 Hoàn tất mã nguồn | Code đã có nhưng còn phụ thuộc hạ tầng hoặc E2E Production |
| ⛔ Bị chặn | Không thể hoàn tất nếu chưa có quyết định/quyền quản trị/billing |
| ⬜ Chưa thực hiện | Cần làm trước khi go-live |
| ➖ Không bắt buộc | Chỉ bật khi sản phẩm cần tính năng tương ứng |

## 3. Ma trận mức độ hoàn tất

| Hạng mục | Trạng thái | Bằng chứng hiện tại | Việc còn lại |
|---|---|---|---|
| Credential không phụ thuộc file ngoài dự án | ✅ | API đọc `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`; không còn dùng biến đường dẫn | Inject secret mới trên từng môi trường |
| Bảo vệ credential trong Git | ✅ | `.env` được ignore; secret scan trên tracked files không phát hiện private key | Bật secret scanning trong CI/repository |
| Thu hồi key đã lộ | ⛔ | Chưa có bằng chứng key cũ đã bị disable/delete | Xóa key cũ, tạo phương thức xác thực mới và kiểm tra audit log |
| Firebase Admin/Auth | ✅ | `authReachable=true` | Smoke test lại bằng credential mới |
| Firebase SSO từ StoryMee | 🟡 | Endpoint verify ID token và liên kết user đã có; unit test đạt | E2E với ID token thật từ StoryMee client |
| Custom token cho web app | 🟡 | Endpoint và client rebind session đã có; test/build đạt | E2E trên staging và smoke test domain Production |
| Firestore server projection | 🟡 | `firestoreReachable=true`; API publish đã có | E2E publish/read theo role; cấu hình TTL |
| Firestore Security Rules | ✅ | Rules đã deploy, default deny, client write bị từ chối | Thêm rules emulator test trong CI |
| Màn hình realtime trong Web | 🟡 | Helper `subscribeToClassroomEvents` đã có | Chưa có màn hình sản phẩm gọi helper này |
| Cloud Storage backend | 🟡 | Signed upload/finalize/read URL, ownership và validation đã có | Tạo bucket, deploy rules, E2E upload và cleanup |
| Cloud Storage frontend | ⬜ | Chưa thấy consumer `/api/storage/*` trong Web | Tích hợp UI upload theo nhu cầu sản phẩm |
| Firebase Cloud Messaging | 🟡 | Đăng ký token, service worker, retry policy và BullMQ worker đã có | Tạo VAPID, bật flag, E2E foreground/background |
| Redis/BullMQ | ✅ cục bộ | Integration test kết nối Redis thành công | Chọn Redis HA/managed, cảnh báo queue lag |
| PostgreSQL migration | ✅ | 5 migration; database up to date | Chạy `migrate deploy` như job duy nhất mỗi release |
| Atomic XP/progress | ✅ | Transaction đã áp dụng; test đạt | Theo dõi lock/contention khi load test |
| Docker Compose | ✅ cấu hình | API/Web/Redis và profile push đã khai báo | Smoke test image trên staging tương đương Production |
| Kịch bản tải 2.000 user | 🟡 | Có `load/k6-2000.js` | Chuẩn bị session hợp lệ và chạy trên staging |
| App Check | ⬜ | Chưa có cấu hình/SDK enforcement | Tích hợp, monitor, sau đó mới enforce |
| Observability/SLO | ⬜ | Có structured log/error code ở các luồng mới | Dashboard, alert, trace và runbook trực ca |
| CI/CD | ⬜ | Chưa có bằng chứng pipeline deploy rules/migration/app | Thiết lập pipeline và approval Production |
| Dependency audit | 🟡 | 6 moderate, đều từ dependency transitively qua Firebase/Storage | Theo dõi upstream; không force downgrade |

## 4. Kiến trúc và ranh giới tin cậy

```text
Browser (không có service-account secret)
  │
  ├── Cookie session httpOnly ──> Fastify API ──> PostgreSQL/Supabase
  │                                  │
  │                                  ├── Firebase Admin Auth
  │                                  ├── Firestore Admin write/projection
  │                                  ├── Cloud Storage signed URLs
  │                                  └── BullMQ ──> Redis ──> Push worker ──> FCM
  │
  └── Firebase Web SDK
       ├── Custom token do API cấp
       ├── Firestore read theo Security Rules
       └── FCM token/service worker
```

Nguyên tắc đã áp dụng:

- PostgreSQL tiếp tục là source of truth cho user, khóa học, tiến độ, project và notification.
- Firestore chỉ là projection realtime; browser không được phép ghi trực tiếp.
- Firebase Admin chỉ tồn tại trong backend/worker tin cậy. Service-account secret không được đưa vào bundle Web.
- Web Firebase API key là định danh public của Firebase app, không phải private credential; quyền truy cập vẫn phải được bảo vệ bằng Rules, IAM và App Check.
- Storage dùng signed URL ngắn hạn do API cấp sau khi kiểm tra session, role và ownership.
- Push chạy bất đồng bộ qua worker riêng; lỗi FCM không chặn request nghiệp vụ chính.

## 5. Những thay đổi đã thực hiện trong Git working tree

Working tree hiện **chưa được commit**. Cần review và commit có chủ đích trước khi tạo release.

### 5.1 File đã sửa

- Cấu hình gốc: `.dockerignore`, `.env.example`, `.gitignore`, `README.md`, `package-lock.json`.
- API runtime/dependency: `apps/api/docker-entrypoint.sh`, `apps/api/package.json`, `apps/api/src/app.ts`, `apps/api/src/config/env.ts`.
- Prisma: `apps/api/prisma/schema.prisma` và các file client Prisma được generate trong `apps/api/src/generated/prisma/`.
- Auth: `apps/api/src/modules/auth/auth.routes.ts`.
- Hiệu năng/tính toàn vẹn: achievement, notification, portfolio và progress routes/services.
- Web: `apps/web/package.json`, `NotificationBell.tsx`, auth store.

### 5.2 File/thư mục mới chưa được track

- Firebase project/config: `.firebaserc`, `firebase.json`, `firebase/firestore.rules`, `firebase/storage.rules`.
- API env template: `apps/api/.env.example`.
- Migration: `apps/api/prisma/migrations/20260722060000_firebase_infrastructure/migration.sql`.
- Firebase Admin/Auth/check: `apps/api/scripts/firebase-check.ts`, `apps/api/src/infrastructure/firebase/`.
- Firebase account bridge và test.
- FCM policy/service/queue/test và `apps/api/src/workers/`.
- Firestore realtime module.
- Storage module và policy test.
- Web Firebase client, messaging service worker và `apps/web/.env.example`.
- Docker overlay: `docker-compose.firebase.yml`.
- Capacity/load: `docs/CAPACITY-2000-FIREBASE.md`, `load/k6-2000.js`.

Không xóa hoặc reset working tree trước khi các thay đổi này được review/commit. Các file Prisma generated thay đổi theo schema và phải được giữ đồng bộ với migration.

## 6. Phân tích kỹ thuật các phần đã triển khai

### 6.1 Firebase Admin và credential portable

Backend khởi tạo Firebase bằng JSON service account đã base64 hóa trong biến môi trường:

```dotenv
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=storymee-35093
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=<SECRET_BASE64_KHONG_COMMIT>
```

`firebase-admin.ts` thực hiện:

- decode base64;
- parse JSON;
- kiểm tra các trường credential cần thiết;
- từ chối khởi động nếu `project_id` không khớp `FIREBASE_PROJECT_ID`;
- không log credential;
- tái sử dụng Firebase app đã khởi tạo.

Điều này đáp ứng yêu cầu không dùng đường dẫn như `C:/Users/.../service-account.json`. Tuy nhiên cần hiểu đúng tính portable:

- Copy cả thư mục máy cục bộ có thể mang theo `.env`, nhưng đây không phải cơ chế phát hành an toàn.
- Git clone sang máy khác **không mang theo secret** vì `.env` phải bị ignore.
- Mỗi máy/môi trường phải nhận secret từ secret store, CI/CD protected variable hoặc thao tác cấp phát được kiểm soát.
- Base64 chỉ là encoding, **không phải mã hóa**. Ai đọc được biến môi trường đều có thể khôi phục private key.
- Nếu chạy trên Google Cloud, ưu tiên Application Default Credentials/Workload Identity để không phải quản lý user-managed key.

### 6.2 Authentication bridge

Các endpoint đã có:

| Method | Endpoint | Quyền/ý nghĩa |
|---|---|---|
| `POST` | `/api/auth/login/firebase` | Nhận Firebase ID token, verify server-side, liên kết/tạo account theo email đã xác minh |
| `POST` | `/api/auth/firebase/custom-token` | Yêu cầu app session; cấp custom token để Web SDK rebind đúng user hiện tại |
| `GET` | `/api/auth/firebase/config` | Trả cấu hình web public khi Firebase sẵn sàng; không trả service-account secret |

Biện pháp an toàn:

- Student không được đăng nhập qua Firebase SSO; tiếp tục dùng nickname/PIN theo mô hình trẻ em.
- Email từ Firebase phải được xác minh trước khi tạo/liên kết account.
- Phát hiện xung đột giữa email và `firebaseUid`; không tự động chiếm account.
- Logout hoặc chuyển sang hồ sơ trẻ sẽ sign out Firebase và hủy FCM token của session trước, tránh rò rỉ thông báo trên thiết bị dùng chung.

### 6.3 Firestore realtime

Endpoint server:

| Method | Endpoint | Quyền |
|---|---|---|
| `POST` | `/api/realtime/classrooms/:classId/events` | Teacher sở hữu lớp hoặc Admin |

Payload được giới hạn type, scalar values và kích thước JSON. API xác minh classroom active trong PostgreSQL trước khi Admin SDK ghi projection vào Firestore. Document có `expiresAt` để phục vụ TTL.

Rules hiện tại:

- chỉ cho phép read theo custom claims/class membership;
- teacher/admin được giới hạn theo quyền sở hữu;
- mọi client write bị từ chối;
- mọi path không được khai báo bị default deny.

Lưu ý quan trọng: Firebase Admin SDK bypass Firestore Security Rules. Vì vậy bảo vệ thực tế của server route vẫn là session/RBAC, validation và IAM least privilege.

### 6.4 Cloud Storage

Các endpoint đã có:

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/storage/uploads` | Kiểm tra metadata/ownership, tạo row và signed upload URL |
| `POST` | `/api/storage/uploads/:id/finalize` | Đọc metadata object thật, kiểm tra MIME/size, đánh dấu ready |
| `GET` | `/api/storage/uploads/:id/read-url` | Chỉ owner nhận signed read URL cho object ready |

Biện pháp an toàn:

- giới hạn purpose, MIME, kích thước và tên file;
- path object được namespace bằng user/object ID, không tin path do client gửi;
- classroom upload chỉ cho teacher/admin;
- project attachment phải thuộc user hiện tại;
- kiểm tra trước upload và xác minh lại metadata sau upload;
- Storage Rules từ chối toàn bộ client access; truy cập qua signed URL/API authorization;
- route cấp upload có rate limit;
- thiếu bucket/config thì trả `503`, không fallback sang public access.

Chưa hoàn tất:

- chưa có bucket nên chưa thể E2E upload;
- Storage Rules chưa thể phát hành tới bucket chưa tồn tại;
- chưa có UI Web dùng các endpoint Storage;
- chưa có cleanup job/lifecycle cho upload ở trạng thái pending hoặc object mồ côi.

### 6.5 Firebase Cloud Messaging

Đã triển khai:

- Web service worker nhận notification background;
- client xin quyền rõ ràng và đăng ký device token qua API;
- token được gắn với user/session hiện hành;
- foreground push làm mới notification UI;
- fallback polling khi trang đang visible;
- notification có tag ổn định để giảm hiển thị trùng;
- invalid/unregistered token bị disable;
- lỗi retryable được đưa lại BullMQ với backoff;
- lỗi permanent không retry vô hạn;
- push worker chạy process riêng;
- queue chỉ bật khi đồng thời có Redis, Firebase và `FIREBASE_PUSH_ENABLED=true`.

Chưa hoàn tất:

- `FIREBASE_WEB_VAPID_KEY` còn trống;
- push flag đang false;
- chưa kiểm thử permission-denied, foreground, background, browser restart và token rotation trên trình duyệt thật;
- chưa có dashboard queue depth/retry/dead-letter.

### 6.6 Database và hiệu năng

Migration `20260722060000_firebase_infrastructure` là additive, gồm:

- `User.firebaseUid` unique;
- trạng thái/attempt/retry/error/dispatched timestamp cho notification push;
- bảng `PushDevice`;
- bảng `StorageObject`;
- composite indexes phục vụ asset/project và notification dispatch.

Các cải tiến liên quan:

- hoàn tất XP/progress theo transaction nguyên tử, giảm nguy cơ cộng XP trùng khi concurrent request;
- bổ sung pagination/index cho các luồng có thể tăng tải;
- giảm N+1 ở achievement;
- migration được tách thành role/job `PROCESS_ROLE=migrate`, không chạy `db push` đồng thời trong mọi API replica.

## 7. Biến môi trường và phân loại bảo mật

| Biến | Phân loại | Bắt buộc khi nào | Ghi chú |
|---|---|---|---|
| `DATABASE_URL` | Secret | API/migration | Chỉ backend |
| `JWT_SECRET` | Secret | API | Phải đủ entropy, khác theo môi trường |
| `FIREBASE_ENABLED` | Config | Firebase | Feature gate tổng |
| `FIREBASE_PROJECT_ID` | Public config | Firebase | Phải khớp credential |
| `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` | **Critical secret** | Admin SDK ngoài Google-managed identity | Không commit, không log, phải rotate |
| `FIREBASE_STORAGE_BUCKET` | Public config | Storage | Chỉ đặt sau khi bucket tồn tại |
| `FIREBASE_WEB_API_KEY` | Public client config | Web Firebase | Hạn chế API phù hợp trong Google Cloud Console |
| `FIREBASE_WEB_AUTH_DOMAIN` | Public client config | Web Firebase | Phải khớp authorized domain |
| `FIREBASE_WEB_MESSAGING_SENDER_ID` | Public client config | FCM | Lấy từ Firebase Web app |
| `FIREBASE_WEB_APP_ID` | Public client config | Web Firebase | Lấy từ Firebase Web app |
| `FIREBASE_WEB_VAPID_KEY` | Public client config | Web Push | Public key, không phải service-account secret |
| `FIREBASE_PUSH_ENABLED` | Config | Push worker | Chỉ true sau E2E staging |
| `REDIS_URL` | Secret/config | Cache/queue | Production nên dùng TLS và auth |
| `COOKIE_SECURE` | Security config | Production HTTPS | Phải là `true` |
| `COOKIE_SAME_SITE` | Security config | Production | Chọn theo topology domain |
| `CORS_ORIGIN` | Security config | Production | Danh sách origin cụ thể, không dùng wildcard |
| `TRUST_PROXY` | Security config | Sau reverse proxy | Chỉ bật theo topology đã xác minh |

Không đưa giá trị secret thật vào tài liệu, Git, Dockerfile, image layer, frontend build args hoặc log CI.

## 8. Quy trình xử lý credential bắt buộc

### 8.1 Thu hồi key đã lộ

1. Vào Google Cloud Console → IAM & Admin → Service Accounts.
2. Chọn service account dành cho Firebase Admin của project `storymee-35093`.
3. Vào tab Keys, disable rồi delete key đã xuất hiện trong hội thoại.
4. Kiểm tra Cloud Audit Logs từ thời điểm key được tạo; điều tra mọi hoạt động bất thường.
5. Nếu hạ tầng hỗ trợ, chuyển sang Workload Identity/Application Default Credentials.
6. Nếu bắt buộc dùng JSON key, tạo key mới có vòng đời ngắn và quyền tối thiểu; không gửi key qua chat/email.
7. Encode JSON key mới trong môi trường an toàn và lưu vào protected secret variable `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`.
8. Redeploy API/worker, chạy `firebase:check`, sau đó xác nhận key cũ không còn hoạt động.

PowerShell để tạo giá trị base64 cục bộ mà không sửa mã nguồn:

```powershell
$credentialPath = 'C:\secure\new-service-account.json'
$credentialBytes = [System.IO.File]::ReadAllBytes($credentialPath)
$firebaseCredentialBase64 = [Convert]::ToBase64String($credentialBytes)
# Đưa $firebaseCredentialBase64 vào secret manager/protected CI variable; không commit và không log.
```

Linux/macOS:

```bash
base64 < /secure/new-service-account.json | tr -d '\n'
```

Sau khi inject thành công, xóa bản JSON tải xuống khỏi thư mục Downloads và các bản sao không cần thiết bằng quy trình xóa an toàn của tổ chức.

## 9. Triển khai local và staging

### 9.1 Chuẩn bị

```powershell
npm ci
Copy-Item apps/api/.env.example apps/api/.env
```

Điền secret thật trong `apps/api/.env` cục bộ; tuyệt đối không commit file này. Cấu hình tối thiểu cho Auth/Firestore:

```dotenv
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=storymee-35093
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=<SECRET_MOI_DA_ROTATE>
FIREBASE_PUSH_ENABLED=false
FIREBASE_STORAGE_BUCKET=
FIREBASE_WEB_VAPID_KEY=
```

### 9.2 Kiểm tra và migration

```powershell
npm run firebase:check -w @aikids/api
Set-Location apps/api
npm exec prisma migrate status
npm exec prisma migrate deploy
Set-Location ../..
npm run test:all
npm run build
```

Không dùng `prisma db push` cho Production. Migration phải chạy một lần trước khi scale API.

### 9.3 Chạy Docker không push

```powershell
docker compose -f docker-compose.yml -f docker-compose.firebase.yml config
docker compose -f docker-compose.yml -f docker-compose.firebase.yml up --build
```

### 9.4 Chạy push sau khi VAPID và Redis đã sẵn sàng

```powershell
docker compose -f docker-compose.yml -f docker-compose.firebase.yml --profile push up --build
```

Chỉ thực hiện sau khi đặt `FIREBASE_PUSH_ENABLED=true` và E2E staging đạt.

## 10. Quy trình triển khai Production đề xuất

1. **Security gate:** rotate key đã lộ; review IAM least privilege; bật audit log/secret scanning.
2. **Release artifact:** review working tree, tạo commit/PR, chạy test/build/audit trong CI, build image bất biến.
3. **Database:** backup/restore test; chạy container/job với `PROCESS_ROLE=migrate` đúng một lần; xác minh 5 migration up to date.
4. **Rules:** deploy Firestore Rules từ source control bằng `firebase deploy --only firestore`; chạy rules emulator test và smoke test role trước khi chuyển traffic.
5. **API canary:** inject protected secrets, cấu hình HTTPS cookie/CORS/proxy, deploy một replica, kiểm tra health/log/error rate.
6. **Web:** build với API origin Production; kiểm tra login/logout/chuyển child trên shared device.
7. **Storage nếu bật:** nâng Blaze, chọn location theo data residency/latency, tạo bucket, đặt env, chạy `firebase deploy --only storage`, rồi kiểm tra upload/finalize/read/forbidden E2E.
8. **FCM nếu bật:** tạo Web Push certificate/VAPID, cấu hình authorized domain, deploy worker, test token lifecycle và background push, sau đó mới bật flag.
9. **Firestore retention:** cấu hình TTL cho field `expiresAt` của collection group `events`; xác nhận index/TTL status active.
10. **App Check:** tích hợp reCAPTCHA Enterprise cho Web, chạy monitor mode, đánh giá false positive rồi mới enforce.
11. **Capacity:** chạy k6 trên staging tương đương Production; điều chỉnh pool/replica/Redis/quota; chỉ go-live nếu đạt SLO.
12. **Observability:** bật dashboard, alert, queue lag, Firebase quota, database saturation và synthetic smoke test.
13. **Rollout:** canary → tăng traffic từng bước → theo dõi → rollback tự động khi vượt ngưỡng.

## 11. Kiểm thử và bằng chứng ngày 22/07/2026

| Kiểm tra | Kết quả |
|---|---|
| `npm run test:all` | ✅ 138/138 test đạt |
| Domain | ✅ 62 test, 11 test files |
| API | ✅ 53 test, 14 test files; integration PostgreSQL/Redis đạt |
| Web | ✅ 23 test, 3 test files |
| `npm run build` | ✅ Domain TypeScript, API TypeScript/generated copy, Web Vite Production đều đạt |
| Prisma migration status | ✅ 5 migration; database schema up to date |
| Firebase Authentication reachability | ✅ true |
| Firestore reachability | ✅ true |
| Storage configured/reachable | ⛔ false/false |
| Web Push configured | ⛔ false |
| Push queue enabled | ⛔ false |
| Firestore Rules | ✅ Đã deploy ruleset nêu ở mục 1 |
| `git diff --check` | ✅ Không có whitespace error |
| Tracked secret scan | ✅ Không phát hiện private-key material |
| `npm audit --omit=dev` | 🟡 6 moderate từ dependency transitively qua `firebase-admin`/Google Cloud Storage |

### Giới hạn của bằng chứng hiện tại

- Test tự động và build thành công không thay thế load test, chaos/failover test hoặc browser E2E Production.
- Kết nối Admin thành công không chứng minh Firestore Rules đúng cho mọi client role; cần emulator/E2E token test.
- Storage và FCM chưa cấu hình nên chưa có bằng chứng end-to-end.
- Chưa có bằng chứng restore backup, rollback release, Redis failover hoặc multi-replica contention.

## 12. Dependency và chính sách cập nhật

Phiên bản chính đang sử dụng:

- Node.js: yêu cầu `>=22`.
- `firebase-admin`: `^14.2.0`.
- Firebase Web SDK: `^12.16.0`.
- `bullmq`: `^5.80.10`.
- `google-auth-library`: `^10.9.0`.
- Prisma CLI hiện kiểm tra: `6.19.3`.

`npm audit --omit=dev` báo 6 moderate liên quan `uuid <11.1.1` trong dependency chain của Google Cloud Storage/Firebase Admin. Npm đề xuất `--force` bằng cách hạ `firebase-admin` xuống `10.3.0`; đây là breaking change và không phải phương án an toàn.

Xử lý đề xuất:

1. không chạy `npm audit fix --force` trên nhánh Production;
2. theo dõi release chính thức của Firebase Admin/Google Cloud Storage;
3. cập nhật lockfile qua PR riêng khi upstream vá dependency;
4. chạy full test/build/Storage E2E sau cập nhật;
5. đánh giá lại mức độ khai thác thực tế vì issue nằm trong đường dẫn dependency transitively.

## 13. Risk register và đánh giá tác động

| ID | Rủi ro | Mức | Kiểm soát hiện tại | Hành động đóng rủi ro |
|---|---|---:|---|---|
| R-01 | Service-account private key đã lộ | Critical | Không commit key; runtime dùng env | Rotate/delete ngay, audit log, ưu tiên workload identity |
| R-02 | Storage bucket chưa tồn tại | High | Feature fail-closed `503` | Blaze + location + bucket + rules + E2E |
| R-03 | Push chưa cấu hình | High nếu cam kết realtime notification | Polling fallback; flag false | VAPID + worker + E2E + monitoring |
| R-04 | Firestore Admin bypass Rules | High | Server RBAC/ownership/validation | IAM least privilege + route tests + audit logs |
| R-05 | Chưa kiểm thử 2.000 concurrent users | High | Có k6 script, index/transaction/caching | Chạy staging load và capacity sign-off |
| R-06 | Chưa có App Check | Medium | Auth/Rules/rate limit | Monitor rồi enforce reCAPTCHA Enterprise |
| R-07 | Chưa có cleanup Storage pending/orphan | Medium | Metadata status/ownership | Scheduled cleanup + bucket lifecycle |
| R-08 | 6 dependency moderate | Medium | Latest selected version, test/build đạt | Theo dõi upstream; patch qua PR |
| R-09 | Realtime helper chưa nối màn hình | Medium sản phẩm | Backend/rules/helper sẵn có | Xác định UX và thêm consumer/E2E |
| R-10 | CI/CD/observability chưa xác minh | High vận hành | Manual checks có kết quả | Pipeline, dashboard, alert, release approval |

Tác động lên tính năng hiện hữu được kiểm soát như sau:

- Firebase được bao bởi feature flag; thiếu cấu hình không làm API core tự chuyển sang chế độ không an toàn.
- PostgreSQL vẫn là nguồn dữ liệu chính; Firestore không thay thế hoặc làm mất dữ liệu nghiệp vụ.
- Migration chỉ bổ sung field/table/index, không xóa dữ liệu.
- Student auth flow được giữ nguyên và bị chặn khỏi Firebase SSO.
- Logout/shared-device flow chủ động ngắt Firebase session/token.
- Push là side effect bất đồng bộ; retry không làm lặp thao tác nghiệp vụ chính.

## 14. Observability, SLO và runbook

### 14.1 SLO cần thống nhất trước go-live

Giá trị dưới đây là đề xuất ban đầu, phải được product/operations phê duyệt:

| Chỉ số | Mục tiêu đề xuất |
|---|---|
| API availability | ≥ 99,9% theo tháng |
| API p95 read | ≤ 500 ms |
| API p95 write | ≤ 800 ms |
| 5xx rate | < 1% trong cửa sổ 5 phút |
| Push queue lag p95 | ≤ 60 giây |
| Push permanent failure | < 2%, loại trừ token hết hạn |
| Database connection saturation | < 80% |
| Redis memory | < 75% ngưỡng eviction |

### 14.2 Alert bắt buộc

- API health/5xx/latency và restart loop.
- PostgreSQL connection pool, slow query, lock và storage.
- Redis unavailable, memory, eviction và BullMQ queue depth/oldest job age.
- Firebase Auth/Firestore/Storage/FCM error rate và quota.
- Số token FCM invalid tăng đột biến.
- Storage finalize mismatch MIME/size và số pending object quá hạn.
- Firestore TTL backlog và write errors.
- Secret/IAM key creation, permission change và bất thường audit log.

### 14.3 Runbook sự cố ngắn

- **Firebase lỗi:** đặt `FIREBASE_PUSH_ENABLED=false`; giữ API core/polling; không mở Rules để chữa cháy.
- **Push queue tăng:** scale worker có kiểm soát, kiểm tra FCM quota/error code, không retry permanent error.
- **Credential nghi lộ:** disable key, rotate, redeploy, revoke session liên quan khi cần, audit log và lập incident report.
- **Storage abuse:** tắt endpoint bằng Firebase feature/config, không đổi bucket thành public; điều tra signed URL logs.
- **Migration lỗi:** dừng rollout, không chạy `db push --force-reset`; khôi phục theo backup/forward-fix đã duyệt.

### 14.4 Kế hoạch rollback

Rollback ứng dụng và rollback dữ liệu phải được xử lý riêng:

1. Dừng tăng traffic ngay khi 5xx, latency, queue lag hoặc lỗi xác thực vượt ngưỡng release.
2. Đặt `FIREBASE_PUSH_ENABLED=false` nếu lỗi nằm ở FCM/worker; không cần rollback toàn bộ API core.
3. Chuyển API/Web về image digest của release ổn định gần nhất và giữ nguyên secret version tương thích.
4. Firestore Rules chỉ rollback về ruleset đã review trước đó; tuyệt đối không dùng rules public tạm thời.
5. Migration hiện tại là additive, vì vậy ưu tiên rollback application và forward-fix schema. Không tự động drop column/table khi dữ liệu đã được ghi.
6. Nếu migration gây lỗi không thể forward-fix, dừng write traffic và thực hiện restore theo bản backup đã diễn tập, có phê duyệt của database owner.
7. Sau rollback, chạy smoke test health/login/course/progress/notification và đối chiếu audit log trước khi mở lại traffic.
8. Lập post-incident report, xác định root cause và bổ sung regression test trước lần phát hành kế tiếp.

Tiêu chí rollback tự động đề xuất: 5xx trên 2% trong 5 phút, p95 vượt gấp đôi SLO trong 10 phút, auth failure tăng bất thường, hoặc phát hiện sai quyền/rò rỉ dữ liệu dù chỉ một trường hợp.

## 15. Go-live checklist

### 15.1 Security — bắt buộc

- [ ] Key đã xuất hiện trong hội thoại đã bị disable và delete.
- [ ] Credential mới không đi qua chat/email/Git; đã inject từ protected secret source.
- [ ] IAM được review theo least privilege; không dùng role Owner/Editor cho workload.
- [ ] `COOKIE_SECURE=true`, CORS cụ thể, proxy trust đúng topology.
- [ ] Firebase authorized domains và API restrictions đã review.
- [ ] Secret scanning và dependency scanning chạy trong CI.
- [ ] Firestore Rules emulator/E2E tests đạt cho anonymous/student/parent/teacher/admin.
- [ ] Audit logs và alert thay đổi IAM/key đã bật.

### 15.2 Release/database — bắt buộc

- [ ] Working tree đã review, commit và PR approved.
- [ ] `npm ci`, 138 test và Production build đạt trong CI từ commit release.
- [ ] Backup đã tạo và restore test đạt.
- [ ] `prisma migrate deploy` chạy một lần; status up to date.
- [ ] Docker/image smoke test đạt trên staging tương đương Production.
- [ ] Rollback image/config đã chuẩn bị và diễn tập.

### 15.3 Firebase — theo tính năng phát hành

- [ ] Auth/Admin check đạt bằng credential mới.
- [ ] Firebase login E2E bằng StoryMee ID token thật đạt.
- [ ] Custom-token rebind/logout/shared-device E2E đạt.
- [ ] Firestore Rules đã deploy từ đúng commit và TTL `events.expiresAt` active.
- [ ] Realtime client theo role đạt hoặc tính năng được ghi rõ là chưa phát hành.
- [ ] Storage: Blaze/location/bucket/rules/upload/finalize/read/deny/cleanup đều đạt, hoặc Storage giữ disabled.
- [ ] FCM: VAPID/worker/token rotation/foreground/background/retry đạt, hoặc push giữ disabled.
- [ ] App Check monitor không có false positive nghiêm trọng; có kế hoạch enforce.

### 15.4 Capacity/operations — bắt buộc

- [ ] k6 2.000 user đã chạy trên staging; báo cáo p95/p99/error rate được phê duyệt.
- [ ] Database pool, API replicas, Redis và Firebase quota có headroom.
- [ ] Dashboard/alerts/on-call/runbook hoạt động.
- [ ] Canary rollout và rollback threshold được cấu hình.
- [ ] Product owner xác nhận các tính năng disabled không vi phạm cam kết phát hành.

## 16. Tiêu chí Definition of Done cuối cùng

Hệ thống chỉ được đánh dấu **GREEN / hoàn tất Production** khi đồng thời thỏa mãn:

1. không còn credential đã lộ hoặc secret nằm ngoài quy trình quản trị;
2. commit release sạch, CI test/build/security checks đạt;
3. migration, backup/restore và rollback được chứng minh;
4. mọi Firebase capability được bật đều có E2E test và monitoring;
5. capability chưa hoàn tất bị tắt fail-closed và được Product chấp thuận;
6. load test 2.000 user đạt SLO đã phê duyệt;
7. go-live checklist không còn mục bắt buộc chưa đánh dấu.

## 17. Tài liệu nguồn chính thức

- [Firebase Admin SDK setup](https://firebase.google.com/docs/admin/setup)
- [Verify Firebase ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Manage and deploy Firebase Security Rules](https://firebase.google.com/docs/rules/manage-deploy)
- [Firestore TTL policies](https://firebase.google.com/docs/firestore/ttl)
- [Firebase Cloud Messaging Admin SDK](https://firebase.google.com/docs/cloud-messaging/send/admin-sdk)
- [FCM error codes](https://firebase.google.com/docs/cloud-messaging/error-codes)
- [Cloud Storage for Firebase setup and Blaze requirement](https://firebase.google.com/docs/storage/web/start)
- [Firebase API key management](https://firebase.google.com/docs/projects/api-keys)
- [Firebase App Check for Web](https://firebase.google.com/docs/app-check/web/recaptcha-provider)
- [Google Cloud service-account key security](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)

## 18. Người chịu trách nhiệm ký duyệt

| Vai trò | Trách nhiệm | Trạng thái |
|---|---|---|
| Engineering owner | Code, migration, test, build, rollback | Chưa ký |
| Security/IAM owner | Key rotation, IAM, audit/App Check | Chưa ký |
| Platform/DevOps | CI/CD, secrets, Redis, monitoring, capacity | Chưa ký |
| Product owner | Phạm vi tính năng Storage/Push/Realtime | Chưa ký |
| Release manager | Go-live checklist và canary approval | Chưa ký |

---

**Quyết định hiện tại:** Chưa phát hành toàn bộ Firebase lên Production. Có thể tiếp tục phát triển/staging với Auth + Firestore đã kết nối, trong khi Storage và Push giữ disabled. Ưu tiên tuyệt đối tiếp theo là rotate key đã lộ, sau đó hoàn tất hạ tầng Storage/FCM, E2E, load test và observability.
