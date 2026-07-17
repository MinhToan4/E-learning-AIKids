---
title: "AI Agent Master Prompt — Build AI Kids Creator Academy Prototype"
version: "1.0"
language: "vi-VN"
usage: "Paste this entire file into an AI coding agent together with the product specification."
---

# MASTER PROMPT DÀNH CHO AI CODING AGENT

## 0. Cách sử dụng

1. Đặt file này và file `AI_Kids_Creator_Academy_Prototype_Spec.md` trong thư mục gốc repository.
2. Gửi toàn bộ nội dung file này cho coding agent.
3. Yêu cầu agent đọc file spec trước khi sửa code.
4. Agent phải tự kiểm tra build, typecheck, lint và các flow chính trước khi kết thúc.
5. Không yêu cầu người dùng cung cấp API key để chạy prototype.

---

# 1. Vai trò của bạn

Bạn là một nhóm sản phẩm cấp senior bao gồm:

- Product Designer chuyên UX trẻ em.
- UI Designer.
- Frontend Architect.
- React/TypeScript Engineer.
- Accessibility Engineer.
- Child Safety Engineer.
- EdTech Product Manager.
- QA Engineer.

Nhiệm vụ của bạn là **tự xây dựng một prototype hoàn chỉnh, có thể chạy, có thể demo trước khách hàng**, cho nền tảng `AI Kids Creator Academy`.

Bạn không chỉ tạo landing page hoặc dashboard tĩnh. Bạn phải tạo **một trải nghiệm tương tác đầu-cuối**.

---

# 2. Nguồn sự thật

Trước khi code:

1. Đọc toàn bộ file `AI_Kids_Creator_Academy_Prototype_Spec.md`.
2. Liệt kê nội bộ các route, component, state và acceptance criteria.
3. Khảo sát repository hiện tại.
4. Giữ lại cấu trúc tốt nếu đã có.
5. Không tự ý bỏ màn hình bắt buộc.
6. Không hỏi lại những chi tiết đã có trong spec.
7. Khi có mâu thuẫn, ưu tiên:
   - Child safety.
   - Accessibility.
   - Ease of use.
   - Stable demo.
   - Visual polish.

---

# 3. Kết quả bắt buộc

Tạo một ứng dụng web có đầy đủ:

1. Welcome.
2. Onboarding.
3. World Map.
4. Quest Intro.
5. Learn Cards.
6. Prompt Builder kéo-thả.
7. AI Generation loading giả lập.
8. Compare Results.
9. Comic Studio.
10. Storyboard/Video Studio.
11. Backpack.
12. Portfolio.
13. Parent Dashboard.
14. Teacher Dashboard.
15. Empty/loading/error states.
16. Responsive desktop/tablet.
17. Accessibility cơ bản WCAG 2.2 AA.
18. Safety guardrails.
19. Mock data hoàn chỉnh.
20. Demo mode không cần backend thật.

Ứng dụng phải có cảm giác như một sản phẩm hoàn chỉnh, không giống wireframe.

---

# 4. Hard constraints

## 4.1. Child safety

Tuyệt đối không:

- Chatbot mở.
- Nội dung tình dục.
- Bạo lực đồ họa.
- Tự hại.
- Chất gây nghiện.
- Thù ghét.
- Bắt nạt.
- Người thật hoặc người nổi tiếng.
- Deepfake.
- Upload ảnh khuôn mặt.
- Clone giọng.
- PII.
- Địa chỉ, số điện thoại, email, tên trường.
- Chat riêng.
- Link ngoài do học sinh nhập.
- Public sharing mặc định.
- Quảng cáo.
- Loot box.
- Mua vật phẩm.
- Leaderboard công khai.
- Dark patterns.
- Streak gây áp lực.

Toàn bộ mock asset và nội dung phải là nhân vật tưởng tượng thân thiện.

## 4.2. Không sao chép IP

Không sao chép:

- Scratch Cat.
- Disney/Pixar.
- Pokémon.
- Roblox.
- Minecraft.
- Duolingo.
- Nhân vật game/phim nổi tiếng.
- Logo hoặc asset của Code.org, Scratch, Adobe.

Chỉ học pattern UX, tự tạo visual language riêng.

## 4.3. Demo stability

- Không phụ thuộc API key.
- Không gọi dịch vụ AI bên ngoài.
- Không phụ thuộc server riêng.
- Mọi generation dùng mock async.
- Route refresh không 404 trong dev.
- Có dữ liệu seed.
- Không để TODO nhìn thấy trong UI.
- Không để nút chết.
- Không để placeholder “Lorem ipsum”.
- Không có ảnh lỗi.
- Không có console error nghiêm trọng.

---

# 5. Tech stack

Nếu repository chưa có stack:

- Vite + React.
- TypeScript strict.
- Tailwind CSS.
- React Router.
- Zustand.
- dnd-kit.
- React Konva/Konva cho comic canvas.
- Framer Motion cho motion.
- Lucide React cho icon.
- Vitest + Testing Library.
- ESLint.
- Prettier.

Không cài dependency không cần thiết.

Nếu React Konva gây lỗi build trong môi trường hiện tại, tạo editor DOM/SVG tương tác ổn định thay vì để dự án hỏng. Ưu tiên demo chạy được.

---

# 6. Quy trình thực hiện bắt buộc

## Phase 1 — Audit

- Đọc cấu trúc project.
- Đọc package.json.
- Xác định lệnh dev/build/test.
- Xác định component hiện có.
- Không xóa code tốt không cần thiết.

## Phase 2 — Architecture

Tạo hoặc chuẩn hóa:

```text
src/
├── app/
├── routes/
├── components/
├── features/
├── data/
├── hooks/
├── lib/
├── styles/
└── types/
```

## Phase 3 — Design tokens

Tạo token tập trung cho:

- Colors.
- Typography.
- Spacing.
- Radius.
- Shadow.
- Motion.
- Z-index.
- Breakpoints.

Không hardcode màu tùy tiện trên từng component.

## Phase 4 — Foundation components

Xây:

- Button.
- Card.
- ChoiceCard.
- PromptChip.
- Progress.
- Modal.
- Drawer.
- Toast.
- EmptyState.
- ErrorState.
- LoadingCreature.
- AppShell.
- Navigation.
- Tooltip chỉ dùng phụ trợ.
- VisuallyHidden.
- SkipLink.

## Phase 5 — Mock domain

Tạo type và dữ liệu:

- Child.
- Course.
- Quest.
- Skill.
- Project.
- Asset.
- Scene.
- PromptAttempt.
- Badge.
- Approval.
- Student.
- Review.

## Phase 6 — Student flow

Xây theo thứ tự:

1. Welcome.
2. Onboarding.
3. World Map.
4. Quest.
5. Prompt Builder.
6. Generate.
7. Compare.
8. Comic.
9. Video.
10. Backpack.
11. Portfolio.

## Phase 7 — Adult dashboards

- Parent Overview.
- Parent Approvals.
- Parent Privacy.
- Teacher Overview.
- Teacher Students.
- Teacher Projects.
- Review flow.

## Phase 8 — Accessibility and safety

- Keyboard.
- Focus.
- Labels.
- Alternative drag/drop.
- Reduced motion.
- Safety validation.
- PII detector mock.
- Child-friendly error copy.

## Phase 9 — Quality

Chạy:

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

Nếu script chưa có, bổ sung phù hợp.

Sửa lỗi đến khi build thành công.

---

# 7. Visual direction

## 7.1. Personality

- Playful.
- Warm.
- Modern.
- Creative.
- Trustworthy.
- Không “baby”.
- Không neon cyberpunk.
- Không giống dashboard doanh nghiệp.
- Không quá nhiều gradient.
- Không dùng glassmorphism làm nền chính.

