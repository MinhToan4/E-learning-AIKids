---
name: hallmark-ui
description: >-
  Chuẩn mực thiết kế giao diện AI Kids (Soft Clay / Hallmark Craft SSOT):
  2D Flat Soft Clay, Bảng màu Pastel Warm Tone, Hệ thống Icon Vector Soft Clay thuần SVG,
  Quy chuẩn Button/Input/KaTeX/Bố cục dẹt (Flatten Layout) & Sư phạm trực quan Montessori.
---

# AI Kids Design System & Hallmark Craft (SSOT)

> **Tài Liệu Chuẩn Nguồn Sự Thật Duy Nhất (Single Source of Truth - SSOT)** cho toàn bộ giao diện học tập, đề thi Olympic, chuyên đề, chặng học và hệ thống quản trị của AI Kids Creator Academy.

---

## 1. Triết Lý Cốt Lõi: 2D Flat Soft Clay & Anti-Slop AI

Hệ thống AI Kids hướng tới trẻ em từ 6–12 tuổi và học sinh tiểu học luyện thi toán Olympic quốc tế (ASMO, SASMO, TIMO). Giao diện phải mang lại cảm giác **thân thiện, ấm áp, kích thích tư duy trực quan** và loại bỏ hoàn toàn các phong cách công nghiệp rập khuôn.

* **2D Flat Soft Clay (Đất Nặn Mềm Mại Phẳng)**:
  - Sử dụng hình khối vector phẳng với bo góc tròn lớn (`rounded-2xl`, `rounded-3xl`, `rounded-full`).
  - Ánh sáng tự nhiên với dải `radialGradient` hoặc `linearGradient` đa điểm dịu mắt, vệt sáng phản quang men gốm/đất nặn (Soft Clay Glaze Highlight).
  - Đổ bóng mềm mại, êm ái (`shadow-clay`, `shadow-soft-xl`, `filter: feDropShadow`).
* **Paper Cutout Vector & Tactile Feel**:
  - Cảm giác cắt dán thủ công, tạo chiều sâu thị giác phân tầng rõ ràng nhưng không gây rối mắt.
* **Warm Tone & Nhân Văn**:
  - Ưu tiên các dải màu ấm áp (Pastel Warm Palettes), tạo không gian học tập an toàn tâm lý (Psychological Safety) cho trẻ.
* **Anti-Slop AI**:
  - **TUYỆT ĐỐI CẤM** phong cách 3D CG Blender bóng bẩy kim loại thô cứng, viền neon cyberpunk rực rỡ độc hại, glassmorphism đục ngầu tối tăm hoặc các hình robot vô hồn.

---

## 2. Bảng Màu Chuẩn (Color Tokens)

Các mã màu định danh trong CSS variables (`apps/web/src/shared/styles/index.css`):

| Token | Mã Màu Hex | Ứng Dụng Trong Hệ Thống |
| :--- | :--- | :--- |
| **Brand Purple** | `#6d5efc` (`--color-brand-500`) | Màu thương hiệu chủ đạo, CTA chính, Đảo 5 (Pha Lê), cấp độ Huyền Thoại |
| **Mint Green** | `#10b981` (`--color-mint-500`) | Đảo 1 (Rừng Táo), trạng thái Đúng, Thành công, Thanh tiến độ, Điểm thưởng |
| **Sun Yellow** | `#f59e0b` (`--color-sun-500`) | Sao vàng 3 sao, Đảo 3 (Pizza Phân Số), Cúp Olympic, Tia sét XP |
| **Coral Red / Rose** | `#f43f5e` / `#fb7185` (`--color-coral-500`) | Trái tim máu/năng lượng, quả táo đỏ, nút chú ý, cảnh báo thân thiện |
| **Sky Blue** | `#0ea5e9` (`--color-sky-500`) | Đảo 4 (Đồng Hồ & Cân), Khám phá, Bí kíp Mee, Thao tác vẽ hình |
| **Pastel Slate** | `#f8fafc` / `#334155` | Nền nền tảng dịu mắt, text có độ tương phản cao đạt chuẩn WCAG AA |

---

## 3. Hệ Thống Icon Vector 2D Flat Soft Clay (Thay Thế 100% Emoji)

**QUY TẮC BẮT BUỘC**:
1. **TUYỆT ĐỐI CẤM** render trực tiếp Emoji hệ điều hành (như `🍎`, `🎈`, `🏆`, `⏰`, `⭐`, `🍕`,...) trong các màn hình học sinh, đề thi, chuyên đề, chặng học và thẻ bài. Emoji hệ điều hành bị phân mảnh trên Android/iOS/Windows/macOS và tạo cảm giác không chuyên nghiệp.
2. **100% Icon Vector Thuần Khiết**:
   - Sử dụng thư viện chuẩn `<FlatClayIcon name="..." size={...} />` từ `@/features/asmo/components/AsmoFlatClayIcons`.
   - Mỗi icon được vẽ bằng vector SVG thủ công với `radialGradient` 3D giả lập, vệt sáng phản quang trắng mờ (`opacity: 0.65`) và bóng chân `feDropShadow`.

### Danh mục Icon Soft Clay chuẩn:
* **Chặng học & Đảo học tập**:
  - `FlatClayIslandForest` (`island-forest` / `stage-1`): Đảo Rừng Táo & Phép Cộng Trừ
  - `FlatClayIslandBakery` (`island-bakery` / `stage-2`): Đảo Bánh Ngọt Phép Nhân Chia
  - `FlatClayIslandPizza` (`island-pizza` / `stage-3`): Đảo Pizza Phân Số
  - `FlatClayIslandClock` (`island-clock` / `stage-4`): Đảo Đồng Hồ & Cân Thăng Bằng
  - `FlatClayIslandCrystal` (`island-crystal` / `stage-5`): Đảo Pha Lê & Khối Lập Phương 3D
