# Nguồn nghiên cứu — AI Kids Creator Academy

Tài liệu này liệt kê **nguồn có chọn lọc** (không “tham khảo linh tinh”) dùng để thiết kế:

1. Bản đồ / game path cho khóa học  
2. Cấu trúc bài học: **Lý thuyết/Video → Thực hành → Trắc nghiệm**  
3. UX học trực tuyến cho trẻ em  

---

## A. Nền tảng học online cho trẻ em (product reference)

| Nền tảng | Độ tuổi / lĩnh vực | Pattern lấy vào dự án | Link |
|---|---|---|---|
| **Duolingo / Duolingo ABC** | Ngôn ngữ; ABC cho early literacy | Path dọc, unit = bài ngắn, **dạy → luyện → check**, stars/streak nhẹ, không “fail toxic” | https://www.duolingo.com · https://www.duolingo.com/abc |
| **Khan Academy Kids** | 2–8 (mở rộng pattern 8–11) | Bài học = video/story + activity, free, no ads | https://learn.khanacademy.org/khan-academy-kids/ · https://www.khanacademy.org/kids |
| **Khan Academy** | K–12 | Video giải thích → bài luyện | https://www.khanacademy.org |
| **Code.org** | 5–18 coding | **Watch / Do / Check** (xem → làm → kiểm) trong Hour of Code | https://code.org · https://studio.code.org |
| **Scratch (MIT)** | 8–16 | Create-first, blocks, gallery private-by-default vibe | https://scratch.mit.edu · https://github.com/scratchfoundation/scratch-gui |
| **Prodigy Math** | Grades 1–8 | World map + academic “gates” (học gắn game) | https://www.prodigygame.com |
| **ABCmouse** | 2–8 | Mini-games theo skill path | https://www.abcmouse.com |
| **PBS Kids** | Early | Game ngắn, feedback tức thì | https://pbskids.org |
| **BrainPOP** | Elementary+ | Video ngắn + quiz | https://www.brainpop.com |
| **IXL** | K–12 | Skill practice + mastery (không copy UI khô) | https://www.ixl.com |
| **Epic!** | Reading | Content hub kiểu catalog | https://www.getepic.com |
| **CodaKid / Create & Learn** | Coding kids | Course catalog + project product | https://codakid.com · https://www.create-learn.us |
| **Common Sense Education** | Safety/AI literacy | Privacy, age-appropriate AI | https://www.commonsense.org/education |

**Áp dụng trực tiếp vào dự án:**

- Mỗi **trạm khóa học** = 1 bài (như Duolingo skill / Code.org level).  
- Trong mỗi bài: **① Video + thẻ lý thuyết → ② Thực hành studio → ③ Quiz ngắn 2–3 câu**.  
- Bản đồ: path + sao (0–3) theo Phaser level-select / Duolingo path, **không** leaderboard độc hại.  
- Catalog khóa: Netflix-style rows (enrolled / recommended / explore).

---

## B. Game / mã nguồn open-source trên GitHub (phù hợp tham chiếu)

Chỉ các repo **liên quan edtech, kids, path/level, quiz, HTML5/React** — không list game bạo lực/adult.

### B1. Nền tảng / game học trẻ em (ưu tiên cao)

| Repo | Vì sao phù hợp | Link |
|---|---|---|
| **Antura** (vgwb) | Game literacy cho trẻ, award-winning, open Unity — pattern mini-game + lesson loop | https://github.com/vgwb/Antura |
| **Code for Life — Rapid Router** | Blockly game ages 5–11, level progression | https://github.com/codeforlife-education/rapid-router |
| **Code for Life — Portal** | Portal khóa học + game trong lớp | https://github.com/codeforlife-education/codeforlife-portal |
| **AIMMO** (Code for Life) | Multiplayer educational game, React + Django | https://github.com/codeforlife-education/aimmo |
| **Scratch GUI** | Editor creative cho trẻ, React | https://github.com/scratchfoundation/scratch-gui |
| **edukiz** | HTML/JS educational games for children | https://github.com/timmalich/edukiz |
| **science-based-games-list** | Curated list game khoa học | https://github.com/stared/science-based-games-list |

### B2. Pattern map / level select / platformer (UX game)

| Repo | Vì sao phù hợp | Link |
|---|---|---|
| **phaserlevelselect** (BdR76) | Màn chọn level grid + **stars** (0–3) — pattern sao trạm | https://github.com/BdR76/phaserlevelselect |
| **Phaser 3** (engine) | Engine HTML5 2D chuẩn công nghiệp | https://github.com/phaserjs/phaser |
| **phaser-3-tilemap-blog-posts** (mikewesthad) | Tilemap world, path, modular maps | https://github.com/mikewesthad/phaser-3-tilemap-blog-posts |
| **HTML5_Platformer** (ZeroDayArcade) | Platformer vanilla JS, level array — logic “trạm/level” | https://github.com/ZeroDayArcade/HTML5_Platformer |
| **yandeu/phaser3-typescript-platformer-example** | Platformer TS + level switch | https://github.com/yandeu/phaser3-typescript-platformer-example |
| **Tuxemon** | Open RPG-style maps (asset/world reference via Phaser tutorials) | https://github.com/Tuxemon/Tuxemon |

### B3. Topic hubs

| Hub | Link |
|---|---|
| GitHub topic `educational-game` | https://github.com/topics/educational-game |
| GitHub topic `kids-games` | https://github.com/topics/kids-games |
| Awesome JS Games | https://github.com/proyecto26/awesome-jsgames |
| leereilly/games (open source games list) | https://github.com/leereilly/games |

### B4. Không dùng làm “copy code mù”

- Game bạo lực / multiplayer competitive adult  
- Clone Mario thương hiệu (copyright) — chỉ lấy **pattern** path + stations + accept challenge  
- Không nhúng full engine Phaser vào demo này (tránh bloat); UI path dùng React + design tokens clay/kids

---

## C. Cấu trúc bài học chuẩn (map sang code)

```
/lesson/:questId
  phase theory   → Video hướng dẫn (mock player + phụ đề) + thẻ khái niệm
  phase practice → Mở studio / mini practice (create-first)
  phase quiz     → 2–3 câu trắc nghiệm, feedback ngay
  complete       → Sao 1–3 + mở trạm kế trên adventure map
```

Tham chiếu cấu trúc:

- Code.org: Watch → Do → Check  
- Duolingo: Skill steps + end-of-lesson check  
- BrainPOP / Khan: Video then quiz  
- Prodigy: World node unlock after academic success  

---

## D. Ghi chú bản quyền

- Tham khảo **ý tưởng UX / kiến trúc bài học**, không copy asset thương hiệu (Mario, Duolingo mascot, v.v.).  
- Asset minh họa trong app là AI-generated / SVG nội bộ.  
- Demo không yêu cầu API key.

---

*Cập nhật: 2026-07-18 — phục vụ Kids Creator Academy prototype.*