## 7.2. Theme

Dùng nền sáng dịu:

- Background gần `#F7F8FC`.
- Surface trắng.
- Brand tím xanh.
- Accent sky, mint, sun, coral.
- Text xanh than.
- Border nhẹ.

## 7.3. Shape

- Card radius 20–24 px.
- Button 14–18 px.
- Shadow mềm.
- Minh họa dạng 2D/2.5D.
- Component lớn, thoáng.

## 7.4. Typography

- Nunito Sans, Be Vietnam Pro hoặc system sans.
- Display có thể dùng Fredoka/Baloo 2 nếu đã có qua web font hợp lệ.
- Body 16–18 px.
- Không chữ quá nhỏ.
- Hỗ trợ tiếng Việt đầy đủ.

## 7.5. Illustration assets

Nếu không có image generation tool:

- Dùng CSS, SVG tự tạo, geometric shapes hoặc open licensed illustration.
- Đảm bảo phong cách nhất quán.
- Không hotlink hình không rõ license.
- Không dùng ảnh người thật.
- Không dùng placeholder xấu.

---

# 8. App shell

## Student

Desktop:

- Topbar.
- Sidebar.
- Main content.
- Optional helper panel.

Tablet:

- Topbar.
- Main.
- Bottom nav.
- Helper drawer.

## Adult

- Sidebar dashboard.
- Header.
- Main content.
- Ít animation hơn.

Tạo `role switcher` chỉ cho demo trong menu ẩn hoặc profile:

- Student.
- Parent.
- Teacher.

Không làm role switcher quá nổi trong luồng trẻ.

---

# 9. Route requirements

```text
/welcome
/onboarding
/world
/quest/character
/quest/character/learn
/studio/prompt
/studio/compare
/studio/comic
/studio/video
/backpack
/portfolio/star-cat
/parent/overview
/parent/approvals
/parent/privacy
/teacher/overview
/teacher/students
/teacher/projects
```

Mỗi route phải có title và trạng thái thích hợp.

---

# 10. State model

Dùng Zustand hoặc state tương đương.

```ts
type DemoState = {
  currentRole: "student" | "parent" | "teacher";
  child: ChildProfile;
  completedQuestIds: string[];
  currentProject: CreativeProject;
  backpackAssets: Asset[];
  selectedPromptParts: PromptParts;
  generatedResults: GeneratedResult[];
  selectedResultId?: string;
  comicPages: ComicPage[];
  videoScenes: VideoScene[];
  approvals: Approval[];
};
```

Persist phần cần thiết vào localStorage.

Có `Reset demo` trong adult menu.

---

# 11. Prompt Builder

## UI bắt buộc

- 5 slot:
  - Nhân vật.
  - Hành động.
  - Bối cảnh.
  - Cảm xúc.
  - Phong cách.
- Chip có icon/minh họa.
- Kéo-thả.
- Click-to-add.
- Slot selected state.
- Câu prompt tổng hợp.
- Safety hint.
- Nút “Tạo 3 phiên bản”.

## Dữ liệu mẫu

Nhân vật:

- Mèo phi hành gia.
- Cáo kỹ sư.
- Robot làm vườn.
- Rồng tí hon.

Hành động:

- Sửa tàu.
- Tìm bản đồ.
- Trồng cây ánh sáng.
- Giải câu đố.

Bối cảnh:

- Hành tinh tím.
- Thư viện trên mây.
- Khu rừng pha lê.
- Thành phố dưới biển.

Cảm xúc:

- Dũng cảm.
- Tò mò.
- Vui vẻ.
- Bình tĩnh.

Phong cách:

- Truyện tranh thiếu nhi.
- Cắt giấy.
- Màu nước.
- 3D mềm mại.

## Validation

Thiếu slot:

> “Thêm bối cảnh để AI hiểu nhân vật đang ở đâu nhé!”

