# Kiểm định 12 khóa học AI Kids

Ngày kiểm định: 2026-07-21  
Nguồn nội dung: 12 tài liệu Markdown trong thư viện `courses`  
Nguồn chạy thật: PostgreSQL/Supabase qua Prisma

## Kết quả đồng bộ

| Track | Khóa | Số bài | Sản phẩm cuối khóa | Huy hiệu |
|---|---|---:|---|---|
| L1 | K1 · Vẽ Thế Giới Tưởng Tượng | 8 | Bản đồ thế giới tưởng tượng | Nhà Thám Hiểm Thế Giới Tí Hon |
| L1 | K2 · Thiết Kế Nhân Vật | 8 | Hồ sơ nhân vật hoàn chỉnh | Nhà Thiết Kế Nhân Vật Tí Hon |
| L1 | K3 · Kể Chuyện | 8 | Câu chuyện minh họa + bản ghi kể chuyện | Người Kể Chuyện Nhí |
| L1 | K4 · Truyện Tranh | 8 | Một tập truyện tranh hoàn chỉnh | Tác Giả Truyện Tranh Tí Hon |
| L1 | K5 · Đạo Diễn Chuyển Động | 8 | Chuỗi cảnh chuyển động kể chuyện | Đạo Diễn Chuyển Động Tí Hon |
| L1 | K6 · Phim Ngắn Đầu Tay | 10 | Phim ngắn đầu tay | Đạo Diễn Nhí — Phim Đầu Tay |
| L2 | K1 · Vẽ Thế Giới Tưởng Tượng | 16 | Bản đồ thế giới tưởng tượng | Kiến Trúc Sư Thế Giới |
| L2 | K2 · Thiết Kế Nhân Vật | 16 | Character bible | Kiến Trúc Sư Nhân Vật |
| L2 | K3 · Kể Chuyện | 16 | Câu chuyện minh họa + bản ghi kể chuyện | Người Kể Chuyện Bậc Thầy |
| L2 | K4 · Truyện Tranh | 16 | Một tập truyện tranh hoàn chỉnh | Tác Giả Truyện Tranh Chuyên Nghiệp |
| L2 | K5 · Đạo Diễn Chuyển Động | 16 | Chuỗi cảnh chuyển động | Đạo Diễn Chuyển Động |
| L2 | K6 · Phim Ngắn Đầu Tay | 16 | Phim ngắn đầu tay + công chiếu | Đạo Diễn Nhí StoryMee — Tốt Nghiệp Capstone |

Tổng: **12 khóa / 146 bài**. Mỗi bài lưu đúng bốn trạm từ tài liệu:
**Bài giảng → Game → Thực hành → Kiểm tra** và đúng giai đoạn
`ideate`/`produce`.

## Năng lực hệ thống hiện tại

### Đã đáp ứng ở mức chạy thật

- Catalog chỉ hiển thị 12 khóa L1/L2; bốn khóa legacy được giữ để bảo toàn liên kết cũ nhưng không làm sai số catalog.
- Khóa bài tuần tự, resume tiến độ và chỉ mở bài tiếp theo sau bài hiện tại.
- Nội dung, mục tiêu, game, thực hành, sản phẩm và rubric được sinh có kiểm tra từ 12 tài liệu; DB là nguồn runtime duy nhất.
- Game là một phase được server lưu riêng trong chuỗi `learn → game → practice → check`, có mẫu `spin`, `order/drag`, `match`, `detective` và `pick`; tải lại trang không bỏ qua game và API từ chối yêu cầu nhảy phase.
- Xưởng hiện có: sổ tay, bảng màu, canvas phác thảo, hồ sơ nhân vật, nhịp truyện, comic 4 khung, chọn ảnh AI, tạo chuyển động/video và tái dùng asset khóa học trước.
- Sản phẩm và huy hiệu lưu private theo học sinh; ảnh tùy ý từ bên ngoài không được dùng làm AI reference.
- Rubric cuối khóa lấy nguyên tiêu chí từ từng tài liệu. Thiếu một tiêu chí thì chưa cấp huy hiệu hoàn thành khóa.
- Mỗi khóa công bố rõ đơn vị ghi nhận, bài đánh giá, huy hiệu và quan hệ “tham chiếu” với văn bản của Bộ; không tuyên bố được Bộ phê duyệt.
- Payload thực hành được giới hạn kích thước/độ sâu/số trường, lọc PII cả trong story/comic/video lồng nhau và không thể đổi `kind` để kích hoạt tác vụ AI tốn phí.
- PostgreSQL `CHECK constraint` đã được đồng bộ với phase, asset, notification và huy hiệu hoàn thành thực tế; constraint vẫn được giữ để chặn giá trị ngoài danh sách.
- Route lớp học giáo viên không còn N+1 query gây vượt pool Supabase 15 kết nối.

