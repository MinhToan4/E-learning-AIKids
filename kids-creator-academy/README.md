# AI Kids Creator Academy

Prototype website E-Learning AI dành cho trẻ **8–11 tuổi**: quest-based creative learning — trẻ nhận nhiệm vụ, ghép prompt an toàn, tạo truyện tranh và video kể chuyện, lưu vào Ba lô, phụ huynh duyệt chia sẻ.

> **Demo mode:** không cần API key, không gọi AI ngoài. Toàn bộ generation là mock deterministic.

## Product summary

| | |
|---|---|
| **Định vị** | Xưởng sáng tạo có hướng dẫn — không phải LMS video/trắc nghiệm, không chatbot mở |
| **Persona demo** | Học sinh “Mây”, khóa *Tạo truyện tranh AI đầu tiên* (8 quest) |
| **Sản phẩm cuối** | Truyện 4 khung + video kể chuyện 30–45s (mô phỏng) |
| **Ngôn ngữ** | Tiếng Việt |
| **An toàn** | Private mặc định, PII filter, không public web, parent approval |

## Screenshots

Chạy `npm run dev` rồi chụp:

1. Welcome  
2. World Map  
3. Prompt Builder  
4. Compare Results  
5. Comic Studio  
6. Parent Approvals  

## Tech stack

- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v4
- React Router 7
- Zustand (persist localStorage)
- @dnd-kit (kéo-thả + click-to-place)
- Framer Motion (nhẹ, tôn trọng reduced motion)
- Lucide React
- Vitest + Testing Library
- Oxlint

Comic editor dùng **DOM canvas** ổn định (không phụ thuộc React Konva) để demo không gãy build.

## Setup

Yêu cầu: **Node.js 20+**.

```bash
cd kids-creator-academy
npm install
npm run dev
```

Mở URL Vite in ra (thường `http://localhost:5173`).

### Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Xem bản build |
| `npm run typecheck` | TypeScript |
| `npm run lint` | Oxlint |
| `npm run test` | Unit tests |
| `npm run format` | Prettier |

## Demo / đăng nhập (COPPA-friendly prototype)

**Không email / mật khẩu cho trẻ.** Flow demo:

| Vai | Cách vào |
|-----|----------|
| Học sinh | `/login` → Tôi là học sinh → chọn Mây/Bắp/Sóc |
| Phụ huynh / GV | `/login` → Phụ huynh/GV → PIN demo **`2468`** |

**Nav học sinh (4 mục):** Nhà · Làm tiếp · Ba lô · Tôi  
Xưởng prompt/comic/video đi theo nhiệm vụ (không nhồi 5 tab).

**Reset demo:** Hồ sơ hoặc sidebar adult.  
**Demo lỗi AI:** Hồ sơ → bật “Demo lỗi AI”.

## Route list

```
/welcome
/login
/onboarding
/world
/quest/character
/quest/character/learn
/quest/:questId
/studio/prompt
/studio/compare
/studio/comic
/studio/video
/backpack
/portfolio/star-cat
/profile
/parent/overview
/parent/approvals
/parent/privacy
/teacher/overview
/teacher/students
/teacher/projects
```

## Architecture

```text
src/
├── app/router.tsx          # Routes + lazy load
├── components/             # UI, navigation, feedback
├── data/mock/              # Seed quests, chips, students
├── features/               # (reserved for growth)
├── hooks/
├── lib/                    # prompt, safety, generate, svg scenes
├── pages/                  # Route screens
├── store/demo-store.ts     # Zustand + localStorage
├── styles/index.css        # Design tokens (Tailwind v4 @theme)
└── types/
```

Design system: `design-system/MASTER.md` (Clay / Soft UI cho edtech trẻ em).  
UI intelligence skill: repo root `.claude/skills/ui-ux-pro-max` (từ [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)).

## Demo flow (5–8 phút)

1. Welcome → **Login** (học sinh Mây)  
2. World → nút **Làm tiếp** / Bắt đầu ngay  
3. Tạo bạn đồng hành → Ghép thẻ → 3 phiên bản  
4. Thám tử AI (3 mặt trăng) → Comic → Video  
5. Portfolio → gửi gia đình → Parent PIN `2468` → Duyệt  

### Khóa học 8–11 (AI literacy scaffolded)

1. Chào AI bạn tốt  
2. Tạo bạn đồng hành  
3. Chọn nơi phiêu lưu  
4. Có chuyện gì xảy ra?  
5. Nói cho AI hiểu  
6. Thám tử kiểm tra AI  
7. Làm truyện 4 khung  
8. Kể thành video  

Tham chiếu pattern: NN/g children UX, UNESCO GenAI education, Common Sense AI literacy, COPPA (no child email).

## Safety decisions

- Không chatbot mở, không chat học sinh, không public mặc định  
- Không upload khuôn mặt, không clone giọng  
- Free text ≤ 80 ký tự + mock PII/safety filter  
- Chỉ nhân vật tưởng tượng; chặn pattern người nổi tiếng / bạo lực  
- Share chỉ **Gia đình** hoặc **Lớp học riêng tư**  
- AI-assisted label trên portfolio  
- Parent privacy toggles + xóa/export demo  

## Accessibility

- Skip link, landmarks, focus visible  
- Touch target chính ≥ 44–48px  
- Drag/drop có **click-to-place**  
- `aria-live` cho generation/render  
- Modal focus trap + Escape  
- `prefers-reduced-motion`  
- Phụ đề video mặc định bật + transcript text  

## Mock AI behavior

- `generateImages`: delay ~2s, 3 stages, 3 SVG results deterministic  
- Result B có `oddDetail` (ba mặt trăng) để dạy AI Detective  
- `mockRenderVideo`: 4 stages, không xuất file MP4 thật  
- Không network AI; SVG tự tạo trong `lib/svg-scenes.ts`  

## Known limitations

- Video/audio chỉ mô phỏng (không render MP4 / TTS thật)  
- Comic editor DOM (không multi-page phức tạp)  
- Quest 3–6 dạng scaffold đầy đủ nội dung nhưng chưa editor riêng từng quest  
- Teacher heatmap / skill mastery là mock  
- Production auth, moderation, COPPA legal review chưa có  

## Future integration

- Image gen provider (có moderation pipeline)  
- FPT.AI TTS tiếng Việt (không clone giọng trẻ)  
- NestJS backend theo spec §16  
- Authoring studio cho giáo viên  

## Source references (patterns only — không chứng nhận)

- Nielsen Norman Group — Children’s UX  
- WCAG 2.2  
- UNICEF AI and Children  
- UNESCO GenAI in Education  
- ICO Children’s Code / FTC COPPA  
- Scratch Foundation, Code.org, ML for Kids, Sugarizer, Kolibri (UX patterns)  
- Konva / Storyboarder / Remotion (tham khảo creative tools)  
- [UI UX Pro Max skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)  

Không sao chép IP: Scratch Cat, Disney/Pixar, Pokémon, Duolingo, v.v.

## License notes

Prototype nội bộ demo. Font Google (Nunito Sans, Fredoka) theo license Google Fonts.  
Skill ui-ux-pro-max: MIT (upstream). Asset minh họa SVG do dự án tự tạo.

## Manual test checklist

- [ ] Welcome → Onboarding → World  
- [ ] Prompt → Generate → Compare → Comic  
- [ ] Comic → Video → Portfolio → Parent approve  
- [ ] Nhập SĐT / email ở free text → bị chặn  
- [ ] Tab keyboard trên ChoiceCard / Prompt  
- [ ] Resize 1440 / 1024 / 820 / 390  
- [ ] Reset demo  