Free text tối đa 80 ký tự.

Mock PII detector chặn:

- Email pattern.
- Phone pattern.
- “trường …”.
- “địa chỉ …”.
- URL.

---

# 12. Mock generation

Tạo service:

```ts
generateImages(prompt: PromptParts): Promise<GeneratedResult[]>
```

Behavior:

- Delay 1800–2800 ms.
- Hiển thị progress stages.
- Trả 3 result có thumbnail khác nhau.
- Có 5% failure mode chỉ khi bật demo error trong developer panel.
- Không random gây demo không lặp lại; dùng deterministic seed.

Nếu không có ảnh thật, tạo SVG scene cards đẹp dựa trên prompt.

Mỗi result:

```ts
{
  id,
  title,
  imageUrl,
  matches: {
    character: true,
    action: true,
    environment: boolean
  },
  oddDetail?: string
}
```

---

# 13. Compare Results

Phải có:

- 3 result cards.
- Select state.
- Checklist đánh giá.
- “Chi tiết lạ” trên một result để dạy AI Detective.
- Nút sửa prompt.
- Nút dùng ảnh.

Ví dụ:

- Result B có “ba mặt trăng dù câu chuyện chỉ có một”.
- Trẻ chọn result A.
- Nhận badge “Thám tử AI”.

---

# 14. Comic Studio

## Chức năng tối thiểu

- Template 4 panel.
- Asset tray.
- Kéo nhân vật/background vào panel.
- Click-to-place alternative.
- Select element.
- Move.
- Resize.
- Rotate giới hạn.
- Delete + undo.
- Layer up/down.
- Speech bubble.
- Caption.
- Sticker.
- Undo/redo.
- Autosave.
- Preview.
- Save.

## Data model

```ts
type ComicElement = {
  id: string;
  type: "image" | "text" | "bubble" | "sticker";
  panelId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  content: string;
};
```

## UX

- Toolbar có icon + label.
- Selected element có outline rõ.
- Không phụ thuộc right-click.
- Touch hoạt động.
- Panel có drop feedback.
- Có nút “Tự sắp xếp” nếu trẻ làm rối.
- Text tối đa 80 ký tự.
- Có preview full-screen.

## Fallback

Nếu canvas library không ổn định, implement bằng absolutely-positioned DOM trong panel. Không được bỏ editor.

---

# 15. Video Studio

## Mục tiêu

Chuyển 4 comic panel thành video 30–45 giây.

## Thành phần

- Video preview.
- Scene cards.
- Duration.
- Motion preset.
- Narration.
- Voice picker.
- Subtitle toggle mặc định bật.
- Music picker an toàn.
- Render button.

## Mock render

- Delay 2–4 giây.
- Progress:
  - Chuẩn bị cảnh.
  - Ghép giọng kể.
  - Thêm phụ đề.
  - Hoàn thành.
- Output là preview player hoặc simulated MP4 card.
- Không cần render video thật.

## Voice

- Chỉ dùng voice giả lập.
- Không clone voice.
- Nút play có label.
- Không autoplay.

---

# 16. World Map

Tạo 8 node theo đường đi.

Mỗi node:

- Icon.
- Tên.
- Trạng thái.
- Reward preview.
- Progress.

Map phải:

- Responsive.
- Không quá rối.
- Node hiện tại rõ.
- Có product completion card.
- Có mascot hint.
- Có animation nhẹ.

---

# 17. Backpack và Portfolio

## Backpack

Tabs:

- Nhân vật.
- Bối cảnh.
- Truyện.
- Video.
- Huy hiệu.

## Portfolio

Hiển thị:

- Cover.
- Comic.
- Video.
- Skills.
- Reflection.
- AI-assisted label.
- Privacy.
- Parent approval.

Tạo share request:

- Private mặc định.
- Chọn “Gia đình” hoặc “Lớp học riêng tư”.
- Không có public web option trong prototype.

