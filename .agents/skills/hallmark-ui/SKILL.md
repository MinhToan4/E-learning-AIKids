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

## 5. Quy Chuẩn Bố Cục Đa Màn Hình & Kỷ Luật Chống Tràn Khung (Zero-Overflow & Multi-Screen Engine)

> [!CAUTION]
> **LỖI NGHIÊM TRỌNG THƯỜNG GẶP**: Giao diện bị đè ra khung (clipping/overflow), xuất hiện thanh cuộn kép (double scroll), hoặc bị giật lắc ngang (horizontal wobble) trên điện thoại và tablet. Mọi agent/developer bắt buộc tuân thủ 5 kỷ luật sắt dưới đây:

### 5.1. Kỷ Luật "Flex Child Defense" (`min-w-0` & `min-h-0`) — TRỊ TẬN GỐC LỖI ĐÈ RA KHUNG
* **Nguyên nhân gốc rễ:** Trong CSS/Tailwind, mặc định mọi `flex-item` có `min-width: auto`. Khi bên trong chứa text dài, ảnh, SVG, công thức KaTeX hoặc component con, flex-item **KHÔNG BAO GIỜ TỰ CO LẠI**, dẫn tới xé toạc khung cha và đè tràn ra ngoài màn hình.
* **Quy tắc bắt buộc:**
  - Bất kỳ flex child nào nằm trong `flex row` mà chứa text, icon, hoặc thẻ con co giãn **BẮT BUỘC PHẢI CÓ `min-w-0`**:
    ```tsx
    // ❌ SAI (Text dài sẽ đẩy nút bấm vỡ khung trên màn hình nhỏ):
    <div className="flex items-center gap-3">
      <p className="truncate">{title}</p>
      <button className="shrink-0">Nộp bài</button>
    </div>

    // ✔️ ĐÚNG (min-w-0 cho phép flex item co lại để truncate hoạt động chuẩn):
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 min-w-0">
        <p className="truncate font-bold">{title}</p>
      </div>
      <button className="shrink-0">Nộp bài</button>
    </div>
    ```
  - Bất kỳ layout `flex-col` nào có vùng cuộn nội dung con **BẮT BUỘC PHẢI CÓ `min-h-0`** trên phần tử co giãn:
    ```tsx
    // ✔️ ĐÚNG (Đảm bảo container con không bung quá chiều cao màn hình):
    <div className="flex flex-col h-[100dvh]">
      <header className="shrink-0 h-16">Header</header>
      <main className="flex-1 min-h-0 overflow-y-auto">Nội dung cuộn mượt</main>
      <footer className="shrink-0">Thanh điều hướng</footer>
    </div>
    ```

### 5.2. Kiến Trúc "1 Vùng Cuộn Duy Nhất" (Single Scroll Context) — TRỊ LỖI SCROLL RÁC
* **CẤM TUYỆT ĐỐI:** Lồng một container có `overflow-y-auto` bên trong một thẻ cha cũng đang có `overflow-y-auto` mà không khống chế chiều cao. Hiện tượng này tạo ra 2 thanh cuộn lồng nhau (Double Scrollbar) gây ức chế tột cùng cho trẻ em khi vuốt chạm.
* **Quy chuẩn chuẩn hóa:**
  1. Toàn bộ màn hình dạng App/LMS Dashboard: Khung gốc ngoài cùng phải khóa cố định: `h-[100dvh] overflow-hidden flex flex-col`.
  2. Chỉ duy nhất một thẻ con `flex-1 min-h-0 overflow-y-auto overflow-x-hidden` được phép nhận sự kiện cuộn.
  3. Mọi dialog/modal: Phải có `max-h-[90dvh] flex flex-col`, phần body của modal là `flex-1 min-h-0 overflow-y-auto`.

### 5.3. Quy Chuẩn Chiều Cao Động Màn Hình Di Động (`100dvh` Thay Vì `100vh`)
* **Vấn đề trên Mobile Safari & Chrome:** Khi thanh địa chỉ (URL bar) xuất hiện hoặc ẩn đi, `100vh` sẽ tính sai và làm ẩn mất 60–80px ở chân trang, khiến nút CTA nộp bài hoặc footer bị trôi ra ngoài màn hình.
* **Quy tắc:**
  - **100% thay thế `100vh` bằng `100dvh`**: Sử dụng `h-[100dvh]` hoặc `min-h-[100dvh]`.
  - Luôn thêm vùng đệm an toàn tai thỏ/thanh gạt đáy: `pb-[env(safe-area-inset-bottom,16px)]` hoặc `pb-safe`.