### Đã mô phỏng đúng luồng nhưng chưa phải studio chuyên dụng

- Các game dùng năm archetype dùng lại và hiển thị đúng nhiệm vụ từng bài; chưa có 146 bộ câu hỏi/hình minh họa riêng.
- Comic hiện là xưởng 4 khung cơ bản; chưa có canvas tự do nhiều layout, bubble/SFX kéo-thả và xuất PDF.
- Story/world bible/character bible hiện lưu qua form/portfolio; chưa có editor tài liệu nhiều mục chuyên dụng.
- Video AI tạo theo mô tả và asset riêng tư; chưa có timeline nhiều track, trim, transition, lồng tiếng và mixer nhạc như phần mềm dựng phim.
- Luồng phụ huynh có portfolio/approval nền tảng, nhưng rubric cuối khóa chưa có chữ ký xác nhận riêng của phụ huynh/giáo viên.

## Đầu vào còn thiếu để nội dung giới thiệu có thể hứa đầy đủ

1. **146 video bài giảng thật** hoặc tối thiểu 146 voice-over + slide đã duyệt. Video mẫu Google đã bị xóa; khi chưa có asset, hệ thống hiển thị bài giảng dạng thẻ chữ và không giả vờ có video.
2. **Bộ dữ liệu game riêng theo bài**: đáp án, ảnh minh họa và âm thanh phản hồi đã được chuyên gia nội dung duyệt. Hiện hệ thống có engine/archetype, chưa có 146 content pack chuyên biệt.
3. **Studio ghi âm/dựng phim**: cần chốt nơi lưu object storage, giới hạn thời lượng, thời gian lưu/xóa dữ liệu trẻ em và danh mục nhạc/SFX có giấy phép trước khi bật upload bản ghi cho học sinh.
4. **Bằng chứng công nhận bên ngoài**: tên tổ chức, phạm vi công nhận và văn bản/đường dẫn xác minh. Khi chưa có bằng chứng, chỉ AI Kids Creator Academy được ghi là đơn vị cấp huy hiệu nội bộ.
5. **Phiên browser QA** để chụp và duyệt chính thức ở 375 px/1280 px. Build và source accessibility đã qua kiểm tra, nhưng môi trường kiểm định hiện không cung cấp browser session.

## Câu chữ công nhận được phép dùng

> Khóa học do AI Kids Creator Academy ghi nhận hoàn thành và được thiết kế có
> tham chiếu Thông tư 02/2025/TT-BGDĐT cùng Quyết định 3439/QĐ-BGDĐT. Đây không
> phải chứng nhận hoặc phê duyệt khóa học của Bộ Giáo dục và Đào tạo.

Không dùng các cụm “được Bộ công nhận”, “chuẩn Bộ”, “chứng chỉ Bộ” hoặc tên một
tổ chức bên ngoài khi chưa có bằng chứng pháp lý tương ứng.

## Lệnh vận hành

```powershell
node apps/api/prisma/scripts/generate-curriculum-content.mjs
npm exec prisma migrate deploy --workspace @aikids/api
$env:SEED_OVERWRITE_CONTENT='true'; npm run db:seed --workspace @aikids/api
npm run test:all
npm run build
```

Seed mặc định bảo toàn nội dung CMS. Chỉ đặt `SEED_OVERWRITE_CONTENT=true` khi
chủ động đồng bộ lại 12 tài liệu đã duyệt.