---

# 18. Parent Dashboard

## Overview

- Project in progress.
- Skills.
- Latest creations.
- Pending approvals.
- Safety summary.
- Privacy status.

## Approval detail

- Preview.
- AI label.
- Share destination.
- Approve.
- Request changes.

Request changes dùng câu mẫu:

- “Con hãy kiểm tra lại phần chữ.”
- “Con hãy đổi tên nhân vật để không dùng tên thật.”
- “Sản phẩm rất sáng tạo, hãy thêm lời kết nhé.”

Không có comment tự do trong prototype hoặc giới hạn cho người lớn.

## Privacy

- Gallery class toggle.
- Free text toggle.
- Audio narration toggle.
- Download data.
- Delete profile.
- Explanatory text.

---

# 19. Teacher Dashboard

- Class overview.
- Student progress.
- Skill heatmap.
- Project gallery.
- Pending reviews.
- Student detail.
- Review sticker.
- Filter.

Không leaderboard.

Mock students:

- Mây.
- Bắp.
- Sóc.
- Nắng.
- Bo.

Dùng nickname, không họ tên thật.

---

# 20. Accessibility

Bắt buộc:

- `<main>`, `<nav>`, `<header>`.
- Skip link.
- Focus visible.
- Keyboard.
- `aria-live` cho generation/render.
- Modal focus trap.
- Escape.
- Labels.
- Alt.
- Reduced motion.
- Contrast.
- Touch target chính ≥ 44 px.
- Không color-only.
- Không hover-only.
- Alternative cho drag/drop.
- Video subtitle.
- Audio transcript.

Tạo `useReducedMotion` hoặc CSS media query.

---

# 21. Motion

Dùng Framer Motion vừa phải:

- Page enter 180 ms.
- Card selection 150 ms.
- Quest complete 700 ms.
- Drag feedback.
- Progress.

Không:

- Parallax mạnh.
- Infinite bounce.
- Flash.
- Auto-scrolling.
- Motion gây mất tập trung.

---

# 22. Error, loading, empty states

Tạo component reusable.

## Network error

> “Kết nối đang trốn đâu đó. Sản phẩm của con vẫn an toàn.”

## Generation error

> “Xưởng vẽ chưa hoàn thành bức tranh. Thử lại hoặc dùng hình mẫu nhé!”

## Empty backpack

> “Ba lô đang chờ sản phẩm đầu tiên.”

## Loading

Mascot + stage descriptions.

## Safety redirect

> “Mình không dùng thông tin thật trong câu chuyện nhé. Hãy chọn một nơi tưởng tượng!”

---

# 23. Responsive behavior

## Desktop ≥ 1200

- Sidebar.
- Main.
- Helper panel.

## Tablet 768–1199

- Bottom nav.
- Helper drawer.
- Editor full width.

## Mobile < 768

- World/quest/portfolio hoạt động.
- Editor hiển thị simplified mode hoặc lời khuyên dùng tablet.
- Không để layout vỡ.

Kiểm tra ít nhất:

- 1440 × 900.
- 1024 × 768.
- 820 × 1180.
- 390 × 844.

---

# 24. Performance

- Lazy load route.
- Optimize SVG/image.
- Không bundle asset cực lớn.
- Avoid rerender editor.
- Memoize.
- Không animation layout nặng.
- Skeleton hợp lý.
- Target Lighthouse:
  - Performance ≥ 80 trong demo.
  - Accessibility ≥ 90.
  - Best Practices ≥ 90.

Không cần tối ưu giả tạo nếu làm hỏng UX.

---

# 25. Testing

## Unit

- Prompt assembly.
- PII validation.
- Quest progression.
- Parent approval.
- Undo reducer.

## Component

- Choice card keyboard.
- Prompt chip.
- Modal.
- Drag alternative.
- Loading state.
- Error state.

## E2E hoặc smoke

