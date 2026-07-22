# AI Kids Creator Academy — Quy chuẩn giao diện hệ thống

> **Trạng thái:** Quy chuẩn Production bắt buộc
>
> **Phạm vi:** Toàn bộ `apps/web` — học sinh, phụ huynh, giáo viên, quản trị viên
>
> **Đối tượng sử dụng:** AI agent, designer, frontend engineer, reviewer
>
> **Nguyên tắc ưu tiên:** Tính nhất quán và khả năng sử dụng luôn quan trọng hơn một hiệu ứng “đẹp” riêng lẻ.

---

## 1. Mục đích và mức độ bắt buộc

Tài liệu này là **hợp đồng giao diện** của AI Kids Creator Academy. Mọi thay đổi UI phải giữ được cùng một ngôn ngữ thị giác: ấm áp, rõ ràng, thân thiện với trẻ 8–11 tuổi và đủ tin cậy cho người lớn.

Các từ khóa trong tài liệu:

- **PHẢI / KHÔNG ĐƯỢC:** quy tắc bắt buộc; vi phạm là lỗi cần sửa trước khi merge.
- **NÊN:** mặc định phải làm; chỉ khác đi khi có lý do sản phẩm hoặc kỹ thuật rõ ràng.
- **CÓ THỂ:** lựa chọn được phép trong phạm vi đã nêu.

Khi yêu cầu cục bộ mâu thuẫn với quy chuẩn toàn hệ thống, agent phải:

1. Giữ nguyên các phần ngoài phạm vi yêu cầu.
2. Tái sử dụng token, component, icon và pattern hiện có.
3. Nêu rõ xung đột nếu thay đổi được yêu cầu có thể phá vỡ hệ thống.
4. Không tự ý thiết kế lại shell, route, RBAC, dữ liệu hoặc luồng nghiệp vụ.

Không có tài liệu nào đảm bảo giao diện “đẹp mãi” chỉ bằng câu chữ. Chất lượng được bảo vệ bằng bốn lớp: **token chung → component chung → quy trình kiểm tra → review có tiêu chí**.

---

## 2. Tính cách thương hiệu

### 2.1. Ba từ khóa

**Ấm áp · Tò mò · Tin cậy**

- Ấm áp: bo tròn, màu dịu nhưng tươi, khoảng thở thoải mái, câu chữ gần gũi.
- Tò mò: hình ảnh gợi khám phá và sáng tạo; chi tiết vui vừa đủ để trẻ muốn chạm vào.
- Tin cậy: thứ bậc rõ, trạng thái minh bạch, không gây áp lực, không dùng chiêu trò tương tác.

### 2.2. Phong cách Soft Clay

Soft Clay là ngôn ngữ chính của hệ thống:

- Hình khối mềm, góc tròn, bề mặt sáng.
- Chiều sâu nhẹ bằng viền và bóng đổ; không mô phỏng nhựa bóng hoặc kim loại.
- Màu thương hiệu có độ bão hòa vừa phải; không neon, cyberpunk hoặc gradient cầu vồng.
- Hình minh họa và icon mang cảm giác được vẽ có chủ ý, không phải “AI decoration” ngẫu nhiên.
- Nội dung là trung tâm; trang không biến thành poster quảng cáo.

### 2.3. Dấu hiệu của giao diện “giống AI” cần loại bỏ

- Quá nhiều pill, badge, sparkles `✦`, glow và gradient trong cùng một màn hình.
- Mỗi card dùng một kiểu màu, bóng, icon và bo góc khác nhau.
- Tiêu đề dài, subtitle giải thích điều hiển nhiên, microcopy sáo rỗng.
- Mascot xuất hiện ở mọi khoảng trống dù không giúp trẻ hiểu hoặc hành động.
- Icon trộn emoji, Lucide, SVG nhiều màu, ảnh PNG và ký tự Unicode trong cùng một cụm.
- Dashboard có quá nhiều card thống kê nhưng không tạo ra quyết định hoặc hành động.
- Hiệu ứng lơ lửng liên tục chỉ để “trang sinh động”.

---

## 3. Nguồn sự thật trong mã nguồn

Agent **PHẢI đọc file liên quan trước khi code**, không dựng một design system song song.

| Hạng mục | Nguồn sự thật |
|---|---|
| Token màu, font, radius, shadow, motion, nav wrapper | `apps/web/src/shared/styles/index.css` |
| Shell và điều hướng theo role | `apps/web/src/shared/components/layout/AppShell.tsx` |
| Icon học sinh | `apps/web/src/shared/components/icons/KidNavIcons.tsx` |
| Icon phụ huynh | `apps/web/src/shared/components/icons/ParentIcons.tsx` |
| Icon giáo viên/quản trị | `apps/web/src/shared/components/icons/CmsIcons.tsx` |
| Kho asset thiết kế | `apps/web/src/shared/config/assets.ts` |
| Component dùng chung | `apps/web/src/shared/components/ui/` |
| Dữ liệu khóa học, tiến độ, quyền | API/domain; không hardcode trong UI |

Thứ tự ưu tiên khi triển khai:

1. Component/pattern có sẵn đúng mục đích.
2. Mở rộng component hiện có bằng variant nhỏ.
3. Tạo component dùng chung mới khi có ít nhất hai nơi sử dụng hoặc là primitive rõ ràng.
4. Chỉ tạo UI đặc thù trong feature khi thực sự không tái sử dụng được.

**Không được** sao chép CSS/component rồi đổi vài class. Điều đó tạo ra các phiên bản gần giống nhưng lệch nhau theo thời gian.

---

## 4. Khác biệt theo vai trò, cùng một DNA

| Role | Cảm giác | Mật độ | Mục tiêu chính |
|---|---|---:|---|
| Học sinh 8–11 | Vui, sáng, dễ chạm | Thoáng | Hiểu bước tiếp theo trong vài giây |
| Phụ huynh | Ấm, bình tĩnh, riêng tư | Vừa | Nắm tiến bộ và quản lý an toàn |
| Giáo viên | Rõ, hiệu quả, hỗ trợ lớp học | Vừa–cao | Thao tác nhanh, ít nhiễu |
| Quản trị viên | Có hệ thống, đáng tin cậy | Cao có kiểm soát | Quản lý dữ liệu và trạng thái chính xác |

Các role được phép khác nhau về mật độ và accent, nhưng **không được khác nhau về** font, chất lượng icon, radius, trạng thái tương tác, accessibility hoặc cách biểu đạt thương hiệu.

Accent hiện hành:

- Học sinh / mặc định: brand purple.
- Phụ huynh: coral dịu.
- Giáo viên: sky blue.
- Quản trị viên: brand purple.

---

## 5. Design token bắt buộc

### 5.1. Màu

Chỉ dùng token trong `index.css` cho UI Production. Hex dưới đây dùng để nhận diện; code component nên dùng class/token tương ứng.

| Nhóm | Token chính | Vai trò |
|---|---|---|
| Brand | `#6d5efc`, `#5646e8`, `#4436bd` | CTA, active, điểm nhấn thương hiệu |
| Brand soft | `#ebe8ff`, `#f5f3ff` | Nền chọn, nền icon, vùng nhấn nhẹ |
| Sky | `#3dbfff`, `#0878b5`, `#075f91` | Khám phá, thông tin, giáo viên |
| Mint | `#3ed9a0`, `#178a5c`, `#116b4c` | Hoàn thành, thành công, phát triển |
| Sun | `#ffc94a`, `#a66b12`, `#8b5707` | Phần thưởng, chú ý tích cực |
| Coral | `#ff7b93`, `#c03955`, `#9f2642` | Ấm áp, phụ huynh, cảnh báo có kiểm soát |
| Background | `#f3f0ff` | Nền ứng dụng |
| Surface | `#ffffff` | Card, dialog, vùng đọc |
| Text | `#1e2740` | Văn bản chính |
| Muted | `#5c657a` | Văn bản phụ vẫn phải dễ đọc |
| Border | `#e4dff2` | Viền phân tách |
| Focus | `#4338ca` | Focus ring bàn phím |

Quy tắc màu:

- Một màn hình chỉ nên có **một accent chính** và tối đa hai accent hỗ trợ.
- Màu không được là tín hiệu duy nhất. Luôn kèm label, icon, trạng thái hoặc mô tả.
- Văn bản nội dung dùng `text`; văn bản phụ dùng `muted`; không tự giảm opacity làm chữ khó đọc.
- Nền pastel chỉ là vùng phân nhóm. Không dùng chữ pastel trên nền trắng.
- Danger dùng cho lỗi/nguy hiểm thật; không dùng coral danger cho CTA thông thường.
- Không hardcode màu mới nếu token hiện tại đã đáp ứng ý nghĩa.

### 5.2. Typography

- Font nội dung: **Nunito** qua `--font-sans`.
- Font tiêu đề: **Baloo 2** qua `font-display`; chỉ dùng cho heading, số thành tích lớn hoặc moment ăn mừng ngắn.
- Body mặc định hiện tại: `17px`, line-height `1.5`, font-weight `600`.
- Nội dung cho trẻ không nhỏ hơn `16px`; label điều hướng mobile có thể nhỏ hơn khi đã được kiểm chứng khả năng đọc.
- Mỗi page chỉ có một `h1`; không chọn heading level theo kích thước thị giác.
- Không viết cả đoạn bằng chữ in hoa. Uppercase chỉ dành cho eyebrow cực ngắn của role shell.
- Không dùng ba font trở lên, letter spacing phô trương hoặc text gradient cho nội dung.

Thứ bậc gợi ý:

| Cấp | Mobile | Desktop | Ghi chú |
|---|---:|---:|---|
| Page title | 28–32px | 36–42px | `font-display`, ngắn gọn |
| Section title | 22–24px | 24–30px | Mỗi section một ý |
| Card title | 18–20px | 18–22px | Không biến mọi label thành title |
| Body | 16–17px | 17px | Line-height khoảng 1.5 |
| Supporting text | 14–16px | 14–16px | Vẫn đủ contrast |

### 5.3. Radius và chiều sâu

