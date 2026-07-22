# UX audit cho mọi vai trò

Ngày kiểm tra: 2026-07-22

## Nguyên tắc đối chiếu

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): một tiêu đề chính, điều hướng nhất quán, trạng thái có thể nhận biết, mục tiêu chạm đủ lớn và không yêu cầu nhập lại dữ liệu không cần thiết.
- [W3C Forms — Validation](https://www.w3.org/WAI/tutorials/forms/validation/): nhãn rõ ràng, hướng dẫn trước khi gửi, kiểm tra cả phía máy khách và máy chủ.
- [W3C Forms — User Notifications](https://www.w3.org/WAI/tutorials/forms/notifications/): phản hồi thành công/lỗi ngắn gọn và trạng thái được công bố cho công nghệ hỗ trợ.
- [GOV.UK step-by-step navigation](https://design-system.service.gov.uk/patterns/step-by-step-navigation/): chia tác vụ dài thành các bước có thứ tự, hiển thị bước hiện tại và việc còn thiếu.

## Kết quả theo vai trò

| Vai trò | Tác vụ chính | Kết quả kiểm tra | Thay đổi |
| --- | --- | --- | --- |
| Học sinh | Tìm khóa, học bốn trạm, xem tiến bộ và sản phẩm | Điều hướng chính ổn định trên desktop/mobile; nội dung khóa học vẫn lấy từ API; không lộ dữ liệu lớp hoặc phụ huynh | Giữ nguyên luồng trẻ em để tránh làm gián đoạn; xác nhận shared shell, route guard và responsive navigation |
| Phụ huynh | Chọn con, xem tổng quan, duyệt hoạt động, quản lý gói | Điều hướng theo tác vụ rõ ràng; khu vực phụ huynh tách khỏi trải nghiệm học sinh | Xác nhận shell riêng, nhãn tiếng Việt và route guard; không thay đổi dữ liệu/quyền |
| Giảng viên | Tạo khóa từ đầu đến khi mở cho học sinh | Trước đây biểu mẫu khóa quá dài, biểu mẫu bài học bị ép trong cột hẹp, thiếu video khi tạo mới, dùng ID và mã nội bộ | Thay bằng wizard 3 bước cho khóa và 4 trạm cho bài; tự tạo đường dẫn; báo mục còn thiếu; thêm video ngay khi tạo; danh sách khóa chỉ rõ hành động tiếp theo; nút chạm tối thiểu 44 px |
| Quản trị viên | Theo dõi hệ thống, tài khoản, phiên, khóa và AI | Trước đây ưu tiên số liệu hơn hành động, dùng thuật ngữ nội bộ/emoji, có biểu mẫu tạo khóa thứ hai nhưng thiếu dữ liệu | Thêm bảng “Việc cần xử lý”; Việt hóa trạng thái/vai trò; một H1 mỗi trang; dùng icon hệ thống; hợp nhất biên soạn khóa với giao diện giảng viên |

## Luồng tạo khóa đã kiểm tra ở mức hợp đồng

1. Tạo bản nháp với đầy đủ thông tin, kết quả đầu ra và công nhận hoàn thành.
2. Tự chuyển sang đúng khóa vừa tạo.
3. Thêm bài học theo bốn trạm: Khám phá → Trò chơi → Sáng tạo → Thử tài.
4. Có thể thêm video HTTPS ngay khi tạo bài.
5. Không gửi yêu cầu khi còn thiếu trường bắt buộc; API vẫn kiểm tra lại dữ liệu và RBAC.
6. Chỉ cho mở khóa khi có ít nhất một bài đang hoạt động; API tiếp tục là lớp bảo vệ cuối cùng.

## Hiệu năng và độ ổn định

- Admin chỉ tải endpoint của tab đang mở, không tải toàn bộ dữ liệu quản trị cùng lúc.
- Các trang theo vai trò được tách thành chunk; build hiện tại: Admin khoảng 8.52 kB gzip, Teacher khoảng 12.03 kB gzip.
- Giao diện cũ của trang giảng viên đã bị xóa khỏi bundle, không chỉ ẩn bằng CSS.
- Toàn bộ build production và 153 unit/contract tests đã qua; 8 integration tests cần `TEST_DATABASE_URL` riêng nên vẫn được skip theo chính sách an toàn.

## Phần còn cần kiểm tra trên trình duyệt thật

Môi trường hiện tại không có browser binding, vì vậy chưa thể ký xác nhận trực quan ở 375 / 768 / 1280 px, keyboard-only, screen reader và đo Core Web Vitals. Đây là cổng QA bắt buộc trước khi phát hành production, không được thay thế bằng kết quả build.