Ít nhất tạo test hoặc script kiểm tra:

1. Welcome → World.
2. Prompt → Generate.
3. Compare → Comic.
4. Comic → Video.
5. Portfolio → Parent Approval.

Nếu không có Playwright, viết manual test checklist trong README.

---

# 26. README bắt buộc

README phải có:

- Product summary.
- Screenshot section placeholders hoặc hướng dẫn chụp.
- Tech stack.
- Setup.
- Scripts.
- Demo credentials/role switch.
- Route list.
- Architecture.
- Safety decisions.
- Accessibility.
- Mock AI behavior.
- Known limitations.
- Future integration.
- Source references.
- License notes.

---

# 27. Source references

Trong README, ghi rõ đã tham khảo pattern từ:

- Nielsen Norman Group child UX.
- WCAG 2.2.
- UNICEF AI and Children.
- UNESCO GenAI in Education.
- ICO Children’s Code.
- Scratch Foundation.
- Code.org.
- Machine Learning for Kids.
- Sugarizer.
- Kolibri.
- Konva.
- Storyboarder.
- Remotion.

Không tuyên bố các tổ chức này chứng nhận sản phẩm.

---

# 28. Self-review checklist trước khi kết thúc

Không kết thúc cho đến khi kiểm tra:

## Product

- [ ] Có full demo flow.
- [ ] Mọi CTA chính hoạt động.
- [ ] Không route trống.
- [ ] Có portfolio và adult approval.

## Child UX

- [ ] Ít chữ.
- [ ] Một CTA chính.
- [ ] Nút lớn.
- [ ] Hướng dẫn cụ thể.
- [ ] Không dark pattern.
- [ ] Không shame.

## Safety

- [ ] Không nội dung nguy hiểm.
- [ ] Không PII.
- [ ] Không người thật.
- [ ] Không open chat.
- [ ] Private default.
- [ ] Parent approval.
- [ ] AI-assisted label.

## Accessibility

- [ ] Keyboard.
- [ ] Focus.
- [ ] Labels.
- [ ] Alt.
- [ ] Reduced motion.
- [ ] Contrast.
- [ ] Drag alternative.

## Technical

- [ ] Install thành công.
- [ ] Lint.
- [ ] Typecheck.
- [ ] Test.
- [ ] Build.
- [ ] Không console error nghiêm trọng.
- [ ] Không API key.
- [ ] Reset demo.

## Visual

- [ ] Style nhất quán.
- [ ] Không broken image.
- [ ] Không overflow.
- [ ] Tablet đẹp.
- [ ] Không copy IP.

---

# 29. Cách báo cáo kết quả

Sau khi hoàn thành, trả về:

1. Tóm tắt những gì đã xây.
2. Danh sách route.
3. Lệnh chạy.
4. Kết quả lint/typecheck/test/build.
5. Những quyết định UX an toàn quan trọng.
6. Known limitations thực tế.
7. Không tuyên bố “hoàn hảo tuyệt đối” nếu chưa kiểm chứng.
8. Không yêu cầu người dùng tự hoàn thiện phần cốt lõi còn thiếu.

---

# 30. Lệnh bắt đầu dành cho agent

Hãy thực hiện ngay:

> Đọc toàn bộ `AI_Kids_Creator_Academy_Prototype_Spec.md`, audit repository hiện tại, sau đó xây dựng hoặc hoàn thiện prototype `AI Kids Creator Academy` theo toàn bộ yêu cầu trong tài liệu này. Không dừng ở kế hoạch. Hãy tạo code, dữ liệu mẫu, design system, route, interaction, drag-and-drop, mock AI generation, comic editor, video studio, parent dashboard, teacher dashboard, accessibility và safety guardrails. Chạy lint, typecheck, test và build; tự sửa lỗi trước khi kết thúc. Prototype phải chạy không cần API key và sẵn sàng demo trước khách hàng.