* **Toán Học & Đồ Vật Montessori**:
  - `FlatClayClock` (`clock` / `analog-clock`): Đồng hồ kim Soft Clay
  - `FlatClayScale` (`scale` / `balance-scale`): Cân đĩa thăng bằng Soft Clay
  - `FlatClayCubeNet` (`cubenet` / `cube-net`): Lưới gấp hộp 6 mặt
  - `FlatClayMatchstick` (`matchstick`): Que diêm đầu đỏ Soft Clay
  - `FlatClayCompass` (`compass` / `maze`): La bàn & Mê cung tọa độ Soft Clay
  - `FlatClayColumnCalc` (`column-calc` / `abacus` / `math`): Đặt tính cột dọc & Gộp tách số
  - `FlatClayBalloon`, `FlatClayPopBurst`, `FlatClayCupcake`, `FlatClayCandy`, `FlatClayWatermelon`, `FlatClayPizzaSlice`, `FlatClayCube`, `FlatClayRedApple`, `FlatClayGreenApple`.
* **Olympic & Gamification**:
  - `FlatClayTrophy` (`trophy`): Cúp vàng vô địch Olympic
  - `FlatClayMedal` (`medal` / `medal-gold` / `medal-silver` / `medal-bronze`): Huy chương 3 hạng
  - `FlatClayStar` (`star`): Ngôi sao vàng 3 sao
  - `FlatClayZap` (`zap` / `xp`): Tia sét năng lượng XP
  - `FlatClayHeart` (`heart` / `hp`): Trái tim sinh mệnh
  - `FlatClayTarget` (`target` / `topic`): Bia ngắm chuyên đề
  - `FlatClayShield` (`shield`): Khiên bảo vệ
  - `FlatClayDiamond` (`diamond` / `gem`): Kim cương pha lê
  - `FlatClaySparkles` (`sparkles`): Bụi sao phép thuật

---

## 4. Quy Chuẩn Button & Input

### Button Styles:
* **Primary CTA (Hành động chính / Tiếp tục / Nộp bài)**:
  ```tsx
  className="bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-extrabold shadow-clay rounded-2xl border-2 border-brand-600 transition-all px-6 py-3.5 text-base sm:text-lg inline-flex items-center justify-center gap-2"
  ```
* **Secondary CTA (Quay lại / Xem mẹo / Thao tác phụ)**:
  ```tsx
  className="bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-bold border-2 border-slate-200 shadow-2xs rounded-2xl transition-all px-5 py-3 text-base inline-flex items-center justify-center gap-2"
  ```
* **Success / Nộp đáp án đúng**:
  ```tsx
  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-clay rounded-2xl border-2 border-emerald-600"
  ```
* **Touch Target Trẻ Em**: Chiều cao tối thiểu 48px, padding click rộng rãi, có phản hồi hover/active nảy nhẹ (tactile bounce).

---

## 5. Quy Chuẩn Bố Cục (Flatten Layout)

1. **Giảm thiểu độ sâu viền (Max 1–2 Border Layers)**:
   - Tuyệt đối không lồng 4–5 lớp card có viền xám chồng chéo khiến không gian bị co hẹp dạng hộp trong hộp.
   - Sử dụng màu nền phân vùng (`bg-slate-50/50`, `bg-brand-50/40`, `bg-white`) thay vì vẽ thêm viền phụ.
2. **Tối Đa Hóa Không Gian Thao Tác (Expanded Canvas Workspace)**:
   - Trẻ em cần không gian lớn để kéo thả, bấm chọn đồ chơi tương tác Montessori.
   - Chiều rộng khu vực tương tác luôn đạt tối đa (`w-full max-w-4xl`), khoảng cách phím bấm thoáng (gap-4 tới gap-6).

---

## 6. Quy Chuẩn Hiển Thị Công Thức KaTeX

1. **Bắt buộc 100% qua Component `<AsmoFormula>`**:
   - Mọi biểu thức toán học (kể cả phép tính đơn giản như $3 + 4 = 7$ hay phân số $\frac{1}{2}$) đều phải bọc qua `<AsmoFormula math="..." />`.
2. **Chống Vỡ Dòng & Tương Thích Di Động**:
   - Thẻ `<AsmoFormula>` luôn tự động áp dụng `inline-flex items-center whitespace-nowrap overflow-x-auto align-middle` để đảm bảo công thức không bao giờ bị ngắt quãng giữa số và dấu phép tính.
3. **Phông Chữ KaTeX Chuẩn**:
   - Sử dụng phông KaTeX rõ ràng, cỡ chữ tối thiểu 16px để học sinh tiểu học dễ đọc.

---

## 7. Quy Chuẩn Sư Phạm Trực Quan (Visual Pedagogy)

1. **Hạn Chế Tối Đa Plain Text**:
   - Tránh các đoạn văn giải thích dài dòng mang tính hàn lâm đại học.
   - Chia nhỏ thành cấu trúc 3 bước:
     * Bước 1: **Đề bài cho gì nhỉ?** (Hình vẽ trực quan)
     * Bước 2: **Mẹo Mèo Mee** (Bí kíp tính nhanh)
     * Bước 3: **Cùng tính nào!** (Phép tính KaTeX)
2. **Comic Flashcards & Montessori Manipulatives**:
   - Trực quan hóa bằng thẻ truyện tranh tư duy (Visual Secret Comic Card).
   - Trang bị thanh kéo thả, đĩa cân bập bênh động, mặt đồng hồ có thể xoay kim, mô hình khối 3D trải phẳng 2D.