- Card chính: `--radius-card: 1.5rem`.
- Button/control: `--radius-btn: 1rem`.
- Card nhỏ/nested item: `0.875–1.25rem` khi phù hợp.
- Dùng `--shadow-soft`, `--shadow-clay`, `--shadow-press`; không phát minh shadow màu đậm.
- Một surface chỉ cần một cơ chế phân tách chính: viền nhẹ **hoặc** shadow nhẹ. Clay card đặc biệt có thể dùng cả hai có kiểm soát.
- Không lồng quá hai tầng card. Nếu có “card trong card trong card”, cần đơn giản hóa hierarchy.

### 5.4. Khoảng cách và layout

Dùng thang spacing nhất quán, ưu tiên `gap-3`, `gap-4`, `gap-5`, `gap-6`, `p-4`, `p-5`, `p-6`.

- Khoảng cách phải thể hiện quan hệ: thành phần cùng nhóm gần nhau hơn khoảng cách giữa hai nhóm.
- Mobile-first; kiểm tra tối thiểu ở `375px`, `768px`, `1280px`.
- Không để horizontal scroll ngoài vùng chủ động như bảng hoặc thanh nav mobile.
- Nội dung đọc không trải hết màn hình lớn; dùng container/max-width theo layout hiện có.
- Sidebar và bottom navigation thuộc `AppShell`; page feature không được tự dựng bản sao.
- CTA quan trọng phải nhìn thấy mà không cần tìm kiếm, nhưng không đặt nhiều hơn một primary CTA trong cùng một vùng.

---

## 6. Hệ thống icon — quy chuẩn trọng tâm

### 6.1. Mục tiêu

Icon phải giúp người dùng **nhận ra ý nghĩa trước khi đọc hết label**, tạo cảm giác vui với trẻ nhưng vẫn chuyên nghiệp với người lớn. Tất cả icon phải trông như cùng một họ, không giống bộ sticker ghép từ nhiều nguồn.

Ba họ icon hiện hành:

1. **Kid Navigation** — minh họa Soft Clay nhiều màu, `viewBox="0 0 32 32"`.
2. **Parent** — hình khối ấm, rõ, có nền/huy hiệu mềm, `viewBox="0 0 32 32"`.
3. **CMS** — gọn hơn, ít chi tiết hơn, nhiều màu có kiểm soát, `viewBox="0 0 24 24"`.

### 6.2. Thứ tự chọn icon

Agent PHẢI chọn theo thứ tự:

1. Tái sử dụng icon đúng nghĩa trong ba file icon chung.
2. Mở rộng **đúng họ icon** nếu hệ thống chưa có biểu tượng phù hợp.
3. Với utility action của người lớn như đóng, tìm kiếm, sắp xếp, tải xuống: có thể dùng `lucide-react` nếu icon chỉ là nét đơn sắc và không nằm trong navigation/hero.
4. Chỉ dùng asset raster khi đó là illustration, thumbnail hoặc artwork; không dùng PNG/JPG cho icon chức năng.

Không được:

- Dùng Lucide thay cho icon navigation tùy biến hiện có.
- Dùng emoji làm icon chức năng hoặc icon thống kê.
- Trộn icon outline đơn sắc với icon clay nhiều màu trong cùng một nhóm ngang hàng.
- Nhúng icon từ CDN, URL ngoài hoặc package mới nếu chưa có review.
- Dùng ký tự `✦`, `★`, `→` như vật trang trí lặp lại. Ký tự chỉ được dùng khi nó là nội dung có nghĩa và không thay cho icon accessible.

### 6.3. Hình học và tỷ lệ

#### Kid/Parent — canvas 32 × 32

- `viewBox="0 0 32 32"`, hình chính nằm trong safe area khoảng `3–29`.
- Optical center quan trọng hơn mathematical center; bù nhẹ nếu hình có phần nhọn hoặc nặng về một phía.
- Corner radius của khối nhỏ thường `1–4`; nền badge có thể `6–9`.
- Stroke khuyến nghị `1.2–2.2`; `strokeLinecap="round"`, `strokeLinejoin="round"` với nét mở.
- Tránh chi tiết nhỏ hơn khoảng `1.25` đơn vị vì sẽ bết ở kích thước mobile.
- Silhouette phải còn nhận ra ở `20–24px`.

#### CMS — canvas 24 × 24

- `viewBox="0 0 24 24"`, safe area khoảng `2–22`.
- Tối đa 3–5 primitive chính; giảm chi tiết so với icon trẻ em.
- Stroke khuyến nghị `1.2–1.8`.
- Giữ trọng lượng thị giác ngang nhau giữa các icon, kể cả khi số path khác nhau.

### 6.4. Màu của icon

Mỗi icon nên có:

- 1 màu chủ đạo.
- 1 màu phụ hỗ trợ.
- Có thể thêm 1 màu sáng/trung tính cho điểm nhận diện.
- Tối đa 1–2 gradient; không cần gradient nếu flat fill đã rõ.

Màu phải gần bảng token của hệ thống. Một icon không nên dùng hơn 4 màu nổi bật. Không dùng toàn bộ brand, sky, mint, sun và coral trong một icon chỉ để “nhiều màu”.

Gợi ý semantic:

| Ý nghĩa | Màu ưu tiên |
|---|---|
| Khám phá, thế giới, bài học | Sky + mint |
| Tiến bộ, hoàn thành | Mint + brand |
| Thành tích, huy hiệu | Sun + coral/brand |
| Gia đình, phụ huynh | Coral + sun |
| Hồ sơ, tài khoản | Brand + sky |
| Quản trị, hệ thống | Brand + sky, độ bão hòa thấp hơn |
| Lỗi/khóa | Coral/danger; không làm icon đáng sợ với trẻ |

### 6.5. Gradient, ID và độ bền SVG

- Gradient phải nằm trong `<defs>` của icon.
- ID phải có namespace riêng cho component và **không trùng khi render nhiều instance**.
- Với icon có thể xuất hiện nhiều lần trên cùng trang, dùng `React.useId()` để tạo ID ổn định.
- Không dùng SVG filter nặng, blur lớn hoặc drop-shadow bên trong từng icon. Shadow thuộc wrapper CSS.
- Không nhúng base64, script, event handler hoặc resource ngoài vào SVG.
- SVG trang trí có label chữ bên cạnh phải có `aria-hidden="true"` tại nơi sử dụng.
- SVG đứng một mình phải có accessible name bằng `aria-label` hoặc `<title>` liên kết đúng.

Mẫu component được phép:

```tsx
import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function ExampleKidIcon({ size = 24, ...props }: IconProps) {
  const gradientId = `example-kid-${React.useId().replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="8" y1="5" x2="24" y2="27">
          <stop stopColor="#3DBFFF" />
          <stop offset="1" stopColor="#6D5EFC" />
        </linearGradient>
      </defs>
      <rect
        x="5"
        y="5"
        width="22"
        height="22"
        rx="7"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M11 16L14.5 19.5L21.5 12.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
```

Mẫu trên minh họa cấu trúc và an toàn ID; **không phải lý do để mọi icon thành hình vuông có dấu tick**.

### 6.6. Kích thước hiển thị và vùng chạm

| Ngữ cảnh | Kích thước icon | Vùng chạm tối thiểu |
|---|---:|---:|
| Student sidebar desktop | 26–28px | 44 × 44px |
| Student bottom nav | 22–24px | 44 × 44px |
| Parent/Teacher/Admin sidebar | 24–26px | 44 × 44px |
| Utility action | 18–20px | 44 × 44px nếu bấm được |
| Stat/feature icon | 28–36px | Không áp dụng nếu trang trí |
| Empty state illustration icon | 48–72px | Không dùng như nút |

- Thay đổi kích thước bằng prop `size` hoặc wrapper; không sửa `viewBox` để “phóng to”.
- Không scale icon méo theo một chiều.
- Các icon cùng hàng phải có cùng optical weight, không chỉ cùng width/height CSS.

### 6.7. Wrapper và trạng thái navigation

Navigation học sinh dùng `.student-nav-icon`; navigation role người lớn dùng `.role-nav-icon`. Agent không tạo wrapper thứ ba nếu không có nhu cầu hệ thống thật.

Mỗi navigation item phải có:

- Label ngắn, rõ, dùng cùng thuật ngữ trên desktop và mobile.
- Default: icon rõ, label muted nhưng đủ contrast.
- Hover: thay đổi nền/màu nhẹ; chỉ áp dụng trong `@media (hover: hover)`.
- Active: nền soft theo role, label accent, wrapper icon sáng và shadow nhẹ.
- Focus-visible: dùng focus ring toàn hệ thống; không xóa outline.
- Press: dịch chuyển tối đa 1–2px hoặc dùng `shadow-press`.
- Disabled nếu có: giảm nhấn nhưng vẫn đọc được; không cho click.

Không animate riêng từng path của navigation icon. Navigation phải phản hồi nhanh và yên tĩnh.

### 6.8. Từ điển biểu tượng hiện hành

#### Học sinh

| Label | Biểu tượng chuẩn | Component |
|---|---|---|
| Nhà | Ngôi nhà | `NavHomeIcon` |
| Học | Quả địa cầu/khám phá | `NavWorldIcon` |
| Tiến bộ | Cúp thành tích | `NavLeaderboardIcon` |
| Huy hiệu | Huy chương/huy hiệu | `NavBadgeIcon` |
| Ba lô | Ba lô | `NavBackpackIcon` |
| Hồ sơ | Chân dung/avatar | `NavProfileIcon` |

#### Phụ huynh

| Label | Biểu tượng chuẩn | Component |
|---|---|---|
| Tổng quan | Dashboard | `ParentDashboardIcon` |
| Con của tôi | Trẻ em/gia đình | `ParentKidsIcon` |
| Gói học | Gói/kế hoạch | `ParentPlanIcon` |
| Chờ duyệt | Phê duyệt | `ParentApprovalIcon` |
| Hồ sơ | Chân dung phụ huynh | `ParentProfileIcon` |
| Bảo mật | Khiên/khóa | `ShieldLockIcon` |

#### Giáo viên và quản trị

Dùng họ `Cms*Icon`: overview, classes, courses, lectures, analytics, logs, sessions, users, AI. Icon phải trực tiếp mô tả danh từ/chức năng; tránh ẩn dụ dễ hiểu nhầm.

Không đổi metaphor của icon navigation hiện có trong một feature request cục bộ. Nếu cần đổi toàn hệ thống, phải cập nhật đồng thời desktop, mobile, label, test và tài liệu này.

### 6.9. Checklist thiết kế icon mới

Trước khi code:

- [ ] Đã tìm trong cả ba icon suite, không tạo icon trùng nghĩa.
- [ ] Đã chọn đúng họ theo role và ngữ cảnh.
- [ ] Metaphor hiểu được khi không có màu.
- [ ] Silhouette nhận ra ở 20–24px.
- [ ] Số màu, gradient và chi tiết không vượt quy định.

Trong khi code:

- [ ] `viewBox` đúng 32 hoặc 24 theo họ.
- [ ] Props kế thừa `SVGProps<SVGSVGElement>` và hỗ trợ `size`.
- [ ] Stroke bo tròn, không có chi tiết quá nhỏ.
- [ ] Gradient ID không va chạm giữa nhiều instance.
- [ ] Không có filter/resource/script ngoài.

Trước khi merge:

- [ ] So cạnh toàn bộ icon cùng nhóm ở kích thước thật.
- [ ] Kiểm tra default, hover, active, focus, mobile.
- [ ] Kiểm tra icon ở màn hình sáng, độ tương phản thấp và zoom 200%.
- [ ] Không có layout shift khi icon tải/render.
- [ ] Có accessible label phù hợp.

---

## 7. Hình ảnh, artwork và mascot

- Asset sản phẩm phải đi qua `designerAssets` trong `apps/web/src/shared/config/assets.ts` khi phù hợp.
- Ưu tiên derivative trong `/assets/optimized/`; không đưa file gốc rất lớn vào card nhỏ.
- Ảnh phải có kích thước/aspect ratio ổn định để tránh CLS.
- Ảnh dưới fold nên lazy-load; hero quan trọng mới được ưu tiên tải.
- Ảnh mang nội dung cần `alt` cụ thể, ngắn; ảnh trang trí dùng `alt=""`.
- Không dùng ảnh trẻ em thật nếu không có nguồn gốc, quyền sử dụng và quy trình riêng tư rõ ràng.
- Mascot chỉ xuất hiện khi hướng dẫn, chào mừng, empty state hoặc moment ăn mừng có ý nghĩa.
- Không dùng mascot, confetti, sparkles và sticker cùng lúc.
- Không tự sinh thêm ảnh chỉ để lấp khoảng trống. Khoảng trắng là một phần của thiết kế.

---

## 8. Component và pattern giao diện

### 8.1. Page anatomy mặc định

Một page feature thường chỉ cần:

1. Page header: `h1` ngắn + mô tả nếu thực sự thêm thông tin.
2. Primary action hoặc bộ lọc, không phải cả hai cụm CTA cạnh tranh.
3. Nội dung chính theo một hierarchy rõ.
4. Loading, empty, error và success state.

Không bắt buộc subtitle. Nếu tiêu đề đã đủ nghĩa, bỏ subtitle thay vì viết một câu truyền cảm hứng chung chung.

### 8.2. Card

- Card đại diện cho một nhóm nội dung hoặc hành động, không phải vật trang trí.
- Card click toàn khối phải dùng link/button semantic và có focus state.
- Không đặt button click bên trong card click toàn khối nếu gây nested interaction.
- Card cùng nhóm phải cùng padding, radius, title placement và chiều cao logic.
- Dữ liệu so sánh nên dùng list/table/metric row, không ép mọi giá trị thành card.

### 8.3. Button

- Một vùng chỉ có một primary button.
- Label dùng động từ rõ: “Bắt đầu học”, “Lưu thay đổi”, “Duyệt tác phẩm”.
- Không dùng “OK”, “Submit”, “Click here” trong sản phẩm tiếng Việt.
- Mọi button có default, hover, press, focus, disabled và loading.
- Loading không làm button thay đổi chiều rộng đột ngột.
- Destructive action phải khác biệt rõ và cần xác nhận theo mức độ hậu quả.

### 8.4. Form

- Label luôn hiển thị phía trên; placeholder không thay label.
- Help text giải thích format hoặc hậu quả, không lặp lại label.
- Lỗi nằm gần field, bằng tiếng Việt dễ sửa, và có liên kết accessibility phù hợp.
- Không xóa dữ liệu người dùng chỉ vì request thất bại.
- Trên CMS, control vẫn tối thiểu 44px và tab order phải tự nhiên.

### 8.5. Trạng thái hệ thống

- Loading: dùng shared `Skeleton` hoặc trạng thái loading nhất quán; không để màn hình trắng.
- Empty: nói điều gì chưa có và đưa ra bước tiếp theo nếu người dùng có quyền.
- Error: mô tả điều xảy ra, hành động thử lại và không lộ chi tiết kỹ thuật.
- Success: xác nhận ngắn; không dùng confetti cho thao tác thường xuyên.
- Permission denied: giải thích theo role, không ngụ ý dữ liệu có tồn tại nếu người dùng không được biết.

---

## 9. Quy tắc riêng cho trang Tiến bộ

Trang Tiến bộ là nơi trẻ nhìn lại hành trình cá nhân, **không phải bảng xếp hạng công khai**.

- Dùng `NavLeaderboardIcon`/họ `KidNavIcons` cho biểu tượng liên quan; không trộn Lucide trong cụm thống kê ngang hàng.
- Ưu tiên số liệu có ích: bài đã hoàn thành, chuỗi học, huy hiệu, hành trình tiếp theo.
- Không hiển thị thứ hạng công khai hoặc so sánh trẻ này với trẻ khác.
- Không lặp lại thông điệp đạo đức dài ở header nếu UI đã thể hiện đúng nguyên tắc.
- Không thêm sparkles/lơ lửng liên tục quanh tiêu đề.
- Không để quá nhiều chữ trước phần tiến độ chính.
- Giữ artwork thành tích như điểm nhấn duy nhất; không cạnh tranh với nhiều sticker nhỏ.
- Một yêu cầu chỉnh trang Tiến bộ không được tự động đổi icon ở sidebar, shell của role khác hoặc route.

---

## 10. Ngôn ngữ và microcopy tiếng Việt

### 10.1. Giọng điệu

- Nói trực tiếp, ấm áp, tích cực và cụ thể.
- Trẻ em: câu ngắn, một câu một ý, từ quen thuộc.
- Người lớn: bình tĩnh, minh bạch, không trẻ con hóa.
- Khen nỗ lực hoặc hành động cụ thể; không gắn giá trị con người với điểm số.
- Không gây xấu hổ, sợ hãi, FOMO hoặc áp lực giữ streak.

### 10.2. Quy tắc viết

- Ưu tiên: “Con đã hoàn thành 3 bài” thay cho “Một hành trình phi thường đang được viết nên”.
- Ưu tiên: “Thử lại” thay cho “Đã xảy ra lỗi không xác định”.
- Ưu tiên: “Chưa có tác phẩm” + bước tiếp theo thay cho một đoạn giải thích dài.
- Không lặp lại cùng thông tin ở eyebrow, title và subtitle.
- Không dùng dấu chấm than liên tục; tối đa một dấu khi thực sự ăn mừng.
- Giữ thuật ngữ nhất quán: “Tiến bộ”, “Huy hiệu”, “Ba lô”, “Tác phẩm”, “Bài học”.
- Không dùng jargon kỹ thuật, mã lỗi, tên database hoặc stack trace trong UI.

### 10.3. Microcopy an toàn cho trẻ

- Không hỏi hoặc hiển thị dữ liệu cá nhân không cần thiết.
- Không thúc trẻ chia sẻ công khai.
- Luôn phân biệt rõ hành động cần cha/mẹ duyệt.
- Nội dung từ AI phải có cách báo lỗi/báo cáo phù hợp và không được trình bày như sự thật tuyệt đối.

---

## 11. Motion và phản hồi tương tác

Motion phải giải thích thay đổi trạng thái, không phải chứng minh rằng trang có animation.

### 11.1. Thời lượng

| Loại | Thời lượng gợi ý |
|---|---:|
| Hover/press/focus | 120–180ms |
| Mở/đóng card, tab, page enter | 180–280ms |
| Progress fill/celebration ngắn | 400–700ms |

- Ưu tiên animate `transform` và `opacity`.
- Tránh animate layout property như `width`, `height`, `top`, `left` khi có thể dùng transform.
- Page enter chỉ nên dịch chuyển 4–8px và fade nhẹ.
- Không dùng bounce mạnh trên nội dung cần đọc.
- Tối đa một ambient animation có chủ ý trên một viewport; mặc định là không có.
- Bắt buộc tôn trọng `prefers-reduced-motion`; hệ thống đã có fallback trong CSS.
- Animation không được chặn click, trì hoãn điều hướng hoặc làm thay đổi thứ tự đọc.

### 11.2. Performance motion

- Không chạy animation vô hạn cho nhiều card/icon.
- Không dùng blur/filter động trên vùng lớn.
- Không dùng JS animation khi CSS transition đủ đáp ứng.
- Với Framer Motion, dùng shared `PageMotion`/pattern hiện có và tránh bundle thêm thư viện motion.

---

## 12. Responsive và input

- Thiết kế mobile trước, sau đó mở rộng; không thu nhỏ desktop nguyên xi.
- Student desktop dùng rail; mobile dùng bottom navigation hiện có.
- Adult mobile dùng role navigation hiện có; không dựng menu khác trong từng page.
- Tap target tối thiểu `44 × 44px`.
- Hover chỉ là tăng cường; mọi thao tác phải dùng được bằng touch và keyboard.
- Không che nội dung bởi sticky header/bottom nav; chừa safe area phù hợp.
- Bảng CMS trên mobile phải có chiến lược: scroll có chủ ý, card hóa hàng, hoặc ẩn cột thứ yếu — không ép chữ siêu nhỏ.
- Kiểm tra zoom 200%, text wrapping dài và tên người dùng dài.

---

## 13. Accessibility bắt buộc

Mục tiêu tối thiểu là WCAG 2.2 AA cho luồng chính.

- HTML semantic trước ARIA: `button`, `a`, `nav`, `main`, heading đúng cấp.
- Không dùng `div` click nếu một phần tử semantic phù hợp tồn tại.
- Focus-visible rõ bằng token hệ thống; không `outline: none` nếu không thay bằng focus tương đương.
- Contrast body text tối thiểu 4.5:1; text lớn tối thiểu 3:1.
- Icon không được là cách duy nhất truyền đạt trạng thái.
- Form error dùng liên kết `aria-describedby`/`aria-invalid` phù hợp.
- Dialog quản lý focus, Escape, label và trả focus về trigger.
- Error quan trọng có `role="alert"` khi phù hợp; không lạm dụng live region.
- Ảnh trang trí `alt=""`; ảnh có ý nghĩa có alt mô tả chức năng/nội dung, không viết “hình ảnh của”.
- Kiểm tra toàn bộ luồng chỉ bằng keyboard.
- Màu và motion phải có phương án cho người dùng thị lực/tiền đình nhạy cảm.

---

## 14. Hiệu năng thị giác và kỹ thuật

- Không thêm dependency UI/icon/motion nếu hệ thống hiện có làm được.
- Tái sử dụng custom SVG component; SVG nhỏ không cần fetch ngoài.
- Ảnh card dùng asset tối ưu, đúng kích thước; không tải ảnh gốc nhiều MB.
- Khai báo aspect ratio hoặc kích thước để tránh layout shift.
- Lazy-load nội dung ngoài viewport; không lazy-load tài nguyên LCP quan trọng một cách máy móc.
- Không render animation/background canvas liên tục khi không cần.
- Không làm request dữ liệu trùng chỉ để phục vụ trang trí.
- Không hardcode catalog/tiến độ giả trong frontend Production.
- Khi thay đổi UI lớn, kiểm tra build output và cân nhắc ảnh hưởng bundle/LCP/CLS/INP.

Ngân sách định tính:

- Tương tác phải phản hồi ngay về thị giác.
- Điều hướng không bị chặn bởi animation.
- Trang không nhảy khi ảnh/font/icon xuất hiện.
- Skeleton phải gần kích thước nội dung thật.

---

## 15. Bảo mật, riêng tư và RBAC trong UI

UI không phải lớp bảo mật duy nhất, nhưng không được làm suy yếu bảo mật.

- Không thay đổi route guard/RBAC trong một task thuần giao diện.
- Không hiển thị control mà role không được phép dùng nếu điều đó gây nhầm lẫn hoặc lộ khả năng hệ thống.
- Backend vẫn phải xác quyền; ẩn button không thay thế authorization.
- Không đưa secret, token, internal ID nhạy cảm hoặc stack trace vào client/log UI.
- Nội dung tiến bộ và tác phẩm của trẻ mặc định là riêng tư theo mô hình sản phẩm.
- Preview/upload phải xử lý type, size và lỗi an toàn; không render HTML người dùng chưa sanitize.
- Link ngoài mở tab mới cần `rel="noreferrer"`/`noopener` theo implementation phù hợp.
- Confirm dialog chỉ dùng cho hành động có hậu quả, không dùng để che một luồng khó hiểu.

---

## 16. Những điều tuyệt đối không làm

1. Không redesign toàn hệ thống từ một yêu cầu sửa một page.
2. Không đổi icon sidebar nếu yêu cầu chỉ nói về icon trong nội dung page.
3. Không thay custom icon suite bằng thư viện outline toàn cục.
4. Không dùng emoji làm ngôn ngữ icon chính.
5. Không thêm sparkles, floating shapes, glassmorphism hoặc glow như mặc định.
6. Không hardcode màu/radius/shadow mới khi token đáp ứng được.
7. Không sao chép component để tạo biến thể gần giống.
8. Không đổi route, API contract, role guard hoặc dữ liệu để “dễ làm UI”.
9. Không hiển thị ranking công khai của trẻ.
10. Không để loading trắng, lỗi im lặng hoặc empty state cụt nghĩa.
11. Không dùng text quá nhỏ, contrast thấp hoặc button dưới 44px cho thao tác chính.
12. Không thêm package khi chưa chứng minh component hiện tại không đáp ứng.
13. Không tuyên bố “đã hoàn hảo” nếu chưa test viewport, state và luồng thật.

---

## 17. Quy trình bắt buộc dành cho AI agent

### Bước 1 — Hiểu phạm vi

- Đọc yêu cầu và xác định: page nào, role nào, component nào, điều gì phải giữ nguyên.
- Nếu cụm “toàn hệ thống” xuất hiện, lập danh sách màn hình/pattern bị tác động; không hiểu thành quyền thay mọi thứ.
- Kiểm tra working tree để tránh ghi đè thay đổi của người dùng.

### Bước 2 — Khảo sát mã nguồn thật

- Tìm route/page/component bằng `rg`.
- Đọc `index.css`, shared UI, đúng icon suite và `AppShell` nếu có liên quan.
- Xác định dữ liệu đến từ API/domain; không tạo dữ liệu giả vào Production.

### Bước 3 — Đề xuất thay đổi nhỏ nhất có hệ thống

- Chỉ ra root cause: hierarchy, copy, spacing, icon inconsistency, state hay performance.
- Chọn token và component tái sử dụng.
- Xác định side effect desktop/mobile và các role khác.
- Nếu cần icon mới, hoàn thành checklist mục 6.9 trước khi viết SVG.

### Bước 4 — Triển khai

- Code semantic, TypeScript rõ kiểu, class có hệ thống.
- Comment giải thích **lý do** cho quyết định không hiển nhiên, không mô tả lại code.
- Không refactor ngoài phạm vi nếu không cần để hoàn thành task an toàn.

### Bước 5 — Kiểm tra trực quan

Tối thiểu kiểm tra:

- `375px`: không tràn, bottom nav/touch target đúng.
- `768px`: grid và wrapping hợp lý.
- `1280px`: hierarchy, max-width, sidebar đúng.
- Default, hover, press, focus-visible, disabled, loading.
- Loading, empty, error, success.
- Copy dài, dữ liệu rỗng, tên dài.
- Reduced motion và keyboard navigation.
- Icon mới cạnh toàn bộ icon cùng họ.

### Bước 6 — Kiểm tra kỹ thuật

Chạy tối thiểu:

```bash
npm run typecheck -w @aikids/web
npm run test -w @aikids/web
npm run build -w @aikids/web
```

Nếu task tác động domain/API, chạy thêm test tương ứng. Không che giấu test fail có sẵn; phân biệt rõ lỗi do thay đổi và lỗi môi trường.

### Bước 7 — Báo cáo

Agent phải nêu:

- Đã sửa gì và lý do.
- File nào thay đổi.
- Đã kiểm tra gì, kết quả ra sao.
- Rủi ro/giới hạn còn lại nếu có.
- Xác nhận không thay route, RBAC, API hoặc dữ liệu nếu task chỉ là UI.

---

## 18. Definition of Done cho một thay đổi UI

Một thay đổi chỉ được coi là hoàn thành khi:

- [ ] Đúng yêu cầu và đúng role, không mở rộng phạm vi ngoài ý định.
- [ ] Dùng token/component/icon suite hiện có.
- [ ] Không tạo dấu hiệu “AI slop” ở mục 2.3.
- [ ] Icon đồng bộ về metaphor, geometry, palette và optical weight.
- [ ] Copy ngắn, tự nhiên, đúng tiếng Việt và phù hợp độ tuổi.
- [ ] Responsive tốt tại 375/768/1280px.
- [ ] Có đầy đủ trạng thái cần thiết.
- [ ] Keyboard, focus, contrast, alt/ARIA đạt yêu cầu.
- [ ] Reduced motion được tôn trọng.
- [ ] Không gây layout shift hoặc tải asset quá mức.
- [ ] Typecheck, test và build liên quan đã chạy thành công.
- [ ] Không ảnh hưởng route, RBAC, API, dữ liệu hoặc role khác ngoài phạm vi.

### Mức độ lỗi khi review

| Mức | Ví dụ | Xử lý |
|---|---|---|
| Blocker | Sai role/RBAC, lộ dữ liệu trẻ, mất chức năng, không keyboard dùng được | Không merge |
| High | Icon lệch hệ thống, mobile vỡ, contrast kém, thiếu error/loading quan trọng | Sửa trước merge |
| Medium | Spacing/hierarchy/copy thiếu nhất quán, motion thừa | Nên sửa trong PR |
| Low | Tinh chỉnh optical alignment vài pixel, cải thiện wording nhỏ | Có thể follow-up có chủ đích |

---

## 19. Cách cập nhật quy chuẩn

Tài liệu phải thay đổi cùng code khi:

- Thêm hoặc đổi token toàn cục.
- Thêm họ icon hoặc đổi metaphor navigation.
- Thay đổi shell/navigation theo role.
- Thêm pattern dùng chung quan trọng.
- Thay đổi tiêu chuẩn accessibility/performance của dự án.

Không cập nhật quy chuẩn chỉ để hợp thức hóa một ngoại lệ xấu. Mọi ngoại lệ phải có lý do, phạm vi, owner và kế hoạch loại bỏ nếu là tạm thời.

---

## 20. Tài liệu tham chiếu uy tín

- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
- WAI — Images and alt text: <https://www.w3.org/WAI/tutorials/images/>
- WAI-ARIA Authoring Practices: <https://www.w3.org/WAI/ARIA/apg/>
- web.dev — Responsive images: <https://web.dev/learn/images/descriptive>
- web.dev — Core Web Vitals: <https://web.dev/articles/vitals>
- MDN — `prefers-reduced-motion`: <https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion>
- OWASP ASVS: <https://owasp.org/www-project-application-security-verification-standard/>
- UNICEF — AI and children: <https://www.unicef.org/innocenti/reports/policy-guidance-ai-children>

---

## Tóm tắt 10 giây cho agent

> Đọc code thật trước khi sửa. Giữ Soft Clay ấm áp, Nunito/Baloo 2, token chung và shell chung. Dùng đúng một trong ba icon suite; không emoji, không trộn style, không sparkles/glow vô cớ. Trẻ cần UI thoáng và câu ngắn; người lớn cần UI rõ và tin cậy. Mọi control đủ 44px, mọi state có phản hồi, mọi motion tôn trọng reduced motion. Test 375/768/1280, keyboard, typecheck, test và build. Một thay đổi cục bộ không bao giờ là lý do phá tổng thể hệ thống.
