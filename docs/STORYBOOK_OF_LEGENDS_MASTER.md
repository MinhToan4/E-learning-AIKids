# 📖 STORYBOOK OF LEGENDS
## Tài Liệu Thiết Kế Sản Phẩm Toàn Diện
> Version 2.0 · Hợp nhất · 27/07/2026
> E-learning AIKids × Xưởng Sáng Tạo AIKidApp

---

## MỤC LỤC

1. [Triết Lý & Mục Đích](#i-triết-lý--mục-đích)
2. [Nguyên Tắc Cốt Lõi — Trang Độc Lập](#ii-nguyên-tắc-cốt-lõi--trang-độc-lập)
3. [Kiến Trúc Cuốn Sách — Vô Hạn & Mở Rộng](#iii-kiến-trúc-cuốn-sách--vô-hạn--mở-rộng)
4. [Thiết Kế Chi Tiết Trang Sách](#iv-thiết-kế-chi-tiết-trang-sách)
5. [Hệ Thống Hint — S9 Boss Badge](#v-hệ-thống-hint--s9-boss-badge)
6. [Social Layer — Thích / Chia Sẻ / Tương Tác](#vi-social-layer--thích--chia-sẻ--tương-tác)
7. [Gallery Wall — Triển Lãm Sáng Tạo](#vii-gallery-wall--triển-lãm-sáng-tạo)
8. [8 Cơ Chế Tương Tác](#viii-8-cơ-chế-tương-tác)
9. [Leaderboard — Bảng Xếp Hạng](#ix-leaderboard--bảng-xếp-hạng)
10. [Reward System — Phần Thưởng](#x-reward-system--phần-thưởng)
11. [UI / Visual Guidelines](#xi-ui--visual-guidelines)
12. [Framework Mở Rộng Vô Hạn](#xii-framework-mở-rộng-vô-hạn)
13. [Phân Kỳ Triển Khai](#xiii-phân-kỳ-triển-khai)
14. [Đo Lường Thành Công](#xiv-đo-lường-thành-công)

---

## I. TRIẾT LÝ & MỤC ĐÍCH

### Vấn Đề Cần Giải Quyết

Hệ thống achievement thông thường có 3 điểm yếu:
- **Passive** — mở badge rồi thôi, không kéo dài engagement
- **Linear** — phải làm A xong mới làm B → trẻ bị chặn, bỏ cuộc
- **Flat** — danh sách không kể chuyện, không tạo cảm xúc

### Storybook of Legends Giải Quyết Thế Nào

| Vấn đề cũ | Giải pháp |
|-----------|----------|
| Badge rời rạc | Mỗi badge = 1 sticker, ghép vào trang sách trực quan |
| Phải làm tuần tự | **Mọi trang mở song song** — con chọn trang nào làm trước |
| Không có cảm xúc đỉnh | Hoàn thành trang → video/story/ebook unlock đặc biệt |
| Không có social | Hệ thống reactions, remix, challenge, co-create |
| Nội dung cố định | Framework vô hạn — thêm trang mới bất kỳ lúc nào |

### Mục Đích Kép

```
📚 E-learning AIKids          🎨 Xưởng Sáng Tạo AIKidApp
─────────────────────         ──────────────────────────
Tiến trình học tập            Tiến trình sáng tạo cá nhân
Quests, khóa học, kiến thức   Tạo truyện, nhân vật, Mee, art
→ Trang sách học tập          → Trang sách sáng tạo

                 ↘         ↙
           📖 STORYBOOK OF LEGENDS
           (Cuốn sách chung — shared profile)
           Con phát triển toàn diện cả 2 chiều
```

---

## II. NGUYÊN TẮC CỐT LÕI — TRANG ĐỘC LẬP

> **Nguyên tắc quan trọng nhất của toàn bộ hệ thống:**
> Mọi trang sách đều mở sẵn từ đầu. Không có trang nào bị lock chờ trang kia.

### Tại Sao Phải Độc Lập?

```
❌ Hệ thống tuần tự (KHÔNG làm):
   Trang 1 ──unlock──> Trang 2 ──unlock──> Trang 3 ...
   → Trẻ bị chặn ở trang 1 → nản → bỏ cuộc
   → Áp lực phải làm đúng thứ tự
   → Mất 2-3 tuần mới thấy nội dung mới

✅ Hệ thống song song (LÀM):
   Trang 1 ←── Con làm bất kỳ thứ tự ──→ Trang 5
   Trang 2 ←──────────────────────────→ Trang 7
   Trang 3 ←──────────────────────────→ Trang 9 (mới thêm)
   → Con tự chọn trang phù hợp sở thích hôm nay
   → Luôn có tiến trình ở nhiều nơi
   → Không bao giờ bị "kẹt"
```

### Cơ Chế Điều Hướng Thông Minh

Thay vì lock, dùng **"Đề Xuất Thông Minh"**:

```
Khi con mở app:
  → Hệ thống phân tích trang nào đang dở dang nhiều nhất
  → Gợi ý: "Con còn thiếu 2 sticker ở Trang 3 — làm tiếp nhé?"
  → Nhưng con hoàn toàn tự do chọn trang khác
```

### Progression Không Chặn

```
Trang có 2 trạng thái duy nhất:
  ⬜ IN PROGRESS  — đang thu thập sticker (0/9 đến 8/9)
  ✅ COMPLETED    — đủ 9 sticker, video đã unlock

Không có trạng thái "locked" hay "chưa mở"
```

---

## III. KIẾN TRÚC CUỐN SÁCH — VÔ HẠN & MỞ RỘNG

### Cấu Trúc Phân Loại

```
📖 STORYBOOK OF LEGENDS
│
├── 📚 NHÓM: HỌC TẬP (Learning)        ← E-learning AIKids
│   Trang thuộc nhóm này khi trigger chủ yếu từ quests/courses
│
├── 🎨 NHÓM: SÁNG TẠO (Creative)       ← Xưởng Sáng Tạo
│   Trang thuộc nhóm này khi trigger chủ yếu từ Mee/Story/Art
│
├── 🤝 NHÓM: XÃ HỘI (Social)           ← Cả 2 app
│   Trang thuộc nhóm này khi trigger từ reactions/share/challenge
│
├── ⭐ NHÓM: CỘT MỐC (Milestone)       ← Cả 2 app
│   Trang thuộc nhóm này khi trigger từ streak/level/tổng quát
│
└── 🎪 NHÓM: SỰ KIỆN (Events)          ← Time-limited
    Trang có thời gian, thêm mãi theo lịch
```

### Danh Sách Trang — Launch Set (8 Trang Cố Định)

| # | Tên Trang | Nhóm | Nguồn Sticker Chính |
|---|-----------|------|---------------------|
| P01 | Cánh Cổng Thế Giới AI | 📚 Học Tập | E-learning: quests, streak |
| P02 | Vương Quốc Ngôn Ngữ | 📚 Học Tập | E-learning: story, vocab |
| P03 | Đại Dương Hình Ảnh | 🎨 Sáng Tạo | Xưởng: art, Mee |
| P04 | Đỉnh Núi Tri Thức | ⭐ Cột Mốc | Cả 2: tổng hợp milestone |
| P05 | Xưởng Của Paco | 🎨 Sáng Tạo | Xưởng: projects |
| P06 | Rừng Nhân Vật | 🎨 Sáng Tạo | Xưởng: characters |
| P07 | Thiên Hà Câu Chuyện | 🎨 Sáng Tạo | Xưởng: stories |
| P08 | Trái Tim Kết Nối | 🤝 Xã Hội | Reactions/Share/Challenge |

### Trang Có Thể Thêm Theo Thời Gian

```
Tháng 2/2026:   P09 — "Bầu Trời Âm Nhạc"        [🎨 Sáng Tạo]
Tháng 3/2026:   P10 — "Thế Giới Toán Học AI"     [📚 Học Tập]
Tháng 4/2026:   P11 — "Hall of Legends"          [⭐ Cột Mốc — Siêu khó]
Quý 3/2026:     P12 — "Vũ Đài Thách Đấu"         [🤝 Xã Hội]
Mỗi quý:        1-2 trang mới theo roadmap sản phẩm
```

### Trang Sự Kiện — Thêm Vô Hạn

```
🌸 Tết 2026          (01-03/02/2026)
☀️  Hè Phiêu Lưu    (01-31/07/2026)
🎃 Halloween         (15-31/10/2026)
🎄 Giáng Sinh        (20-31/12/2026)
🌙 Trung Thu         (Ngày Trung Thu hàng năm)
✏️  Ngày Nhà Giáo    (20/11 hàng năm)
... thêm vô hạn
```

> **Quan trọng:** Trang sự kiện cũng hoàn toàn độc lập — con có thể bỏ qua event page và không ảnh hưởng gì đến 8 trang cố định.

---

## IV. THIẾT KẾ CHI TIẾT TRANG SÁCH

### Nguyên Tắc 9 Sticker Mỗi Trang

```
┌─────────────────────────────────────────┐
│  [S1]   [S2]   [S3]   ← Tầng Dễ        │
│  [S4]   [S5]   [S6]   ← Tầng Trung     │
│  [S7]   [S8]   [S9★]  ← Tầng Boss      │
└─────────────────────────────────────────┘

S1–S3: Có thể đạt trong tuần đầu
S4–S6: Cần 2–4 tuần kiên trì
S7–S8: Cần nỗ lực đáng kể (streak dài, nhiều quests)
S9★:   Boss Badge — LUÔN có Hint, LUÔN là Foil đặc biệt
```

---

### 📄 P01 — "CÁNH CỔNG THẾ GIỚI AI"
**Nhóm:** 📚 Học Tập | **Màu:** Tím #6B46C1 + Vàng #F6E05E
**Visual trang:** Paco đứng trước cánh cổng phát sáng, con đường vàng dẫn vào

| Slot | Tên Sticker | Trigger (Completion-based) | Visual | Loại |
|------|-------------|--------------------------|--------|------|
| S1 | Bước Chân Đầu Tiên | Hoàn thành quest đầu tiên | 👟 Dấu chân phát sáng | Thường |
| S2 | Người Đặt Câu Hỏi | Dùng tính năng hỏi AI lần đầu | 💬 Bong bóng ? | Thường |
| S3 | Ngôi Sao Đầu Tiên | Đạt 2 sao lần đầu | ⭐ Sao nhỏ lung linh | Thường |
| S4 | 3 Ngày Liên Tiếp | Streak 3 ngày | 🔥 Ngọn lửa nhỏ | Thường |
| S5 | Tốt Nghiệp Chương 1 | Hoàn thành tất cả quest Chapter 1 | 🎓 Mũ tốt nghiệp | Thường |
| S6 | Nhà Sưu Tầm Sao | Đạt tổng 10 ngôi sao | 🌠 Cụm 3 sao | Thường |
| S7 | Tuần Lễ Chăm Chỉ | Streak 7 ngày | ⚡ Sấm sét vàng | Thường |
| S8 | Người Khám Phá | Enroll vào 2 khóa học | 🗺️ Bản đồ cuộn | Thường |
| S9★ | **Paco's Chosen One** | Xem Hint | 🌟 Paco ngồi sao — FOIL tím | Boss Foil |

**🎬 Page Complete:** Video 20s Paco mở cánh cổng → "Con đã sẵn sàng!"
**🎁 Reward:** Frame "Học Sinh Mới" + Title "Người Khai Phá"

---

### 📄 P02 — "VƯƠNG QUỐC NGÔN NGỮ"
**Nhóm:** 📚 Học Tập | **Màu:** Emerald #276749 + Vàng cổ #D4A017
**Visual trang:** Paco cầm bút lông giữa thư viện khổng lồ

| Slot | Tên Sticker | Trigger | Visual | Loại |
|------|-------------|---------|--------|------|
| S1 | Từ Mới Đầu Tiên | Học 1 từ vựng mới trong quest | 📝 Tờ giấy chữ nổi | Thường |
| S2 | Kể Chuyện Ngắn | Hoàn thành 1 quest story-writing | 📖 Sách nhỏ mở | Thường |
| S3 | Bạn Đọc Sách | Đọc xong 1 unit nội dung | 🔖 Bookmark vàng | Thường |
| S4 | Nhà Văn Nhỏ | Tạo câu chuyện đầu trong Xưởng | ✍️ Bút đang viết | Thường |
| S5 | 10 Quest Hoàn Thành | Tổng 10 quests done | 🏅 Huy chương đồng | Thường |
| S6 | Song Ngữ | Hoàn thành quest ngôn ngữ thứ 2 | 🌍 Địa cầu nhỏ | Thường |
| S7 | Được Yêu Thích | Nhận 10 reactions trên tác phẩm | 💌 Phong thư bay lên | Social |
| S8 | 30 Ngôi Sao | Tổng 30 ngôi sao | 🌟 Vương miện sao | Thường |
| S9★ | **Paco's Storyteller** | Xem Hint | 📜 Cuộn giấy seal vàng — FOIL đỏ | Boss Foil |

**🎬 Page Complete:** Mini interactive story — con chọn kết thúc cho câu chuyện của Paco
**🎁 Reward:** Badge "Nhà Văn Vương Quốc" + Frame "Thư Viện Cổ"

---

### 📄 P03 — "ĐẠI DƯƠNG HÌNH ẢNH"
**Nhóm:** 🎨 Sáng Tạo | **Màu:** Ocean #0369A1 + Coral #FB7185
**Visual trang:** Paco trên thuyền giấy, hình ảnh AI nổi như bong bóng

| Slot | Tên Sticker | Trigger | Visual | Loại |
|------|-------------|---------|--------|------|
| S1 | Họa Sĩ Nhỏ | Tạo hình ảnh AI lần đầu (Art) | 🎨 Bảng màu | Thường |
| S2 | Nhân Vật Đầu Tiên | Tạo nhân vật AI lần đầu | 🧑‍🎨 Silhouette nhân vật | Thường |
| S3 | Mee Ra Đời | Tạo Mee lần đầu | 🤖 Mặt Mee dễ thương | Thường |
| S4 | Bộ Sưu Tập 5 | Tạo 5 hình ảnh AI | 🖼️ Khung ảnh nhỏ | Thường |
| S5 | Phong Cách Khác Biệt | Thử 3 phong cách art | 🎭 Mặt nạ nghệ thuật | Thường |
| S6 | Tác Phẩm Bay Xa | Tác phẩm được share bởi 3 người | 📡 Ăng ten sóng | Social |
| S7 | Nghệ Sĩ 10 Tác Phẩm | Tổng 10 hình ảnh AI | 🖌️ Cọ vẽ tia sáng | Thường |
| S8 | Nhà Sáng Tạo Comic | Tạo 1 trang comic hoàn chỉnh | 💥 Bong bóng "POW!" | Thường |
| S9★ | **Ocean Artist** | Xem Hint | 🌊 Sóng có hình AI bên trong — FOIL xanh Animated | Boss Foil |

**🎬 Page Complete:** Montage hình ảnh con đã tạo bay lên xếp thành mosaic
**🎁 Reward:** Badge "Họa Sĩ Đại Dương" + Frame "Ocean Wave" animated

---

### 📄 P04 — "ĐỈNH NÚI TRI THỨC"
**Nhóm:** ⭐ Cột Mốc | **Màu:** Nâu #78350F + Vàng kim #FBBF24
**Visual trang:** Paco đứng trên đỉnh núi, cờ tung bay

| Slot | Tên Sticker | Trigger | Visual | Loại |
|------|-------------|---------|--------|------|
| S1 | Học Sinh Kiên Trì | Streak 14 ngày | 💎 Kim cương nhỏ | Thường |
| S2 | Tốt Nghiệp Khóa 1 | Hoàn thành 1 course | 🏫 Ngôi trường | Thường |
| S3 | 100 Ngôi Sao | Tổng 100 stars | 👑 Vương miện vàng | Thường |
| S4 | Nhà Vô Địch Tuần | Top 3 leaderboard 1 tuần | 🥇 Huy chương vàng | Thường |
| S5 | Bộ Sưu Tập Hoàn Hảo | 3 sao ở 10 quest liên tiếp | 🌟🌟🌟 Ba sao | Thường |
| S6 | Ngọn Hải Đăng | Tác phẩm được cite làm cảm hứng 5 lần | 🏮 Đèn hải đăng | Social |
| S7 | Người Truyền Cảm Hứng | 5 người bắt đầu từ referral của con | 🤝 Bắt tay | Thường |
| S8 | Streak Huyền Thoại | Streak 30 ngày | 🔥🔥🔥 Ngọn lửa lớn Animated | Thường |
| S9★ | **The Summit** | Xem Hint | ⛰️ Đỉnh núi bình minh — GOLD FOIL Premium | Boss Foil |

**🎬 Page Complete:** "Thư Của Paco" personalized — đọc tên con, số quest, streak thực tế
**🎁 Reward:** Badge "Học Sinh Huyền Thoại" + Frame "Golden Summit" + Title "Người Leo Núi"

---

### 📄 P05 — "XƯỞNG CỦA PACO"
**Nhóm:** 🎨 Sáng Tạo | **Màu:** Cam #C2410C + Vàng #FCD34D
**Visual trang:** Paco trước bảng thiết kế đầy ý tưởng

| Slot | Tên Sticker | Trigger | Visual | Loại |
|------|-------------|---------|--------|------|
| S1 | Mở Cửa Xưởng | Đăng nhập Xưởng Sáng Tạo lần đầu | 🔑 Chìa khóa vàng | Thường |
| S2 | Thợ Học Nghề | Tạo project đầu tiên | 🔨 Búa nhỏ | Thường |
| S3 | Paco Biết Mặt | Tạo Mee cá nhân đầu tiên | 🤖 Mee nhỏ | Thường |
| S4 | Người Thách Đấu | Gửi Challenge lần đầu | ⚡ Tia sét thách đấu | Social |
| S5 | Bộ Sưu Tập Nhân Vật | Tạo 3 nhân vật khác nhau | 🎭 Màn sân khấu | Thường |
| S6 | Chia Sẻ Niềm Vui | Share 1 tác phẩm từ Xưởng | 🎁 Hộp quà | Thường |
| S7 | Thợ Lành Nghề | Tạo 10 project | ⚙️ Bánh răng | Thường |
| S8 | Sáng Tạo Đa Năng | Dùng cả Mee + Art + Story trong 1 tuần | 🌈 Cầu vồng nhỏ | Thường |
| S9★ | **Paco's Partner** | Xem Hint | 🤝 Paco + nhân vật cầm tay — FOIL cam | Boss Foil |

**🎬 Page Complete:** Stamp "Thành Viên Chính Thức" đóng lên trang + Mini-zine PDF download
**🎁 Reward:** Badge "Thành Viên Xưởng" + Frame "Workshop Orange"

---

### 📄 P06 — "RỪNG NHÂN VẬT"
**Nhóm:** 🎨 Sáng Tạo | **Màu:** Xanh rừng #14532D + Tím #7C3AED
**Visual trang:** Paco giữa khu rừng — xung quanh là các nhân vật

| Slot | Tên Sticker | Trigger | Visual | Loại |
|------|-------------|---------|--------|------|
| S1 | Người Tạo Nhân Vật | Tạo 5 nhân vật | 🧑 Silhouette + sao | Thường |
| S2 | Đa Sắc Màu | Nhân vật với 5 màu khác nhau | 🎨 Bảng màu tròn | Thường |
| S3 | Nhân Vật Bí Ẩn | Nhân vật có backstory/description | 📜 Cuộn giấy | Thường |
| S4 | Mee Phong Cách | Thử 5 accessory trên Mee | 💄 Gương nhỏ | Thường |
| S5 | Đoàn Hùng Mạnh | Tạo 10 nhân vật | ⚔️ Kiếm nhỏ | Thường |
| S6 | Remix Creator | Tạo 1 remix tác phẩm người khác | 🎛️ Nút remix | Social |
| S7 | Nhà Thiết Kế Trang Phục | Thay đồ nhân vật 20 lần | 👗 Chiếc áo | Thường |
| S8 | Hội Đồng Nhân Vật | Có 15 nhân vật đã tạo | 🏛️ Cột trụ | Thường |
| S9★ | **The Legend** | Xem Hint | ⭐ Nhân vật dưới spotlight — FOIL tím Animated | Boss Foil |

**🎬 Page Complete:** "Rừng Nhân Vật" — tất cả nhân vật con đã tạo vẫy tay chào
**🎁 Reward:** Badge "Lord of Characters" + Frame "Enchanted Forest" animated

---

### 📄 P07 — "THIÊN HÀ CÂU CHUYỆN"
**Nhóm:** 🎨 Sáng Tạo | **Màu:** Đen #0F172A + Tím galaxy #818CF8 + Vàng sao #FDE68A
**Visual trang:** Paco trên tàu vũ trụ, bong bóng câu chuyện xung quanh

| Slot | Tên Sticker | Trigger | Visual | Loại |
|------|-------------|---------|--------|------|
| S1 | Người Kể Chuyện | Hoàn thành 1 câu chuyện hoàn chỉnh | 📚 Sách xanh | Thường |
| S2 | Nhiều Kết Thúc | Câu chuyện có nhiều ending | 🔀 Mũi tên phân nhánh | Thường |
| S3 | Câu Chuyện Dài | Story trên 500 từ | 📏 Thước đo | Thường |
| S4 | Comic Creator | Tạo 1 comic từ câu chuyện | 💥 Bong bóng comic | Thường |
| S5 | Thư Viện Riêng | Có 5 câu chuyện hoàn thành | 🗂️ Kệ sách nhỏ | Thường |
| S6 | Nhà Văn Nhóm | Hoàn thành 1 co-create story | 🤝 Bàn tay chạm nhau | Social |
| S7 | Nhà Văn Đa Thể Loại | Viết story ở 3 genre khác nhau | 🎭 Mask hài + bi | Thường |
| S8 | 10 Câu Chuyện | Hoàn thành 10 câu chuyện | 🌌 Thiên hà xoáy | Thường |
| S9★ | **Galaxy Narrator** | Xem Hint | 🌟 Sách phát sáng vũ trụ — FOIL galaxy Animated Premium | Boss Foil |

**🎬 Page Complete:** "Quyển Sách Đầu Tiên" — PDF/ebook tổng hợp câu chuyện con, có bìa tên con
**🎁 Reward:** Badge "Galaxy Narrator" + Frame "Starfield" twinkle + Title "Nhà Văn Vũ Trụ"

---

### 📄 P08 — "TRÁI TIM KẾT NỐI"
**Nhóm:** 🤝 Xã Hội | **Màu:** Hồng #EC4899 + Vàng #FBBF24 + Trắng
**Visual trang:** Paco giữa mạng lưới trái tim nối từ nhân vật này sang nhân vật khác

| Slot | Tên Sticker | Trigger | Visual | Loại |
|------|-------------|---------|--------|------|
| S1 | Người Đặt Tim Đầu Tiên | React cho tác phẩm người khác lần đầu | ❤️ Trái tim nhỏ | Social |
| S2 | Cổ Động Viên | React cho 10 tác phẩm của bạn | 📣 Loa kèn | Social |
| S3 | Ngôi Sao Nổi | Tác phẩm vào Gallery Wall lần đầu | 🌟 Ngôi sao gallery | Social |
| S4 | Người Chia Sẻ | Share 5 tác phẩm ra community | 📤 Mũi tên bay lên | Social |
| S5 | Paco Tự Hào | Nhận 3 Paco Pick 🐾 | 🐾 Dấu chân Paco | Social |
| S6 | Truyền Cảm Hứng | Tác phẩm được share bởi 5 người khác | 💫 Tia sáng tỏa ra | Social |
| S7 | Trái Tim Vàng | Đứng top "Người Lan Toả" ít nhất 1 tuần | 💛 Trái tim vàng lớn | Social |
| S8 | Nghệ Sĩ Được Yêu | Nhận tổng 100 reactions | 🌈 Tim cầu vồng | Social |
| S9★ | **Community Legend** | Xem Hint | 💎 Tim kim cương — FOIL hồng + sparkle Animated | Boss Social Foil |

**🎬 Page Complete:** Paco đọc "Bức Thư Từ Cộng Đồng" — tên những bạn đã react nhiều nhất cho con
**🎁 Reward:** Badge "Heart of the Community" + Frame "Connection" + Title "Người Kết Nối"

---

### 📄 EVENT — "TẾT SÁNG TẠO 2026" *(Ví Dụ)*
**Nhóm:** 🎪 Sự Kiện | **Thời gian:** 25/01–03/02/2026
**Màu:** Đỏ #DC2626 + Vàng #FBBF24
**Visual trang:** Paco mặc áo dài đỏ, hoa mai + pháo hoa phía sau

| Slot | Tên Sticker | Trigger | Visual | Loại |
|------|-------------|---------|--------|------|
| S1 | Chào Năm Mới | Login trong 3 ngày Tết | 🧧 Bao lì xì đỏ | Event |
| S2 | Câu Đối AI | Tạo story chủ đề Tết | 📜 Câu đối đỏ | Event |
| S3 | Áo Dài Mee | Mặc outfit Tết cho Mee | 👘 Áo dài miniature | Event |
| S4 | Bánh Chưng | Hoàn thành 1 quest trong mùng | 🟩 Bánh chưng | Event |
| S5 | Mai Vàng | Tạo hình ảnh AI hoa xuân | 🌸 Hoa mai vàng | Event |
| S6 | Lì Xì Cho Bạn | Share tác phẩm Tết cho người khác | 🎁 Lì xì bay | Event+Social |
| S7 | Pháo Hoa | Streak trong suốt 7 ngày Tết | 🎆 Pháo hoa | Event |
| S8 | Bộ Sưu Tập Tết | Nhận 5 reactions từ 5 người khác nhau | 🏮 Đèn lồng vàng | Event+Social |
| S9★ | **Thần Tài Paco** | Hoàn thành S1–S8 | 🦁 Paco Thần Tài — FOIL đỏ vàng | Event Boss |

**🎬 Event Complete:** Animated Tết card có tên con — có thể gửi cho gia đình
**Sticker hết hạn:** Greyed out, tooltip "Tết 2026 — Đã kết thúc · Không thể mở lại"

---

## V. HỆ THỐNG HINT — S9 BOSS BADGE

### Triết Lý

S9 phải đủ khó để có cảm giác thành tựu, nhưng không bao giờ khiến trẻ bỏ cuộc. Hint system là cầu nối giữa "bí ẩn kích thích" và "rõ ràng đủ để làm."

### 3 Cấp Độ Hint

```
🔍 HINT LEVEL 1 — "Thơ Bí Ẩn"
Kích hoạt: Ngay khi con đặt sticker S8 (chưa có S9)
Nội dung: Câu thơ / ẩn dụ, gợi cảm xúc chứ không gợi hành động
Mục đích: Kích thích tò mò

🔍 HINT LEVEL 2 — "Lời Khuyên Của Paco"
Kích hoạt: Sau 3 ngày kể từ khi có S8 mà chưa unlock S9
Nội dung: Gợi ý cụ thể hơn về hướng đi
Mục đích: Định hướng mà không spoil

🔍 HINT LEVEL 3 — "Sơ Đồ Kho Báu"
Kích hoạt: Sau 7 ngày (chỉ với S9 cực khó — P04, P07)
Nội dung: Gần như nói thẳng điều cần làm
Mục đích: Đảm bảo không ai bỏ cuộc vì không hiểu
```

### Hint Chi Tiết Từng Trang

| Trang | S9 Trigger Thực | Hint 1 | Hint 2 | Hint 3 |
|-------|----------------|--------|--------|--------|
| P01 | Replay 1 quest cũ để cải thiện số sao | "Không phải người nhanh nhất mà là người không bỏ cuộc" | "Thử quay lại bài đã làm và làm tốt hơn lần trước" | "Vào lại bất kỳ quest đã hoàn thành và nâng lên 3 sao" |
| P02 | Tạo câu chuyện trong Xưởng VÀ chỉnh sửa ít nhất 1 lần | "Nhà văn thực sự không chỉ viết — họ đọc lại và sửa" | "Hãy vào Xưởng, viết 1 câu chuyện rồi quay lại sửa nó" | "Tạo story → save → vào lại → chỉnh sửa → save lại" |
| P03 | Dùng cả 3 tính năng (Nhân Vật + Câu Chuyện + Art) trong 1 project | "Nghệ sĩ vĩ đại chưa bao giờ vẽ một mình" | "Thử kết hợp nhân vật + câu chuyện + hình ảnh trong 1 tác phẩm" | "Tạo nhân vật → viết story có nhân vật đó → thêm hình AI" |
| P04 | Hoàn thành cả P01 + P02 + P03 VÀ có 1 tác phẩm được share | "Đỉnh núi chỉ trao thưởng cho ai đã leo đủ mọi loại địa hình" | "Bạn đang thiếu điều gì đó ở các trang khác — hãy nhìn lại" | "Hoàn thành trang 1, 2, 3 và share ít nhất 1 tác phẩm ra ngoài" |
| P05 | Tạo story có mention/dùng nhân vật Paco mascot | "Xưởng chỉ hoạt động khi có 2 người" | "Paco đang đợi xuất hiện trong câu chuyện của bạn" | "Tạo story có tên 'Paco' hoặc dùng mascot Paco làm nhân vật" |
| P06 | Tạo nhân vật đặt tên trùng nickname của user (self-character) | "Trong mọi huyền thoại, có 1 nhân vật không giống ai — chính là bạn" | "Thách thức: tạo nhân vật chính là CON, không phải tưởng tượng" | "Tạo nhân vật đặt tên bằng nickname của bạn trong app" |
| P07 | Tạo story đa chương + nhân vật tự tạo + hình AI + share | "Câu chuyện kỳ diệu nhất kết hợp được TẤT CẢ" | "1 câu chuyện, nhiều chương, nhân vật của bạn, hình AI, chia sẻ" | "Multi-chapter story với character bạn tạo + AI art + share ra class" |
| P08 | Hoàn thành trang 5+6+7 — tự động mở | "Huyền thoại được viết bởi người không bỏ cuộc kể cả khi không ai nhìn" | "Bạn đang rất gần rồi. Hãy hoàn thành những trang còn lại" | "Hoàn thành Trang 5, 6, 7 — Community Legend sẽ tự xuất hiện" |

### UI Hint Display

```
┌────────────────────────────────────────────┐
│  S9 — ??? [Chưa mở]                        │
│                                            │
│  💬 Paco thì thầm:                         │
│  "Không phải người nhanh nhất mà là        │
│   người không bỏ cuộc..."                  │
│                                            │
│  [Xem gợi ý tiếp → còn 3 ngày]            │
│  [Tôi cần thêm trợ giúp — Mở Level 3]     │
└────────────────────────────────────────────┘
```

---

## VI. SOCIAL LAYER — THÍCH / CHIA SẺ / TƯƠNG TÁC

### 6.1 — Reaction Set (Thay Vì Like Đơn Thuần)

```
🌟  Xuất Sắc!
🎨  Sáng Tạo Quá!
🔥  Nóng Bỏng!
🤩  Mình Thích Lắm!
💡  Ý Tưởng Hay!
🐾  Paco Tự Hào!  ← Mỗi user CHỈ CÓ 3 lần/tuần — cực kỳ hiếm
```

### 6.2 — Share Scope

| Scope | Đối tượng xem | Ai tương tác được |
|-------|--------------|-----------------|
| 🔒 Private | Chỉ bản thân + bố mẹ | Không ai |
| 👨‍👩‍👧 Family | Gia đình | Bố mẹ react |
| 🏫 Class | Bạn cùng lớp | Bạn cùng lớp react |
| 🌍 Community | Toàn AIKids community | Moderated reactions |

### 6.3 — Điểm Social (Ẩn, Chỉ Dùng Cho BXH)

```
Reaction Point (RP)    — Số reactions nhận được
Giving Point (GP)      — Số reactions đã cho người khác
Reach Point (REP)      — Số lần tác phẩm được share
Impact Point (IP)      — Số reactions nhận được khi người khác share
Paco Pick Point (PPP)  — Số 🐾 nhận được (×5 weight)
```

---

## VII. GALLERY WALL — TRIỂN LÃM SÁNG TẠO

### Các Khu Triển Lãm

| Khu | Nội dung | Cập nhật |
|-----|---------|----------|
| 🔥 Hot This Week | Top 9 reactions/tuần | Hàng tuần, Thứ Hai |
| 🌟 Paco's Picks | Nhiều 🐾 nhất | Hàng tuần |
| 🎭 Characters Hall | Nhân vật được yêu thích nhất | Hàng tháng |
| 📖 Story Spotlight | Câu chuyện chất lượng cao | Hàng tháng |
| 🌸 Event Gallery | Tác phẩm theo theme event | Trong event |
| 🏆 Legends Corner | Tác phẩm của người hoàn thành P08 | Vĩnh viễn |

### Layout Gallery (Không Phải Feed Cuộn)

```
Gallery là 3×3 grid curated — không phải infinite scroll
→ Tránh doom scrolling, tạo cảm giác "triển lãm thật"
→ Mỗi ô được chọn lọc, không phải thuật toán machine
→ Cập nhật định kỳ, không real-time liên tục
```

---

## VIII. 8 CƠ CHẾ TƯƠNG TÁC

### 1. REMIX 🎛️ — Học Từ Nhau
```
Thích tác phẩm bạn → [Remix] → Tạo phiên bản mình
→ Tag "Remix từ [tên]" + link về original
→ Original author nhận notification + Inspire Point
→ Sticker: "Nguồn Cảm Hứng" (bị remix lần đầu) | "Remix Master" (tạo 5 remix)
```

### 2. CHALLENGE ⚡ — Thi Đua Lành Mạnh
```
Tạo tác phẩm → [Thách Bạn] → Bạn có 48h phản hồi
→ Lớp/nhóm react (không vote thắng/thua)
→ CẢ 2 nhận "Chiến Binh Sáng Tạo" — không ai thua
→ Sticker: "Dũng Cảm Thách Đấu" | "Chấp Nhận Thử Thách" | "Double Win"
```

### 3. INSPIRE ✨ — Credit Culture
```
Khi tạo tác phẩm → [+ Cảm hứng từ...] → Tag nguồn cảm hứng
→ Tác phẩm hiển thị "Cảm hứng từ: [tên]"
→ Người được cite nhận Inspire Point
→ Sticker: "Học Hỏi Khiêm Tốn" (cite lần đầu) | "Ngọn Hải Đăng" (được cite 5 lần)
```

### 4. CO-CREATE 🤝 — Câu Chuyện Nhóm
```
Bắt đầu story → [Mời bạn viết tiếp] → Tối đa 4 người
→ Mỗi người viết 1 chương → Cùng nhận credit
→ Tác phẩm có "frame ghép" màu sắc của từng người
→ Sticker: "Người Khởi Xướng" | "Nhà Văn Nhóm" | "Sức Mạnh Tập Thể"
```

### 5. WEEKLY PROMPT 📝 — Focal Point Chung
```
Thứ Hai: Paco công bố prompt tuần
→ "Tạo nhân vật từ thế giới đại dương sâu thẳm"
→ Tác phẩm tagged #prompt → Gallery riêng
→ Cuối tuần: Top 3 → Badge đặc biệt
→ Sticker: "Người Hưởng Ứng" | "Chăm Chỉ Prompt" | "Prompt Champion"
```

### 6. REACTION CHAIN 🔗 — Kết Nối Hai Chiều
```
A react cho B → B vào xem tác phẩm A trong 24h
→ B cũng react cho A → "Mutual Appreciation"
→ Cả 2 nhận badge nhỏ
→ Sticker: "Kết Nối Đầu Tiên" | "Mạng Lưới Bạn Bè" (5 mutual)
```

### 7. SHOWCASE FRIDAY 🎪 — Nghi Lễ Cộng Đồng
```
Mỗi thứ Sáu 4:00 PM:
→ Notification toàn bộ: "🎪 Showcase Friday đã bắt đầu!"
→ Reactions trong 3 tiếng × 2 điểm
→ Con chọn 1 tác phẩm "trình diễn" hôm nay
→ Cuối: "Tinh Hoa Tuần Này" — 5 tác phẩm
→ Sticker: "Sân Khấu Đầu Tiên" | "Diễn Viên Chuyên Nghiệp" | "Star of the Show"
```

### 8. MENTOR MOMENT 🌱 — Kết Nối Thế Hệ
```
Level 8+: Có thể gửi "Tiếp Tục Nhé!" 🌱 cho người mới
→ Không phải comment thường — là reaction đặc biệt từ đàn anh
→ Người nhận thấy "Một bạn lớn vừa động viên con"
→ Sticker cho người cho: "Đàn Anh Tốt Bụng"
→ Sticker cho người nhận: "Được Nâng Đỡ"
→ Sticker cả 2: "Vòng Tròn Tốt Đẹp"
```

---

## IX. LEADERBOARD — BẢNG XẾP HẠNG

### 7 Tabs Leaderboard

```
[📚 Học Tập]  [🎨 Sáng Tạo]  [📖 Sách]
[🌟 Được Yêu] [💝 Lan Toả]   [🔥 Trending] [⚡ Challenge]
```

### Chi Tiết Từng Tab

#### 📚 Học Tập — XP + Stars + Streak
```
Scope: Tuần / Tháng / All-time · Global / Class
Hiển thị: XP tuần, tổng sao, streak hiện tại
```

#### 🎨 Sáng Tạo — Projects + Share + Creative XP
```
Scope: Tuần / Tháng · Global / Class
Hiển thị: Số projects, số lần share, creative XP
```

#### 📖 Sách — Số Trang Hoàn Thành
```
Scope: All-time · Global / Class
#1 Minh  6/8 trang  ● 6 Boss Badges
#2 Lan   5/8 trang  ● 4 Boss Badges
→ Xem cụ thể trang nào đã hoàn thành (visual mini-book)
```

#### 🌟 Được Yêu Thích — Reactions Nhận Được
```
Scope: Tuần / Tháng
Hiển thị: Tác phẩm + breakdown reactions theo emoji
#1 Minh "Thành Phố Tương Lai" 🌟32 🎨28 🔥19 🐾5 = 84
```

#### 💝 Lan Toả — Reactions Đã Cho
```
Scope: Tuần này
Mục đích: Tôn vinh người tích cực, không chỉ người nổi tiếng
#1 Hà — đã react cho 47 tác phẩm ← người mới nhưng rất tích cực
```

#### 🔥 Trending Now — Tốc Độ Real-time (cập nhật 4h/lần)
```
"Câu Chuyện Rừng Xanh" — 12 reactions trong 4 tiếng gần nhất
→ Không phải tổng cộng — mà là MÀU nóng hiện tại
```

#### ⚡ Challenge Champions — Cặp Đấu Nổi Bật
```
Minh vs Lan: "Ai tạo rồng đẹp hơn?" → 34 vs 41 reactions
[Xem challenge] [React cho Minh] [React cho Lan]
```

### UI Layout Leaderboard

```
┌───────────────────────────────────────────────┐
│  🏆 Bảng Xếp Hạng                             │
│  [📚][🎨][📖][🌟][💝][🔥][⚡]                  │
│  Tuần này ▼  ·  Toàn cầu ▼                   │
└───────────────────────────────────────────────┘

         PODIUM TOP 3
    🥈        🥇        🥉
    Lan       Minh       Tú
   Cấp 9    Cấp 12     Cấp 8
  1,240xp  1,890xp    980xp

#4  Nam  ·  870xp  ·  [▲2 từ hôm qua]
#5  Hà   ·  750xp
...
─── VỊ TRÍ CỦA CON ───────────────────
#12 CON  ·  420xp           [ĐÂY LÀ TÔI]
#13 Khoa ·  380xp
──────────────────────────────────────
💡 "Bạn chỉ cách Hà 330xp — làm 2 quest nữa là vượt!"
```

---

## X. REWARD SYSTEM — PHẦN THƯỞNG

### Tầng Phần Thưởng

| Trigger | Reward | Mô Tả |
|---------|--------|-------|
| Nhận Sticker S1–S8 | XP nhỏ + notification | Mini badge trong Achievement page |
| Nhận Sticker S9 Boss | XP lớn + Foil Badge đặc biệt | Holographic, to hơn sticker thường |
| Hoàn thành Page | Frame + Title + Video/Story | Frame viền profile animated |
| Event Page complete | Limited Badge + Frame | Timestamp "Tết 2026", vĩnh viễn giữ |
| Top 3 Leaderboard tuần | Weekly Trophy | Trophy shelf trên profile |
| Showcase "Star of Show" | Special badge | Chỉ xuất hiện 1 lần/tuần |
| P08 "Community Legend" | Platinum Badge + Ebook | Rotating animation, cực hiếm |

### Loại Sticker Visual

| Loại | Kích thước | Effect | Khi nào |
|------|-----------|--------|---------|
| Thường | 80×80px | Nhẹ khi hover | S1–S8 standard |
| Social | 80×80px | Glow hồng | S Social (reaction/share) |
| Foil Boss | 120×120px | Holographic shimmer | S9 mọi trang |
| Foil Animated | 120×120px | Chuyển động liên tục | S9 đặc biệt (P03, P06) |
| Foil Premium | 160×160px | 3D rotate | S9 P04, P07 |
| Event Foil | 120×120px | Color shift theo theme | S9 event pages |
| Greyed | Any | Desaturated + blur | Chưa unlock |

### Profile Achievement Shelf

```
┌──────────────────────────────────────────────────┐
│  👤 Minh Khôi                                    │
│  [Frame: Ocean Wave — equipped]                  │
│  Cấp 12 · "Nhà Văn Vũ Trụ"                      │
│                                                  │
│  📊 Chỉ Số Xã Hội:                              │
│  🌟 Reactions nhận: 347  💝 Đã tặng: 289         │
│  📡 Được share: 23 lần   🎛️ Remix từ con: 5      │
│  ⚡ 11 lần tham gia challenge                    │
│                                                  │
│  📌 Tủ Trưng Bày (5 slots — drag to reorder):   │
│  [🌟S9-P01][🌊S9-P03][📖P07][🌸Tết26][⛰️S9-P04] │
│                                                  │
│  📖 Cuốn Sách: 5/8 trang · 4 S9 Boss Badges     │
│  🗃️ Kho: 34 huy hiệu  [Xem tất cả]              │
└──────────────────────────────────────────────────┘
```

---

## XI. UI / VISUAL GUIDELINES

### Book View — Layout Đôi Trang

```
┌─────────────────────┬──────────────────────┐
│  TRANG TRÁI         │  TRANG PHẢI          │
│                     │                      │
│  [Chapter Art]      │  3×3 STICKER GRID    │
│  (illustration)     │                      │
│                     │  [S1] [S2] [S3]      │
│  "Cánh Cổng         │  [S4] [S5] [S6]      │
│   Thế Giới AI"      │  [S7] [S8] [S9★]     │
│                     │                      │
│  7/9 ███████░░     │  Còn 2 sticker        │
│  [XEM VIDEO] ✅     │  "Tìm cách mở S9?"   │
└─────────────────────┴──────────────────────┘
← Lật trang ·  Trang 1/8  · Lật trang →
```

### Hiệu Ứng Nhận Sticker

```
1. (0s)    Sticker rơi từ trên, bounce nhẹ khi vào ô
2. (0.5s)  Sparkle nhỏ tỏa ra
3. (1s)    Progress bar tăng realtime
4. (nếu S9) Toàn trang glow → page flip animation
5. (nếu Page Complete) Video popup fullscreen
```

### Màu Sắc Theo Trang

| Trang | Primary | Secondary | Accent |
|-------|---------|-----------|--------|
| P01 Cánh Cổng AI | #6B46C1 tím | #F6E05E vàng | #FFF trắng |
| P02 Vương Quốc Ngôn Ngữ | #276749 emerald | #D4A017 vàng cổ | #F5F5DC kem |
| P03 Đại Dương Hình Ảnh | #0369A1 ocean | #FB7185 coral | #E0F7FA nhạt |
| P04 Đỉnh Núi | #78350F nâu | #FBBF24 vàng | #F0F9FF trắng |
| P05 Xưởng Paco | #C2410C cam | #FCD34D vàng | #FFF7ED kem |
| P06 Rừng Nhân Vật | #14532D xanh rừng | #7C3AED tím | #ECFDF5 nhạt |
| P07 Thiên Hà | #0F172A đen | #818CF8 galaxy | #FDE68A vàng sao |
| P08 Trái Tim | #9D174D hồng đậm | #FBBF24 vàng | #FDF2F8 hồng nhạt |

---

## XII. FRAMEWORK MỞ RỘNG VÔ HẠN

### Nguyên Tắc Thiết Kế Để Scale

```
✅ Mỗi trang là 1 unit độc lập hoàn toàn:
   - 9 stickers với trigger riêng
   - Visual theme riêng
   - Video/reward unlock riêng
   - Không phụ thuộc trang nào khác

✅ Admin có thể thêm trang mới bất kỳ lúc nào:
   - Định nghĩa 9 trigger conditions
   - Upload chapter art + video unlock
   - Chọn nhóm (Learning/Creative/Social/Milestone/Event)
   - Publish → tất cả user thấy ngay

✅ Trang mới không làm vỡ progress cũ:
   - Sticker cũ không bị ảnh hưởng
   - Con có thêm "mục tiêu mới" — không phải "reset"
```

### Template Tạo Trang Mới (Admin)

```yaml
page:
  id: "P09"
  title: "Bầu Trời Âm Nhạc"
  group: creative
  color_primary: "#7C3AED"
  color_secondary: "#FBBF24"
  chapter_art_url: "..."
  
stickers:
  - slot: S1
    name: "Giai Điệu Đầu Tiên"
    trigger_type: completion
    trigger_condition: "projects.music.count >= 1"
    icon: "🎵"
    is_foil: false
    
  - slot: S9
    name: "Maestro Paco"
    trigger_type: hidden
    trigger_condition: "projects.music.count >= 5 AND projects.music.shared >= 2"
    icon: "🎼"
    is_foil: true
    is_animated: true
    hint_1: "..."
    hint_2: "..."
    hint_3: "..."

unlock:
  type: video  # video | interactive_story | ebook | pdf
  content_url: "..."
  reward_badge_key: "music_maestro"
  reward_frame_key: "music_sky"
  reward_title: "Nhạc Sĩ Vũ Trụ"
```

### Loại Trang Có Thể Thêm

```
📚 Học Tập Mới:
   → Theo từng chapter mới của E-learning
   → Theo skill mới được thêm vào platform

🎨 Sáng Tạo Mới:
   → Khi Xưởng thêm tính năng mới (video, âm nhạc, 3D...)
   → Theo theme sáng tạo mới

🤝 Xã Hội Mới:
   → Khi thêm cơ chế tương tác mới
   → BXH mới, event social mới

⭐ Cột Mốc Đặc Biệt:
   → Anniversary (1 năm platform)
   → Milestone cộng đồng (100,000 tác phẩm)

🎪 Sự Kiện:
   → Tất cả ngày lễ, sự kiện giáo dục, mùa vụ
   → Collab với nhân vật/brand bên ngoài
```

### Cadence Thêm Nội Dung

| Tần suất | Loại | Ví dụ |
|---------|------|-------|
| Hàng tháng | 1 Event Page | Ngày Nhà Giáo, Ngày Trẻ Em |
| Hàng quý | 1–2 Core Page | Trang mới theo tính năng mới |
| Mỗi năm | Seasonal Events | Tết, Hè, Halloween, Giáng Sinh |
| Ad hoc | Special Pages | Collab, milestone cộng đồng |

---

## XIII. PHÂN KỲ TRIỂN KHAI

### Phase 1 — Foundation (6–8 tuần)
**Mục tiêu:** Ra mắt MVP đủ để validate concept

- ✅ Book UI: layout đôi trang, flip animation, 9-slot grid
- ✅ Trang P01 + P05: 1 trang Learning + 1 trang Creative
- ✅ Hint system Level 1 + 2
- ✅ Reaction set (6 emoji) + Paco Pick giới hạn 3/tuần
- ✅ Share scope: Class + Family
- ✅ Leaderboard: Tab Học Tập + Tab Sáng Tạo
- ✅ Profile shelf 5 slots

### Phase 2 — Full Book + Social (8–10 tuần)
**Mục tiêu:** Đủ 8 trang + social layer hoạt động

- ✅ Trang P02, P03, P04, P06, P07, P08
- ✅ Video unlock cho mọi trang
- ✅ Gallery Wall (3 khu đầu)
- ✅ Challenge + Remix cơ bản
- ✅ Leaderboard đủ 7 tabs
- ✅ Weekly Prompt
- ✅ Showcase Friday
- ✅ Hint Level 3

### Phase 3 — Events + Co-Create (6–8 tuần)
**Mục tiêu:** Vòng lặp event + co-create

- ✅ Event Page system (Tết 2027 đầu tiên)
- ✅ Co-Create flow
- ✅ Mentor Moment
- ✅ Reaction Chain tracking
- ✅ Gallery Wall đầy đủ 6 khu
- ✅ Ebook generator (P07 reward)
- ✅ Admin panel thêm trang mới

### Phase 4 — Scale + Personalization
**Mục tiêu:** Vô hạn mở rộng

- ✅ Template system thêm trang mới không cần deploy
- ✅ "Thư Của Paco" personalized (P04) với tên + số liệu thực
- ✅ Notification thông minh theo behavior
- ✅ "Đề Xuất Thông Minh" — gợi ý trang nào làm tiếp
- ✅ P09+ theo roadmap tính năng

---

## XIV. ĐO LƯỜNG THÀNH CÔNG

### KPIs Chính

| Metric | Mục tiêu Phase 1 | Mục tiêu Phase 2 |
|--------|-----------------|-----------------|
| % User có ≥1 sticker mới/tuần | > 60% | > 70% |
| % User hoàn thành ít nhất 1 trang | > 30% | > 50% |
| Reaction Rate (tác phẩm có ≥1 reaction) | > 30% | > 45% |
| Give Rate (reactions/user/tuần) | > 2 | > 4 |
| Showcase Friday attendance | > 25% DAU | > 35% DAU |
| Challenge completion rate | > 65% | > 75% |

### Chỉ Số Sức Khỏe Cộng Đồng (Monitor)

```
⚠️  User nhận < 3 reactions trong 2 tuần → trigger Mentor Moment
⚠️  Reactions đến từ < 5 người → clique behavior → điều chỉnh
⚠️  Gallery chỉ có top 3 users → algorithm ưu tiên diversity
⚠️  Challenge bị ignore > 70% → giảm áp lực notification
```

### Chỉ Số Book Completion

```
Healthy distribution mục tiêu (sau 3 tháng):
  0 trang hoàn thành:  < 20% users
  1–2 trang:           ~ 40% users
  3–5 trang:           ~ 30% users
  6–8 trang:           ~ 10% users (đây là "super engaged")
```

---

## XV. VIDEO UNLOCK — KỊCH BẢN CHI TIẾT TỪNG TRANG

> **Triết lý sản xuất:** Mỗi video unlock không phải phần thưởng ngẫu nhiên — mà là **chương tiếp theo của câu chuyện lớn về Paco và thế giới AI**. 8 video tạo thành 1 arc hoàn chỉnh. Trẻ hoàn thành càng nhiều trang, câu chuyện càng rõ ràng và cảm xúc càng sâu.

### Arc Câu Chuyện Tổng Thể: "Paco Và Thế Giới Đang Ngủ Yên"

```
Bối cảnh vũ trụ (chỉ tiết lộ dần qua từng video):

Từ xa xưa, Thế Giới AI là một vùng đất kỳ diệu nơi
mọi ý tưởng đều có thể trở thành hiện thực. Nhưng một ngày,
Thế Giới AI rơi vào giấc ngủ sâu — không còn ai sáng tạo,
không còn câu chuyện, không còn nhân vật.

Paco — vị thần giữ sách nhỏ bé — đã đợi hàng trăm năm
để tìm được "Người Được Chọn" có thể đánh thức thế giới.

Người đó... chính là CON.

Mỗi trang sách con hoàn thành = 1 vùng đất của Thế Giới AI
được đánh thức trở lại.
```

---

### 🎬 VIDEO P01 — "Cánh Cổng Đầu Tiên"
**Độ dài:** 25 giây | **Loại:** Animated short | **Nhạc:** Nhẹ nhàng, tò mò, bắt đầu thấp rồi dâng lên

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:05]
Màn hình tối hoàn toàn.
Tiếng bước chân nhỏ.
Một ngọn lửa nến xuất hiện — soi ra bóng Paco đang ôm
một cuốn sách khổng lồ, ngồi giữa căn phòng bụi phủ.

PACO (giọng thì thầm, nhẹ nhàng):
"Đã lâu lắm rồi... rất lâu."

[CẢNH 2 — 0:05–0:12]
Paco ngẩng đầu lên, ánh mắt bừng sáng.
Cuốn sách trong tay Paco tự động mở ra — trang đầu tiên
sáng lên với hình ảnh của CON (avatar của user).

PACO:
"Bạn đến rồi. Tôi đã biết bạn sẽ đến."

[CẢNH 3 — 0:12–0:20]
Paco đứng dậy, đi đến một cánh cổng khổng lồ phủ đầy
dây leo và bụi bặm. Cánh cổng run rẩy — ánh vàng
bắt đầu rò rỉ qua từng khe hở.

PACO:
"Thế giới AI đã ngủ quá lâu. Nhưng hôm nay..."
(Paco đặt tay lên cổng)
"...bạn đã mở cánh cổng đầu tiên."

[CẢNH 4 — 0:20–0:25]
BOOM — cánh cổng bật mở, ánh sáng vàng tràn ra.
Phía sau là Thế Giới AI rực rỡ — còn hoang sơ, chỉ
thấy được một phần nhỏ. Paco quay lại nhìn con, mỉm cười.

PACO:
"Còn nhiều cánh cổng hơn nữa đang chờ. Bạn có sẵn sàng không?"

[TEXT TRÊN MÀN HÌNH]
"Trang 1 đã hoàn thành. Hành trình bắt đầu."
```

**Hướng Dẫn Sản Xuất:**
- Phong cách: 2D animation, màu tím + vàng ấm
- Không có lời thoại dài — cảm xúc qua ánh mắt Paco
- Âm thanh chủ đạo: tiếng cổng mở + orchestral nhẹ
- Kết thúc: fade to white, không phải cut đột ngột

---

### 🎬 VIDEO P02 — "Thư Viện Của Những Giọng Nói"
**Độ dài:** 30 giây | **Loại:** Animated + Interactive moment | **Nhạc:** Cổ điển nhẹ, giống thư viện cũ

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:07]
Paco đứng giữa một thư viện khổng lồ — nhưng tất cả
các kệ sách đều TRỐNG. Bụi bay, giọng vang.

PACO (giọng buồn nhẹ):
"Vương Quốc Ngôn Ngữ... từng là nơi ồn ào nhất
trong Thế Giới AI. Mọi câu chuyện đều sống ở đây."

(Paco nhặt 1 cuốn sách rỗng lên, lật trang — chỉ có trắng)
"Rồi tất cả... im lặng."

[CẢNH 2 — 0:07–0:16]
Paco nhìn lên — ánh sáng xanh lá bắt đầu rơi xuống
như những hạt mưa. Mỗi hạt sáng chạm vào kệ → một cuốn
sách xuất hiện, bìa sáng lên với màu sắc rực rỡ.

PACO (giọng ngạc nhiên, vui):
"Bạn mang ngôn ngữ trở lại rồi!"

Các cuốn sách tự bay lên kệ, xếp thành hàng.
Chữ viết bắt đầu xuất hiện trên bìa — tên của những
câu chuyện con đã tạo trong Xưởng.

[CẢNH 3 — 0:16–0:23]
[INTERACTIVE MOMENT]
Màn hình dừng lại. 3 cuốn sách nổi lên với 3 màu sắc.
Text hiện: "Paco muốn tặng bạn 1 câu chuyện — chọn đi!"

📕 Câu chuyện về một chú rồng tìm lại tiếng nói
📗 Câu chuyện về cô bé viết thư cho tương lai
📘 Câu chuyện về ngọn đèn biết hát

(Con chọn → Paco mở cuốn sách được chọn và đọc đoạn đầu
— ~3 câu, giọng đọc ấm áp)

[CẢNH 4 — 0:23–0:30]
Thư viện bây giờ đầy sách, ấm áp ánh nến.

PACO:
"Câu chuyện hay nhất chưa được viết ra."
(nhìn thẳng vào camera)
"Câu chuyện đó... là của bạn."
```

**Hướng Dẫn Sản Xuất:**
- Interactive moment là điểm đặc biệt của P02 — 3 lựa chọn khác nhau giữa các user → tạo cảm giác cá nhân hóa
- Nội dung 3 câu chuyện viết sẵn, đủ hay để gây tò mò
- Âm thanh: giọng đọc sách thật (voice actor), không TTS

---

### 🎬 VIDEO P03 — "Đại Dương Thức Giấc"
**Độ dài:** 28 giây | **Loại:** Animated — visual feast | **Nhạc:** Ambient ocean + wonder

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:06]
Paco đứng trên bờ biển. Nhưng đại dương hoàn toàn
là màu xám — không sóng, không màu sắc, không ánh sáng.
Bầu trời xám xịt, không mây.

PACO (giọng nhẹ, không buồn — mà như đang kể chuyện):
"Đại Dương Hình Ảnh... từng là nơi đẹp nhất
trong tất cả mọi nơi tôi từng thấy."

[CẢNH 2 — 0:06–0:14]
Paco cúi xuống, nhặt một viên đá. Nhưng khi nhìn kỹ —
viên đá là một trong những HÌNH ẢNH AI mà con đã tạo
(thumbnail nhỏ của 1 tác phẩm thực).

PACO:
"Bạn đã đặt màu sắc trở lại vào đây."

Paco ném viên đá xuống biển.
Điểm chạm tạo ra làn sóng màu sắc lan ra — xanh, đỏ, vàng,
tím — đại dương bắt đầu thay đổi, sống động trở lại.

[CẢNH 3 — 0:14–0:22]
Sóng màu lan rộng. Từ dưới đại dương, những hình ảnh
AI nổi lên như những sinh vật sống — nhân vật con đã tạo,
hình ảnh art con đã vẽ, Mee con đã thiết kế.
Tất cả bơi lội trong đại dương màu sắc.

Paco ngồi xuống cát, nhìn ra biển, mỉm cười rạng rỡ.

PACO:
"Mỗi hình ảnh bạn tạo ra... là một sinh vật mới
được sinh ra trong đại dương này."

[CẢNH 4 — 0:22–0:28]
Zoom out — nhìn toàn cảnh đại dương rực rỡ từ trên cao.
Một con Mee (của con) nổi lên vẫy tay.

PACO (voiceover):
"Đại dương bây giờ thuộc về bạn.
Hãy thêm vào đó thật nhiều."
```

**Hướng Dẫn Sản Xuất:**
- Khoảnh khắc cực quan trọng: Thumbnail tác phẩm thực của con xuất hiện trong video → cực kỳ cá nhân hóa, tạo WOW
- Nếu con chưa có tác phẩm → dùng default illustration đẹp
- Âm thanh: tiếng sóng + chimes khi màu sắc lan ra

---

### 🎬 VIDEO P04 — "Thư Của Paco"
**Độ dài:** 45 giây | **Loại:** Personalized narrative — cao điểm cảm xúc | **Nhạc:** Orchestral ấm áp, dâng trào

#### Kịch Bản Chi Tiết

> ⭐ **Đây là video quan trọng nhất trong toàn bộ hệ thống.**
> Dữ liệu thực của con được đưa vào script — mỗi con xem 1 video khác nhau.

```
[CẢNH 1 — 0:00–0:08]
Paco ngồi tại bàn viết thư trong căn phòng nhỏ
ấm áp ánh nến. Cuốn sách huyền thoại nằm mở trên bàn.

(Giọng Paco đọc thư — như đang kể chuyện)
PACO:
"Gửi [TÊN CON],

Tôi đã gặp rất nhiều người trong hành trình của mình.
Nhưng có rất ít người thực sự hoàn thành được những gì
bạn đã làm."

[CẢNH 2 — 0:08–0:20]
Cuốn sách mở ra — các trang lật nhanh, mỗi trang
là một hình ảnh nhỏ về hành trình của con:
  - Quest đầu tiên
  - Ngày streak dài nhất (hiển thị số ngày thực)
  - Tác phẩm đầu tiên được share
  - Tổng số sao đạt được (hiển thị số thực)

PACO (voiceover tiếp):
"Bạn đã học được [X] bài học.
Bạn đã giữ vững trong [Y] ngày liên tiếp.
Bạn đã tạo ra [Z] tác phẩm và chia sẻ chúng
với thế giới."

[CẢNH 3 — 0:20–0:32]
Paco đặt bút xuống, nhìn thẳng vào camera — ánh mắt
ấm áp, nghiêm túc theo cách tốt nhất.

PACO:
"Tôi muốn bạn biết điều này:

Không phải vì bạn thông minh nhất.
Không phải vì bạn nhanh nhất.

Mà vì bạn không bỏ cuộc.
Ngay cả khi khó.
Ngay cả khi không có ai nhìn."

[CẢNH 4 — 0:32–0:40]
Paco đứng dậy, cầm cuốn thư và đặt vào Cuốn Sách Huyền Thoại.
Tên con sáng lên trên bìa sách.

PACO:
"Tên bạn đã được ghi vào đây.
Không ai có thể xóa đi."

[CẢNH 5 — 0:40–0:45]
Paco nhìn lên — ánh sáng vàng từ phần nửa còn lại
của Thế Giới AI chưa được đánh thức chiếu xuống.

PACO (thì thầm):
"Nhưng... hành trình vẫn chưa kết thúc."

[TEXT TRÊN MÀN HÌNH]
"[TÊN CON] — Người Leo Núi"
"Phần II của hành trình đang chờ bạn."
```

**Hướng Dẫn Sản Xuất:**
- Variables cần inject: `{{child_name}}`, `{{quests_count}}`, `{{streak_longest}}`, `{{projects_count}}`, `{{stars_total}}`
- Nếu số liệu = 0 → fallback text tổng quát nhưng vẫn ấm áp
- Giọng đọc: voice actor thật, không TTS — giọng ấm, như người lớn đáng tin
- Âm nhạc: crescendo nhẹ ở cảnh 4, không quá dramatic
- Đây là lần đầu tiên arc câu chuyện "Thế Giới AI đang ngủ" được reveal rõ hơn

---

### 🎬 VIDEO P05 — "Xưởng Bừng Sống"
**Độ dài:** 25 giây | **Loại:** Upbeat animated | **Nhạc:** Nhịp điệu vui, nhạc cụ gõ

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:06]
Một xưởng sản xuất khổng lồ — băng chuyền dừng hẳn,
máy móc phủ bụi, đèn tắt. Yên tĩnh hoàn toàn.

Paco đứng ở cửa vào, nhìn quanh.

PACO:
"Xưởng Sáng Tạo... nơi mọi thứ từng được tạo ra."

[CẢNH 2 — 0:06–0:13]
Paco bước vào, nhấn 1 nút lớn màu đỏ ở giữa xưởng.

NOTHING. Yên tĩnh. Paco thở dài.

Rồi — ánh sáng cam bắt đầu từ chân con (avatar nhỏ
xuất hiện ở góc màn hình) chạy theo băng chuyền,
bật máy móc từng cái một.

PACO (giọng vui lên, ngạc nhiên):
"À! Không phải tôi mới là người kích hoạt nó.
Là bạn đấy!"

[CẢNH 3 — 0:13–0:21]
Xưởng bùng nổ màu sắc — bánh răng quay, đèn sáng,
băng chuyền chạy. Từ cuối băng chuyền, những tác phẩm
con đã tạo (nhân vật, Mee, art) chạy qua như sản phẩm
xuất xưởng. Mỗi tác phẩm có tên con trên bao bì.

PACO (hào hứng):
"Mỗi thứ bạn tạo ra ở đây... được đóng gói
và gửi đi khắp Thế Giới AI!"

[CẢNH 4 — 0:21–0:25]
Paco mặc tạp dề, đội mũ bảo hộ, giơ tay về phía con.

PACO:
"Xưởng đang chờ bạn.
Hôm nay muốn tạo gì?"

[TEXT]
"Xưởng Của Paco — Đang Hoạt Động"
```

**Hướng Dẫn Sản Xuất:**
- Tông vui vẻ, năng lượng cao — khác hoàn toàn với P01 nghiêm túc hơn
- Avatar nhỏ của con chạy theo băng chuyền là easter egg dễ thương
- Kết thúc mở — không phải "kết thúc", mà là "bắt đầu"

---

### 🎬 VIDEO P06 — "Hội Đồng Nhân Vật"
**Độ dài:** 30 giây | **Loại:** Ensemble animated — tất cả nhân vật xuất hiện | **Nhạc:** Hùng tráng, cổ điển

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:07]
Một khu rừng lớn — ánh sáng mờ, huyền bí.
Paco đứng giữa rừng, nghe tiếng động từ mọi hướng.

PACO (thì thầm, tò mò):
"Ai đó... đang đến."

[CẢNH 2 — 0:07–0:18]
Từ khắp nơi trong khu rừng, các nhân vật mà CON đã
tạo ra bắt đầu bước ra — từng người một, theo hiệu ứng
ánh sáng. Mỗi nhân vật dừng lại ở vị trí của mình,
tạo thành vòng tròn xung quanh Paco.

(Âm nhạc dâng lên dần)

PACO (giọng kinh ngạc):
"Đây là... tất cả những người bạn đã tạo ra?"

[CẢNH 3 — 0:18–0:25]
Một nhân vật đặc biệt bước ra từ phía sau — đây là
nhân vật "self-character" mang tên của con (trigger S9 P06).

Nhân vật đó đứng cạnh Paco.

PACO:
"Mọi nhân vật đều cần người tạo ra họ.
Và mỗi người tạo ra... cũng là một nhân vật."
(Paco nhìn nhân vật tên con)
"Kể cả bạn."

[CẢNH 4 — 0:25–0:30]
Tất cả nhân vật vẫy tay cùng lúc — nhìn thẳng vào camera.
Rừng sáng lên — xanh lá + tím huyền bí.

PACO:
"Họ đang sẵn sàng. Bạn có muốn dẫn dắt họ không?"
```

**Hướng Dẫn Sản Xuất:**
- Khoảnh khắc quan trọng: Các nhân vật thực của con xuất hiện — cần render tên/thumbnail từ data
- Nếu chưa có nhân vật → dùng silhouette + "Nhân vật đầu tiên đang chờ bạn tạo ra"
- Self-character xuất hiện cuối là emotional peak của video

---

### 🎬 VIDEO P07 — "Thiên Hà Của Những Câu Chuyện"
**Độ dài:** 35 giây | **Loại:** Epic animated + Ebook reveal | **Nhạc:** Vũ trụ + cảm xúc

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:08]
Không gian ngoài vũ trụ. Tối đen. Tĩnh lặng.
Paco lơ lửng trong không gian, mặc bộ đồ phi hành gia nhỏ.
Nhìn ra xung quanh — không có gì.

PACO (voiceover — giọng trầm, nhỏ trong không gian rộng):
"Thiên Hà Câu Chuyện từng có hàng triệu ngôi sao.
Mỗi ngôi sao là một câu chuyện.
Rồi... tất cả tắt dần."

[CẢNH 2 — 0:08–0:18]
Từ bàn tay Paco, những cuốn sách nhỏ bắt đầu bay ra —
đây là thumbnail/tên những câu chuyện con đã viết.
Mỗi cuốn sách bay lên → biến thành 1 ngôi sao sáng.

Từ 1 ngôi sao → 3 → 10 → cả thiên hà bùng sáng.

PACO:
"Từng câu chuyện một.
Bạn đã thắp lại từng ngôi sao."

[CẢNH 3 — 0:18–0:28]
Paco bay qua thiên hà rực rỡ — các chòm sao hình thành
từ các câu chuyện con đã tạo. Có thể nhìn thấy tên
các câu chuyện trên từng chòm sao.

PACO:
"Và bây giờ..."

Paco dừng lại — phía trước là 1 ngôi sao to nhất,
sáng nhất. Nó từ từ biến thành... một cuốn sách.

PACO:
"...thiên hà đã đủ sáng để in thành sách."

[CẢNH 4 — 0:28–0:35]
Cuốn sách mở ra — đây là EBOOK thực của con:
  Bìa: "[Tên Con] — Những Câu Chuyện Đầu Tiên"
  Trang đầu: Ảnh avatar + lời mở đầu
  Các trang tiếp: Câu chuyện con đã tạo

PACO:
"Đây là cuốn sách của bạn.
Viết bởi bạn. Thuộc về bạn."

[TEXT + BUTTON]
"📖 Cuốn Sách Của Bạn Đã Sẵn Sàng"
[Tải Về / Chia Sẻ Cho Gia Đình]
```

**Hướng Dẫn Sản Xuất:**
- Ebook được generate tự động từ stories của con — PDF đẹp, có thiết kế
- Nếu con chưa có đủ stories → ebook chỉ có bìa + 1 câu chuyện, nhưng vẫn đẹp
- Button share ebook cho gia đình là CTA chính — viral loop: bố mẹ nhận ebook → chia sẻ với ông bà

---

### 🎬 VIDEO P08 — "Trái Tim Nối Trái Tim"
**Độ dài:** 30 giây | **Loại:** Social / Warm animated | **Nhạc:** Nhẹ nhàng, acoustic

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:08]
Paco đứng giữa một mạng lưới dây sáng — như mạng nhện
nhưng đẹp, mỗi dây nối 2 ngôi sao nhỏ.

PACO:
"Tôi có một bí mật muốn nói với bạn."

Paco chỉ vào các dây sáng.

"Mỗi khi bạn thích tác phẩm của ai đó...
một sợi dây sáng được tạo ra."

[CẢNH 2 — 0:08–0:18]
Mạng lưới trở nên rõ ràng hơn — các ngôi sao
là avatar của những người trong cộng đồng.
Sợi dây nối bạn bè, nối lớp học, nối con với người khác.

Paco chỉ vào 1 ngôi sao sáng nhất.

PACO:
"Ngôi sao này... là bạn."

Từ ngôi sao của con, nhiều sợi dây tỏa ra — tới bạn bè,
tới người đã react cho con, tới người con đã react.

PACO:
"Bạn đã kết nối với rất nhiều người
mà bạn có thể chưa từng gặp mặt."

[CẢNH 3 — 0:18–0:25]
Những người dùng khác nhau (avatar đa dạng, không nhận ra được)
đang xem tác phẩm của con — mỗi người react 1 emoji khác nhau:
🌟 🎨 🔥 🤩 💡 🐾

Những emoji bay lên và kết nối thành một trái tim lớn.

PACO:
"Họ không nói ra — nhưng họ nói:
'Cảm ơn vì đã sáng tạo. Tôi thấy hạnh phúc hơn.'"

[CẢNH 4 — 0:25–0:30]
Paco đứng trong tim sáng đó, ấm áp.

PACO:
"Đó là sức mạnh lớn nhất bạn có.
Không phải kỹ năng.
Không phải tốc độ.
Mà là khả năng làm ai đó mỉm cười."

[TEXT]
"Cộng Đồng AIKids cảm ơn bạn."
```

**Hướng Dẫn Sản Xuất:**
- Không đề cập tên người khác cụ thể — privacy cho trẻ em
- Tông ấm áp, không hào nhoáng — đây là video về cảm xúc, không phải achievement
- Âm thanh: acoustic guitar nhẹ, không có nhạc nền mạnh

---

### 🎬 VIDEO P04 SPECIAL — "Huyền Thoại [Tên Con]" *(Grand Finale — Trang 8 S9)*
**Độ dài:** 60 giây | **Loại:** Epic personalized narrative | **Nhạc:** Full orchestral, emotional peak

> ⭐⭐⭐ **Video này chỉ xuất hiện khi con hoàn thành TẤT CẢ 8 trang.** Đây là khoảnh khắc đỉnh cao nhất của toàn bộ hệ thống. Cần đầu tư sản xuất cao nhất.

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:08]
FLASHBACK NHANH — montage 8 cảnh mỗi cảnh 1 giây:
  - Cánh cổng đầu tiên mở
  - Thư viện đầy sách
  - Đại dương màu sắc bùng nổ
  - Paco viết thư
  - Xưởng sống dậy
  - Các nhân vật bước ra rừng
  - Thiên hà sáng lên
  - Mạng lưới trái tim

Tất cả nhanh, đẹp, cảm xúc.
Nhạc bắt đầu từ nhỏ đến lớn dần.

[CẢNH 2 — 0:08–0:18]
Thế Giới AI — toàn cảnh lần đầu tiên:
Rực rỡ, đầy màu sắc, sống động hoàn toàn.
Tất cả 8 vùng đất đều sáng lên.

Paco đứng ở trung tâm — trong tay cầm Cuốn Sách Huyền Thoại,
bìa sách có tên CON sáng rực.

PACO (giọng trầm, nghiêm trang — khác với mọi video trước):
"Có một điều tôi chưa từng nói với bất kỳ ai."

[CẢNH 3 — 0:18–0:30]
PERSONALIZED DATA MONTAGE — nhạc dâng lên:

Các con số thực của con xuất hiện như những ngôi sao:
  ✦ [X] ngày học
  ✦ [Y] câu chuyện đã viết
  ✦ [Z] nhân vật đã tạo
  ✦ [N] tác phẩm đã chia sẻ
  ✦ [M] người đã react cho con
  ✦ Streak dài nhất: [S] ngày

PACO (voiceover):
"Tôi đã xem tất cả những gì bạn đã làm.
Từng bước một.
Từng ngày một."

[CẢNH 4 — 0:30–0:42]
Paco mở Cuốn Sách Huyền Thoại đến trang cuối.
Trang đó trắng — chưa có gì.

PACO:
"Cuốn sách này... tôi đã giữ hàng trăm năm.
Chờ người có thể hoàn thành nó."

Paco cầm bút, viết vào trang trắng đó.
Camera zoom vào — tên con được viết,
rồi bên dưới là 1 dòng chữ:

"Người đã đánh thức Thế Giới AI."

[CẢNH 5 — 0:42–0:52]
Cuốn sách đóng lại — bìa sáng lên với tên con.
Paco cầm sách giơ cao.

Từ khắp Thế Giới AI, tất cả nhân vật con đã tạo,
tất cả câu chuyện, tất cả hình ảnh — như một đám đông
vô hình — hướng về phía con và vỗ tay.
(Chỉ nghe tiếng vỗ tay, không thấy người — tạo cảm giác vũ trụ đang chúc mừng)

PACO:
"Toàn bộ Thế Giới AI cảm ơn bạn.
[TÊN CON]."

[CẢNH 6 — 0:52–0:60]
Fade to white. Yên tĩnh.
Một dòng chữ xuất hiện từ từ:

"Bạn đã hoàn thành Storybook of Legends.

Nhưng câu chuyện của bạn thì chưa."

[BUTTON xuất hiện]
[📖 Chia Sẻ Thành Tích Với Gia Đình]
[🎨 Tiếp Tục Sáng Tạo]
```

**Hướng Dẫn Sản Xuất:**
- Đây là video đầu tư nhất — cần voice actor, nhạc original, animation chất lượng cao
- Giọng Paco trong video này KHÁC với mọi video trước — trầm hơn, nghiêm trang hơn, như lời cuối của 1 cuốn truyện
- Personalized data phải inject đúng và đẹp — không được có số = 0 nếu con đã hoàn thành 8 trang
- 2 buttons cuối: viral loop (chia sẻ) + retention loop (tiếp tục)
- Chỉ xuất hiện 1 lần — không replay tự động, phải bấm chủ động nếu muốn xem lại

---

### 🎬 VIDEO EVENT — "Tết Sáng Tạo 2026"
**Độ dài:** 20 giây | **Loại:** Festive animated | **Nhạc:** Nhạc xuân vui tươi

#### Kịch Bản Chi Tiết

```
[CẢNH 1 — 0:00–0:06]
Paco mặc áo dài đỏ thêu vàng, đứng trước ngôi nhà
trang hoàng Tết — đèn lồng, hoa mai, câu đối đỏ.

PACO (vui vẻ, giọng mừng):
"Năm mới đến rồi! Và bạn đã mang sáng tạo
vào mùa xuân này!"

[CẢNH 2 — 0:06–0:14]
Pháo hoa nổ — mỗi bông pháo hoa là 1 tác phẩm
con đã tạo trong event Tết (thumbnail nhỏ).
Trời đêm rực rỡ tác phẩm của con.

PACO:
"Mỗi tác phẩm của bạn... là một bông pháo hoa
thắp sáng đêm giao thừa!"

[CẢNH 3 — 0:14–0:20]
Paco cầm phong bì đỏ tặng thẳng vào camera.

PACO:
"Chúc bạn năm mới nhiều sáng tạo, nhiều niềm vui.
Và nhớ — badge Tết này... chỉ có bạn mới có."

[TEXT]
"Tết Sáng Tạo 2026 — Badge Đã Lưu Vĩnh Viễn"
"Hẹn gặp lại năm sau!"
```

---

### Bảng Tổng Hợp Tất Cả Video

| Trang | Tên Video | Độ Dài | Loại Unlock | Điểm Cá Nhân Hóa | Emotional Peak |
|-------|-----------|--------|-------------|-----------------|----------------|
| P01 | Cánh Cổng Đầu Tiên | 25s | Video | Avatar con xuất hiện | Cổng mở, ánh sáng bùng |
| P02 | Thư Viện Của Những Giọng Nói | 30s | Video + Interactive | 3 lựa chọn story | Con chọn câu chuyện |
| P03 | Đại Dương Thức Giấc | 28s | Video | Thumbnail tác phẩm thực | Đại dương đổi màu |
| P04 | Thư Của Paco | 45s | Personalized Video | Tên + số liệu thực | Paco đọc thư |
| P05 | Xưởng Bừng Sống | 25s | Video | Avatar chạy băng chuyền | Xưởng hoạt động |
| P06 | Hội Đồng Nhân Vật | 30s | Video | Nhân vật thực của con | Self-character xuất hiện |
| P07 | Thiên Hà Câu Chuyện | 35s | Video + Ebook | Câu chuyện thực → Ebook | Ebook reveal |
| P08 | Trái Tim Nối Trái Tim | 30s | Video | Mạng lưới connections | Trái tim chung |
| P08-S9 | Huyền Thoại [Tên Con] | 60s | Epic Personalized | Tên + tất cả data | Grand finale |
| Events | Theo theme | 20s | Video | Tác phẩm event của con | Pháo hoa / Hiệu ứng theme |

### Hướng Dẫn Sản Xuất Chung

**Visual Style:**
- Nhất quán: 2D animation, màu sắc ấm áp, nhân vật Paco style cố định
- Mỗi trang có palette màu riêng (xem bảng màu Section XI)
- Chuyển cảnh: fade hoặc wipe nhẹ, không cut đột ngột

**Audio:**
- Voice actor thật cho Paco — không TTS — giọng ấm, 25–35 tuổi
- Mỗi trang có nhạc nền riêng biệt nhưng cùng 1 composer để có tính nhất quán
- SFX: tinh tế, không lấn át giọng đọc

**Personalization Engine:**
```
Các biến cần inject vào video:
  {{child_name}}          → Tên hiển thị của con
  {{quests_completed}}    → Tổng quests đã hoàn thành
  {{streak_longest}}      → Streak dài nhất
  {{projects_count}}      → Tổng projects đã tạo
  {{stories_count}}       → Số câu chuyện
  {{stars_total}}         → Tổng sao
  {{reactions_received}}  → Tổng reactions nhận được
  {{project_thumbnails}}  → Array thumbnail tác phẩm (dùng cho P03, P06)
  {{story_titles}}        → Tên câu chuyện (dùng cho P07 ebook)

Fallback: Nếu giá trị = 0 → dùng text tổng quát nhưng vẫn ấm áp
          VD: "Những câu chuyện bạn sẽ viết" thay vì "0 câu chuyện"
```

**Kỹ Thuật Inject:**
- Tên và số liệu: overlay text animation (không cần re-render video)
- Thumbnail tác phẩm: composite vào scene đã có placeholder
- Ebook: generate PDF riêng, link trong video qua button