### 5.4. Quy Chuẩn Kích Thước Co Giãn (Fluid Sizing Thay Vì Fixed Pixel)
* **CẤM TUYỆT ĐỐI:** Dùng chiều rộng cố định lớn hơn 300px như `w-[450px]`, `w-[600px]`, `w-[800px]`.
* **Thay thế bằng:**
  - `w-full max-w-lg mx-auto` hoặc `w-full max-w-4xl mx-auto`.
  - Padding co giãn theo breakpoint: Không dùng `p-8` cố định. Phải dùng: `p-3.5 sm:p-5 md:p-6 lg:p-8`.
  - Gap co giãn: `gap-2.5 sm:gap-4 md:gap-6`.
  - Grid co giãn tự động: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` thay vì hardcode `grid-cols-3`.

### 5.5. Chống Tràn Ngang & Tự Động Bẻ Dòng (Word Wrapping & Overflow Clip)
* **Khung gốc Body/Layout:** Luôn đặt `overflow-x-clip` hoặc `overflow-x-hidden` để triệt tiêu hiện tượng giật lắc ngang (horizontal wobble).
* **Text dài & Tiêu đề:** Mọi thẻ text hiển thị nội dung động (tên bài, lời nhắn Mee, đề toán) phải có `break-words` hoặc `line-clamp-2` kết hợp `min-w-0`.
* **Công thức toán KaTeX & Bảng dữ liệu:** Nếu nội dung bản chất không thể bẻ dòng (như phân số dài hay bảng Olympic), bắt buộc bọc trong container cuộn cục bộ:
  ```tsx
  <div className="w-full max-w-full overflow-x-auto py-1 scrollbar-thin">
    <AsmoFormula math={complexFormula} />
  </div>
  ```

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

---

## 8. Ma Trận Kiểm Thử Responsive (Device Testing Matrix & Verification Checklist)

Trước khi bàn giao bất kỳ màn hình nào, `@Design-agent` và `@FE-agent` **BẮT BUỘC** phải rà soát qua 4 mốc kích thước thiết bị:

| Thiết Bị Mục Tiêu | Độ Rộng Viewport | Yêu Cầu Kiểm Tra Bắt Buộc |
| :--- | :--- | :--- |
| **Mobile Nhỏ (iPhone SE, Galaxy A-series)** | `360px – 390px` | Không có thanh cuộn ngang; Padding lề gọn (`14px–16px`); Nút CTA vừa vặn không che khuất nội dung; Font tiêu đề co về `text-lg` hoặc `text-xl`. |
| **Mobile Chuẩn & Landscape (Xoay Ngang)** | `393px – 430px` (Dọc)<br>`667px – 844px` (Ngang) | Khi xoay ngang màn hình (chiều cao hẹp chỉ ~390px): Header/Footer không được chiếm quá 40% chiều cao; Vùng học tập vẫn cuộn được để thấy nút Nộp bài. |
| **Tablet (iPad 10.2", iPad Air, Galaxy Tab)** | `768px – 1024px` | Đây là thiết bị chính của học sinh: Layout 2 cột cân đối (Cột trái đề bài/Montessori, cột phải tương tác); Touch targets cực nhạy, tối thiểu `48px`. |
| **Desktop / Laptop** | `1280px – 1536px+` | Nội dung được giới hạn trong khung chứa (`max-w-5xl` hoặc `max-w-6xl mx-auto`), không bị giãn bè ra 2 mép màn hình rộng gây mỏi mắt. |

### 🔍 Lệnh Debug Phát Hiện Tràn Khung Trong 3 Giây (DevTools Console):
Dán đoạn mã sau vào Chrome DevTools Console để bôi đỏ ngay lập tức bất kỳ phần tử nào đang đè tràn ra ngoài màn hình:
```javascript
document.querySelectorAll('*').forEach(el => {
  if (el.offsetWidth > document.documentElement.offsetWidth) {
    console.warn('Phần tử tràn khung:', el);
    el.style.outline = '2px dashed red';
  }
});
```

