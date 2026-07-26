# Giai đoạn 2 — Gap analysis và kế hoạch triển khai

> Đây là ảnh chụp hiện trạng **trước khi triển khai** ngày 2026-07-26. Trạng thái
> sau triển khai, hướng dẫn cấu hình và bằng chứng kiểm thử nằm tại
> [`PHASE2_IMPLEMENTATION_HANDOVER.md`](./PHASE2_IMPLEMENTATION_HANDOVER.md).

Ngày kiểm kê: 2026-07-26  
Phạm vi: L1–L9 và T4, “Nền tảng học online + Hệ thống bài test”  
Nguồn: bộ quy hoạch `AIKid_Quy_hoach_he_thong_v2`, tài liệu nghiệp vụ của Toàn,
schema/API/UI/test và seed hiện có trong monorepo.

## Kết luận hiện trạng

Project đã có nền GĐ1 dùng được: auth bốn role, quan hệ cha mẹ–trẻ, 12 khóa/146
bài, player bốn trạm, tiến độ tuần tự, portfolio riêng tư, huy hiệu cơ bản,
teacher/parent shell, notification, Fastify/Prisma/PostgreSQL và RBAC phía API.

Các phần này chưa tạo thành hệ thống GĐ2. Schema hiện tại chưa có question bank,
assessment version, attempt/answer, grading workflow, competency evidence,
certificate, attendance/schedule, reschedule, report snapshot hoặc delivery
outbox. Quiz hiện tại nằm trong `Quest.checkJson`, chỉ là check một đáp án của
từng quest; kết quả bị tổng hợp trực tiếp vào `QuestProgress`, nên không đáp ứng
truy vết một lần làm bài và không thể làm engine dùng chung cho 12 khóa.

## Ma trận 10 module

| Module | Hiện có có thể tái sử dụng | Khoảng thiếu bắt buộc | Trạng thái |
|---|---|---|---|
| L1 Player nâng cao | `LessonPage`, resume phase, video/game/practice/check | Note/bookmark có anchor; tìm kiếm trong nội dung được cấp quyền; manifest offline; queue và đồng bộ tiến độ chống ghi đè | Thiếu phần lớn |
| L2 Lộ trình | 12 khóa L1/L2, enrollment, mở quest tuần tự | Course prerequisite, rule/version, lý do khóa, override có audit, đề xuất khóa tiếp theo, kiểm tra lại ở API | Thiếu |
| L3 Bài test/bài tập | `checkJson` single-choice, practice/portfolio | Question bank/version; 6 loại bài; assessment/version; assignment; attempt/answer; save/resume; time/retake/pass policy; idempotent submit; artifact version | Thiếu |
| L4 Chấm/phản hồi | Auto-score check đơn giản | Score từng câu; rubric; queue chấm; draft/AI draft/final; publish gate; regrade/revision; audit cũ–mới–lý do | Thiếu |
| L5 Tiến độ/năng lực | Quest progress, parent/teacher summary | Framework/domain/skill version; mapping; evidence; snapshot/recompute; “chưa có dữ liệu”; giải thích nguồn; presentation theo role | Thiếu |
| L6 Chứng nhận/huy hiệu | `Achievement` và private badge asset | Definition/version/condition; certificate code; issue/revoke/reissue history; evidence; parent download/view | Thiếu phần lớn |
| L7 Console giáo viên | Class roster, authoring, progress stats | Danh sách lớp được phân công; lesson plan/session; attendance; grading queue; publish feedback; class/student progress từ L4/L5 | Thiếu luồng vận hành |
| L8 Lịch/ghép lớp | `ClassRoom` một lớp/giáo viên | Nhiều lớp/học viên; session; capacity/conflict; course/age/level; manual matching; reschedule workflow; reminder delivery/retry | Thiếu |
| L9 Báo cáo phụ huynh | Parent progress thô, notification | Snapshot bất biến; published-only data; competency/evidence/artifact/review/certificate; preview/approval; PDF; delivery state/retry/history | Thiếu |
| T4 Phân tầng tuổi | Hai `ageTrack` 8–9/10–11, UI kids-first | Hồ sơ tuổi do parent/admin quản lý; policy DB cho 6–8/9–11/11+; quyền/copy/input/assessment policy; test ba hồ sơ | Thiếu |

## Root cause

1. Dự án hiện tại tối ưu cho quest trải nghiệm GĐ1, chưa có aggregate riêng cho
   assessment, competency, operation và report.
2. Dữ liệu quan trọng còn nằm trong JSON của `Quest`/`QuestProgress`; cách này
   phù hợp player nhưng không đủ versioning, lịch sử và truy vết GĐ2.
