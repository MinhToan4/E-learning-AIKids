# Bàn giao Giai đoạn 2 — Nền tảng học online + Hệ thống bài test

Ngày kiểm định: 2026-07-26  
Phụ trách phạm vi: Toàn  
Phạm vi đã đọc và đối chiếu: toàn bộ 10 tài liệu trong
`AIKid_Quy_hoach_he_thong_v2`, tài liệu nghiệp vụ đính kèm, schema, migration,
seed, API, UI và test của monorepo.

## 1. Kết luận

Lõi kỹ thuật cho đúng 10 module L1–L9 và T4 đã được triển khai xuyên suốt từ
PostgreSQL → Prisma → Fastify → React. Hệ thống không dùng dữ liệu giả để lấp
những chính sách khách hàng chưa bàn giao: các cấu hình tuổi, khung năng lực,
lịch, báo cáo và chứng nhận đều có version, trạng thái draft/published và lưu
trong DB; consumer sẽ trả `configuration_required` hoặc từ chối thao tác nếu
chưa có bản published.

“Hoàn tất kỹ thuật” không đồng nghĩa “đã ký UAT”. Các cổng còn phụ thuộc khách
hàng được liệt kê ở mục 5; đặc biệt không thể xác nhận “đã gửi Zalo thật” hoặc
“giáo viên đã dùng thật” khi chưa có tài khoản, template và người dùng UAT.

## 2. Ma trận 10 module sau triển khai

| Module | Phần đã hoàn thiện | Cổng còn lại trước UAT |
|---|---|---|
| L1 Player nâng cao | Note/bookmark theo anchor, search nội dung có quyền, resume, offline manifest có checksum/expiry, queue sync idempotent và chống ghi đè, service worker | Publish chính sách T4 rồi thử trên thiết bị mục tiêu |
| L2 Lộ trình | Prerequisite có version, lý do khóa, đề xuất khóa tiếp, override có expiry/reason/audit và kiểm tra lại tại API | Khách hàng duyệt rule lộ trình |
| L3 Bài test/bài tập | Question bank + immutable version; single/multiple/drag/match/short text/artifact; assessment/version; timer; save/resume; retake; idempotent submit; 12 bài cuối khóa | Khách hàng duyệt nội dung/rubric cuối cùng |
| L4 Chấm/phản hồi | Auto-grade, rubric thủ công, grading queue, draft/publish, optimistic concurrency, regrade/revision/resubmission, lý do và audit | Chốt ma trận người chấm/người duyệt nếu cần maker-checker |
| L5 Tiến độ/năng lực | Framework 4 miền bắt buộc tại API và DB; domain/skill/mapping version; evidence append-only; snapshot/recompute; truy nguồn; “chưa có dữ liệu” riêng | Bàn giao tên 4 miền, kỹ năng, mapping, trọng số và ngưỡng đã duyệt |
| L6 Chứng nhận/huy hiệu | Template/rule version; điều kiện từ completion/test/competency; issue idempotent; revoke/reissue có chuỗi lịch sử; PDF; mã kiểm tra công khai bảo vệ riêng tư | Duyệt template, nội dung pháp lý, rule và quyền tải/chia sẻ |
| L7 Console giáo viên | Lớp được phân công, session/lesson plan, attendance có revision/finalize, grading queue, nhận xét có điểm → evidence năng lực, progress/report workflow | Tài khoản giáo viên và kịch bản UAT thực tế |
| L8 Lịch/ghép lớp | Policy version, 1-1/group, capacity, course/age/level, conflict, placement, attendance, đổi lịch, reminder delivery/retry/backoff | Duyệt chính sách đổi lịch và bật provider email/push/Zalo |
| L9 Báo cáo phụ huynh | Template/policy, chu kỳ tự sinh, frozen snapshot, preview/review/approve/publish, PDF/hash, history, delivery worker; parent ownership tại API | Duyệt mẫu/chu kỳ/kênh và người duyệt; cấu hình provider |
| T4 Phân tầng tuổi | Ngày sinh bắt buộc, age band do server tính, policy bất biến theo version, copy/input/assessment/permission từ DB, provider React áp dụng toàn app, fail-closed | Khách hàng duyệt ba policy; xác nhận ranh giới tuổi 11 |

Hai khóa AI Literacy K7 đang có sẵn trong project được giữ nguyên nhưng không
được tính vào nghiệm thu 12 khóa hợp đồng. Bộ 12 khóa được tính là L1/L2,
K1–K6; seed tạo đúng 12 assessment `course_final`.

## 3. Kiến trúc và điểm vào vận hành

### Migration

Các migration mới được xếp sau baseline hiện có:

1. `20260726003000_phase2_learning_foundation`
2. `20260726010000_assessment_engine`
3. `20260726020000_competency_credentials`
4. `20260726030000_teacher_schedule`
5. `20260726040000_parent_reports`

Migration dùng foreign key, check constraint, composite/partial unique index và
index cho worker. Những invariant quan trọng được chặn cả ở Zod/API và DB:
framework đúng 4 miền, điểm 0–100, published state hợp lệ, một chứng nhận đang
hiệu lực trên mỗi learner/rule và idempotency key không trùng.

