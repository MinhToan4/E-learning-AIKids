# 📚 AIKids Creator Academy — Tổng Quan Nội Dung Khóa Học

> **Phiên bản:** 2.0 (July 2026)  
> **Lấy cảm hứng từ:** Little Thinkers AI + Little AI Master  
> **Triết lý:** "Bé cầm lái, AI hỗ trợ"

---

## 📋 DANH MỤC TÀI LIỆU

### Tài liệu Thiết Kế Khóa Học (Markdown Nguồn)
| File | Khóa học | Tuổi | Buổi | Bài |
|------|---------|------|------|-----|
| `L1 6-8/L1_K1_Vẽ_Thế_Giới_Tưởng_Tượng.md` | Vẽ Thế Giới | 6-8 | 4 | 8 |
| `L1 6-8/L1_K2_Thiết_Kế_Nhân_Vật.md` | Nhân Vật | 6-8 | 4 | 8 |
| `L1 6-8/L1_K3_Kể_Chuyện.md` | Kể Chuyện | 6-8 | 4 | 8 |
| `L1 6-8/L1_K4_Truyện_Tranh.md` | Truyện Tranh | 6-8 | 4 | 8 |
| `L1 6-8/L1_K5_Đạo_Diễn_Chuyển_Động.md` | Chuyển Động | 6-8 | 4 | 8 |
| `L1 6-8/L1_K6_Phim_Ngắn_Đầu_Tay.md` | Phim Ngắn | 6-8 | 4 | 8-10 |
| `L2 9-11/L2_K1_Vẽ_Thế_Giới_Tưởng_Tượng.md` | World Bible | 9-11 | 8 | 16 |
| `L2 9-11/L2_K2_Thiết_Kế_Nhân_Vật.md` | Nhân Vật L2 | 9-11 | 8 | 16 |
| `L2 9-11/L2_K3_Kể_Chuyện.md` | Kể Chuyện L2 | 9-11 | 8 | 16 |
| `L2 9-11/L2_K4_Truyện_Tranh.md` | Truyện Tranh L2 | 9-11 | 8 | 16 |
| `L2 9-11/L2_K5_Đạo_Diễn_Chuyển_Động.md` | Phim L2 | 9-11 | 8 | 16 |
| `L2 9-11/L2_K6_Phim_Ngắn_Đầu_Tay.md` | Phim Ngắn L2 | 9-11 | 8 | 16 |

### Tài liệu Kịch Bản & Hướng Dẫn Chi Tiết (Content Supplements)
| File | Nội dung |
|------|---------|
| `content-supplements/L1_K1_lesson-content-full.md` | Kịch bản video + game + template đầy đủ K1 |
| `content-supplements/L1_K2_lesson-content-full.md` | Kịch bản video + game + template đầy đủ K2 |
| `content-supplements/L1_K3_lesson-content-full.md` | Kịch bản video + game + template đầy đủ K3 |
| `content-supplements/L1_K4-K5-K6_lesson-content-full.md` | Kịch bản + game K4, K5, K6 gộp |
| `content-supplements/L2_K1-K6_lesson-content-full.md` | Kịch bản + game toàn bộ L2 |

### Khóa Học AI Literacy (Seed TypeScript)
| File | Khóa học | Tuổi | Bài |
|------|---------|------|-----|
| `apps/api/prisma/seed/courses/ai-literacy-l1.ts` | AI Bạn Của Em | 6-8 | 8 |
| `apps/api/prisma/seed/courses/ai-literacy-l2.ts` | Hiểu Và Dùng AI | 9-11 | 12 |

---

## 🎓 FRAMEWORK GIÁO DỤC

### Lấy Cảm Hứng Từ

#### Little Thinkers AI (littlethinkersai.com)
- **20 phases per course** × 6 lessons = 120 bài/khóa
- **Cấu trúc bài:** Read → Play Activity → Build Project → Tick Off
- **9 AI games chuyên biệt:** Sorting Machine, Pattern Finder, Teach the Robot, Question Tree, Train & Test, Spot the Bias, Neuron Lab, Downhill, Next-Word Machine
- **Triết lý:** Parent-led, concept-first, hands-on
- **Kết quả:** Graduation quiz + printable certificate
- **Lab Notebook:** Học sinh ghi chép như nhà khoa học

#### Little AI Master (app.littleaimaster.com)
- **7 ranks:** Spark → Sprite → Frame → Core → Mind → Voice → Master
- **540+ chapters** với skill tree progression
- **AI Companion "Byte":** Hatch → Raise → Evolve với tiến trình học
- **Gamification:** XP, badges, 50+ achievements, daily streaks, 100-level progression
- **16 interactive AI tools:** Chatbot Builder, Sentiment Analyzer, Bias Detective
- **Daily Flow:** Train → Play → Quiz → Streak

### AIKids Adaptation

```
FLOW BÀI HỌC AIKIDS (mỗi bài 18-20 phút):
┌─────────────────────────────────────────────┐
│  🎬 VIDEO (3-4 phút)                         │
│  Khái niệm + Demo + Gợi ý thực hành         │
├─────────────────────────────────────────────┤
│  🎮 GAME (5 phút)                            │
│  Tương tác: match/order/combine/detective    │
├─────────────────────────────────────────────┤
│  ✏️ THỰC HÀNH (8-10 phút)                    │
│  Bé quyết định TRƯỚC, AI hỗ trợ SAU         │
├─────────────────────────────────────────────┤
│  ✅ KIỂM TRA NHANH (2 phút)                  │
│  Flashcard hoặc tự phản hồi                 │
└─────────────────────────────────────────────┘
```