3. Teacher UI hiện nghiêng về CMS biên soạn, chưa phải console công việc hằng
   ngày. Parent UI mới hiển thị summary, chưa có lịch, năng lực hay báo cáo.
4. RBAC có role/action nền nhưng chưa có action và ownership guard cho các
   aggregate GĐ2.

## Ràng buộc chưa được phép tự quyết

- Tài liệu khách hàng nói “4 miền năng lực”, trong khi
  `02/2025/TT-BGDĐT` công bố Khung năng lực số gồm 6 miền. Tên miền, kỹ năng,
  trọng số, ngưỡng và mapping phải do khách hàng duyệt. Code chỉ cung cấp
  framework có version, workflow draft/published và import/configuration trong
  DB; không seed nội dung giả thành chuẩn chính thức.
- Chưa có ma trận quyền ba nhóm tuổi, template PDF chính thức, chu kỳ báo cáo,
  chính sách đổi lịch, tài khoản/mẫu tin Zalo OA và người duyệt. Các chính sách
  này phải là record cấu hình trong DB, không là hằng số frontend.
- Chưa thể ký UAT “giáo viên dùng thật” hay “Zalo gửi thật” nếu chưa có người
  dùng/tài khoản tích hợp từ khách hàng.

## Kiến trúc triển khai

### Phase A — Nền GĐ2

- Mở rộng RBAC action, ownership guard và audit event dùng chung.
- Age profile/policy ba nhóm; course pathway rule và override.
- Lesson note/bookmark/search index/manifest offline/progress sync event.
- Giữ `Course`, `Quest`, `QuestProgress` làm lõi player; không tạo player thứ hai.

### Phase B — Assessment và chấm

- Question bank + immutable question version.
- Assessment + immutable published version + item ordering/settings.
- Attempt/response với khóa idempotency và optimistic version.
- Auto-grade loại khách quan; manual review/rubric cho sáng tạo; publish gate.
- Mọi sửa điểm/phản hồi sau công bố tạo audit record.

### Phase C — Tiến độ, năng lực và công nhận

- Framework/domain/skill/mapping/rule đều có version và trạng thái.
- Competency evidence liên kết trực tiếp progress/attempt/response/review/project.
- Snapshot tái tính không trùng, phân biệt chưa có dữ liệu và chưa đạt.
- Certificate/badge definition, award, revoke/reissue và mã kiểm tra riêng tư.

### Phase D — Vận hành giáo viên và lịch

- Class membership, session, lesson plan, attendance và lịch sử sửa.
- Capacity, teacher/student overlap, age/level warning.
- Reschedule request/decision và notification outbox.
- Console bốn tác vụ chính: lớp; buổi/điểm danh; bài chờ chấm; tiến độ.

### Phase E — Báo cáo phụ huynh

- Report period/template/version/snapshot/release workflow.
- Chỉ lấy feedback published và evidence thật.
- PDF server-side, lịch sử delivery, retry và provider adapter.
- Parent portal kiểm ownership tại API cho lịch, report, năng lực, chứng nhận.

### Phase F — UI học viên

- Mở rộng player bằng note/bookmark/search/offline state.
- Assessment UI hỗ trợ single/multiple/drag/match/short text/artifact.
- Pathway và competency presentation theo age policy từ API.
- Loading/empty/error/offline/permission states ở 375/768/1280 px.

## Nguyên tắc an toàn

- Mọi mutation đi qua Fastify, Zod và Prisma; browser không ghi DB trực tiếp.
- Mọi route kiểm role + ownership ở server; ẩn control ở UI không thay RBAC.
- Published assessment/report/framework là immutable; sửa bằng version mới.
- Submit, certificate issue và delivery retry phải idempotent bằng unique key.
- Audit không lưu password, token, PIN hoặc nội dung trẻ không cần thiết.
- Free text của trẻ đi qua `validateChildText`.
- Không thay đổi hoặc mở rộng module ngoài GĐ2 nếu không cần cho seam tích hợp.

## Cổng nghiệm thu

1. Unit test domain rule và integration 401/403/ownership cho route mới.
2. Một assessment thật cho từng khóa trong 12 khóa; có attempt/response lưu DB.
3. Competency result truy ngược được tới evidence; không có điểm “mồ côi”.
4. Một học viên chạy hết learn → submit → review → progress → credential → report.
5. Teacher hoàn thành attendance/review/publish/progress không sửa DB trực tiếp.
6. Parent chỉ xem đúng con; report snapshot không đổi âm thầm sau phát hành.
7. Ba hồ sơ đại diện 6–8, 9–11, 11+ qua UAT.
8. Test, typecheck, build, migration/seed và responsive/browser QA đều có bằng
   chứng; dependency bên ngoài chưa có phải ghi rõ, không giả thành đã nghiệm thu.