### Màn hình

- Học viên: `/assessments`, player với công cụ học/offline, lộ trình và năng lực.
- Phụ huynh: `/parent/learning` cho lịch, năng lực, chứng nhận, báo cáo.
- Giáo viên: `/teacher/operations`, `/teacher/assessments`,
  `/teacher/scheduling`.
- Admin: `/admin/learning-config`.
- Công khai: `/verify/credential/:code`.

### Cấu hình kết nối

Đặt `VITE_API_MODE=standalone` để frontend gọi các route Giai đoạn 2 trực tiếp
tới Fastify. Chế độ gateway chỉ dùng sau khi StoryMee gateway đã triển khai đầy
đủ các route tương ứng.

Thứ tự publish được khuyến nghị:

1. Age experience policy cho từng age band.
2. Framework 4 miền và competency mapping.
3. Credential template/rule.
4. Schedule policy.
5. Report template/policy.
6. Bật worker reminder, report due và report delivery theo scheduler có xác thực.

Không gọi endpoint `*/process` công khai từ browser hoặc cron không có session
admin. Trong production nên gọi qua job runner nội bộ dùng principal admin riêng,
giới hạn mạng và lưu audit.

## 4. Bảo mật và tính toàn vẹn

- Mọi mutation đi qua Fastify + Zod + Prisma; không có ghi DB trực tiếp từ web.
- RBAC và ownership được kiểm tra server-side cho student/parent/teacher/admin.
- Free text của trẻ đi qua bộ kiểm tra an toàn; audit không sao chép nội dung trẻ
  không cần thiết.
- Published assessment/framework/report/observation là immutable hoặc thay bằng
  version/revision mới.
- Attempt submit, offline sync, issue credential và delivery đều có idempotency
  hoặc optimistic concurrency.
- Report snapshot đóng băng và PDF có hash; thay đổi dữ liệu nguồn không âm thầm
  sửa báo cáo đã phát hành.
- Public credential chỉ trả trường được template cho phép và không làm lộ hồ sơ
  học tập.
- Delivery chỉ chuyển `sent` sau khi provider xác nhận; provider thiếu cấu hình
  trả lỗi rõ ràng, không giả vờ gửi thành công.

## 5. Dữ liệu cần khách hàng bàn giao

Không được tự suy diễn các dữ liệu sau:

1. Tên 4 miền năng lực, danh sách kỹ năng con, mapping nguồn, trọng số, ngưỡng
   `not_met/developing/achieved`, câu tuyên bố alignment và disclaimer.
2. Ba policy tuổi 6–8, 9–11, 11+ gồm copy, label, permission, assessment input
   limit và quy tắc giao diện.
3. Xác nhận tuổi 11 thuộc 9–11 hay 11+. Code hiện hiểu 11 thuộc `9_11`, còn
   `11_plus` được trình bày là 12–17 để không tạo hai policy cùng hiệu lực.
4. Rubric sáng tạo chính thức cho 12 khóa và người có quyền duyệt/publish.
5. Capacity, deadline, quota đổi lịch, reminder offset/channel cho từng loại lớp.
6. Mẫu báo cáo, chu kỳ, timezone, kênh gửi và ma trận người lập/người duyệt.
7. Credential template/rule, nội dung pháp lý, public field và quyền download/share.
8. SMTP/FCM production; Zalo OA credentials, approved template và tài liệu API
   tương ứng; test recipient và tiêu chí delivery UAT.

Tài liệu khách hàng nói “4 miền năng lực”, trong khi Thông tư 02/2025/TT-BGDĐT
công bố khung năng lực số với 6 miền/24 năng lực thành phần. Vì vậy UI và tài
liệu sản phẩm chỉ nên dùng cách diễn đạt “phù hợp với yêu cầu/định hướng đã được
khách hàng phê duyệt”, không tuyên bố khung 4 miền là nguyên văn khung chính thức.

## 6. Bằng chứng kiểm định

Đã chạy trong workspace ngày 2026-07-26:

- `npm run build`: domain, API và web đều pass; Vite production build thành công.
- `npm run test:all`: domain 83/83, API 64/64 (10 integration được tách riêng),
  web 49/49.
- Test tích hợp real Fastify + isolated PostgreSQL: 10/10 pass, gồm cả chuỗi
  revoke/reissue và observation → competency evidence.
- Prisma schema validate pass.
- `prisma migrate deploy` trên PostgreSQL 16 trống: 10/10 migration pass.
- Seed trên DB sạch pass; query xác nhận 12 assessment cuối khóa và 0 age policy
  published mặc định.
- Constraint/index kiểm tra trực tiếp trong PostgreSQL: framework đúng 4 miền,
  observation score 0–100, partial unique credential đang hiệu lực và retry
  index cho reminder đều tồn tại.
- PDF báo cáo/chứng nhận được sinh bằng font Unicode, render thành ảnh và kiểm
  tra trực quan.

Các hạng mục chưa thể ghi “pass” nếu thiếu đầu vào ở mục 5: responsive UAT với
ba hồ sơ tuổi thật, giáo viên sử dụng thật, email/push/Zalo gửi tới provider
production và ký duyệt nội dung/pháp lý.