---

## 📊 AI CONCEPTS COVERAGE

### AI4K12 Five Big Ideas Mapping

| Big Idea | L1 K1-K6 (Sáng tạo) | L2 K1-K6 (Sáng tạo) | AI Literacy L1 | AI Literacy L2 |
|---------|---------------------|---------------------|----------------|----------------|
| 1. Perception | Prompt → AI nhận biết ✓ | Prompt nâng cao ✓ | Phân loại, mẫu ✓✓ | Supervised learning ✓✓ |
| 2. Representation | Mô tả → hình ảnh ✓ | World bible → visual ✓ | Dữ liệu = ví dụ ✓✓ | Data types, features ✓✓ |
| 3. Learning | AI học từ prompt ✓ | Iteration, feedback ✓ | Training từ ví dụ ✓✓ | ML types, neural nets ✓✓ |
| 4. Natural Interaction | Prompt engineering ✓ | Advanced prompting ✓ | AI sai → kiểm tra ✓✓ | Prompt engineering ✓✓ |
| 5. Societal Impact | An toàn cơ bản ✓ | Đạo đức cơ bản ✓ | Fairness, bias ✓✓ | Ethics framework ✓✓ |

---

## 🎮 GAME TYPES INVENTORY

Tất cả game types được implement trong hệ thống:

| Game Type | Mô tả | Ví dụ sử dụng |
|-----------|-------|--------------|
| `match` | Kéo nối cặp đôi | Màu → cảm xúc; AI app → lĩnh vực |
| `order` | Sắp xếp thứ tự | Bộ 3 nhịp câu chuyện; bước kịch bản |
| `combine` | Ghép từ nhiều nhóm | Nhân vật + tính cách; vùng đất + đặc điểm |
| `compare` | So sánh 2 phương án | Mô tả tốt/mờ; phiên bản AI đúng/sai |
| `detective` | Tìm lỗi / phân tích | Bắt lỗi AI; tìm thiên lệch |
| `place` | Kéo thả vào đúng vị trí | Thành phần bản đồ; lời thoại vào ô |
| `pick` | Chọn một đáp án | Quiz cuối bài; nhận biết đúng/sai |

---

## 📅 TIMELINE SẢN XUẤT ĐỀ XUẤT

### Phase 1 (Ưu tiên cao nhất): Seed & Backend
- [x] 12 course blueprints (Markdown) ✅ Hoàn thành
- [x] Generator script (curriculum-content.ts) ✅ Hoàn thành
- [x] AI Literacy L1 + L2 (TypeScript) ✅ Hoàn thành tháng 7/2026

### Phase 2 (Sản phẩm video):
- [ ] 48 video scripts L1 (8 bài × 6 khóa) — Dùng content-supplements
- [ ] 96 video scripts L2 (16 bài × 6 khóa)
- [ ] 20 video scripts AI Literacy L1+L2

### Phase 3 (Game implementation):
- [ ] Implement 7 game types trong frontend
- [ ] Reviewed game packs đã sẵn sàng trong generator ✅

### Phase 4 (AI tools):
- [ ] Prompt tool (nhập mô tả → AI tạo hình)
- [ ] Detective tool (so sánh 2 kết quả AI)
- [ ] Journal tool (ghi chép + lưu)

---

## 🔧 LỆNH VẬN HÀNH

### Chạy seed lên DB:
```bash
cd apps/api
SEED_OVERWRITE_CONTENT=true npx tsx prisma/seed.ts
```

### Kiểm tra nội dung đã seed:
```bash
# Đếm quests
npx prisma studio  # Xem Quest table

# Hoặc query trực tiếp
npx tsx -e "
const {PrismaClient} = await import('./src/generated/prisma/index.js');
const p = new PrismaClient();
const c = await p.course.count();
const q = await p.quest.count();
console.log('Courses:', c, 'Quests:', q);
await p.\$disconnect();
"
```

### Tái tạo curriculum-content.ts:
```bash
node apps/api/prisma/scripts/generate-curriculum-content.mjs
```

---

## 📝 CHANGELOG

### v2.0 (July 2026)
- **THÊM MỚI:** AI Literacy L1 "AI Bạn Của Em" — 8 quests, ages 6-8
  - Concept-first approach từ Little Thinkers AI
  - 8 AI games: Sorting Machine, Pattern Finder, Spot the Bias, AI Hunt
- **THÊM MỚI:** AI Literacy L2 "Hiểu Và Dùng AI" — 12 quests, ages 9-11
  - ML pipeline, neural networks basics, ethics framework
  - Prompt engineering, GenAI risks, capstone project
  - Demo Day presentation format từ Little AI Master
- **THÊM MỚI:** Content supplements với kịch bản video đầy đủ cho tất cả 12 khóa
- **TÍCH HỢP:** seed.ts updated để include cả AI literacy courses

### v1.0 (Initial)
- 12 courses sáng tạo (L1×6 + L2×6)
- Generator script với reviewed game packs
- Triết lý "Bé cầm lái, AI hỗ trợ"
