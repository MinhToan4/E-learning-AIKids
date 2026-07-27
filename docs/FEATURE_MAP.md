# Feature map — AI Kids Creator Academy

Internal inventory of **done** vs **in progress**, mapped to research sources (AIkid designer, StoryMee MCP-Core patterns, 36-week curriculum).

## Done (shipped in this monorepo)

| Area | Capability | Where |
|------|------------|--------|
| Auth | Student nickname+avatar; adult email+bcrypt; Google OIDC; Firebase SSO; httpOnly session | `apps/api` auth module |
| RBAC | Roles: admin, teacher, parent, student; domain `can()` matrix + settings | `packages/domain` + API guards |
| Catalog | **L1 8–9 + L2 10–11** K1–K6 courses seeded (stations JSON) | `prisma/seed/courses/curriculum.ts` |
| Learning | Quest map, stations video→game→practice→check, ideate/produce | progress + domain stations |
| **Learning advanced (Phase 2 L1)** | Note/bookmark, search nội dung, resume, offline manifest + sync queue idempotent | `learning.routes` + service worker |
| **Lộ trình L2 (Phase 2)** | Course prerequisite + version, lý do khóa, override audit, đề xuất khóa tiếp | `learning.routes` pathway + overrides |
| Lecture playback | YouTube watch URLs → privacy-enhanced embed; HTTPS media → native player | `LectureVideo` + curriculum preview URL |
| Practice review | Preview sản phẩm riêng tư + phản hồi lưu trước khi trẻ chủ động sang check | `LessonPage` + `practice-result` |
| **Assessment engine (Phase 2 L3)** | Question bank + immutable version; 6 loại bài; assessment/version; timer; save/resume; retake; idempotent submit; 12 bài cuối khóa | `assessment` module |
| **Grading (Phase 2 L4)** | Auto-grade, rubric, grading queue, draft/publish, regrade/revision/resubmission, audit | `teacher.routes` grading |
| **Competency (Phase 2 L5)** | Framework 4 miền, domain/skill/mapping version, evidence append-only, snapshot/recompute | `competency` module |
| **Credentials/Badges (Phase 2 L6)** | Template/rule version; issue idempotent; revoke/reissue; PDF; mã kiểm tra công khai | `competency` module (credentials) |
| **Teacher console (Phase 2 L7)** | Lớp được phân công, session/lesson plan, attendance, grading queue, observations | teacher module + FE `/teacher/operations` |
| **Schedule (Phase 2 L8)** | Policy version, capacity/conflict, placement requests, attendance, reschedule workflow, reminder delivery | `schedule` module |
| **Parent reports (Phase 2 L9)** | Template/policy, frozen snapshot, preview/review/approve/publish, PDF/hash, delivery worker | `report` module |
| **Age tiers (Phase 2 T4)** | Ngày sinh bắt buộc, age band tính phía server, policy DB per age, `AgeExperienceProvider` React | `learning` + `AgeExperienceProvider` |
| Gamification | Streak, achievements (unlock on quest/project), leaderboard, notifications | gamification + achievement.service |
| Vidtory AI | Server adapter + admin key; model %; Soft Clay; mock fallback | `vidtory.adapter` + Admin AI tab |
| Media upload | `POST /api/media/upload` → Vidtory media + `aikids_user_id` metadata; Asset per student | `media.routes` + `vidtory.media` |
| Multi-ref gen | 0/1/N → refImageUrl / startImages; video t2v/i2v situational | domain `media-refs` + progress practice |
| Storage SoT | **Temporary: Vidtory CDN URL in DB** (`storageBackend: vidtory_cdn`) — private re-host later | see `docs/VIDTORY_MEDIA_OWNERSHIP_AND_STORAGE.md` |
| AIkid creative core | Character traits, art-style pick, comic, journal/palette/ai_pick | domain + LessonPage |
| Designer Soft Clay | Lobby/hub/styles catalog; home age-band browse | `assets.ts` + HomePage |
| Portfolio | Private-by-default projects + parent approval | portfolio + parent modules |
| Teacher CMS | Class create/roster, courses CRUD, lecture edit/reorder/**soft-archive**, class stats, student progress | teacher module + FE |
| Admin CMS | Users + soft-delete, analytics, sessions revoke, course CRUD, **Vidtory key (never raw)** | admin module + FE |
| Parent CMS | Children list, progress, share approvals, course enroll/unenroll for child | parent module + FE |
| Family model | Parent-owned kids, household Free/Plus/Family, PIN, enter-as-child, enroll gate | `family.ts` + Plan/Subscription + parent FE |
| Firebase SSO seams | `storymee-compat.ts`; custom token; firebase config endpoint | `shared/seams` + auth module |
| Safety | Nickname + free-text PII filter | domain safety |
| Ops | Docker compose + Redis, env-only secrets | `docker-compose.yml` |
| Packages | `@aikids/domain` (RBAC, logic, curriculum); `@aikids/vidtory-ai-sdk` (AI SDK types) | `packages/domain`, `packages/vidtory-ai-sdk` |
| Agent skills | UI (Hallmark / UI-UX Pro Max), RBAC, domain, eng workflow | `.agents/skills/` |

## In progress / recommended next

| Area | Notes |
|------|--------|
| 146 video bài giảng thật | URL YouTube mẫu hiện phát được; phải thay trước khi phát hành nội dung khóa học |
| CDN + object storage | Video URLs là columns; host files trên S3/R2 + CDN |
| Phase 2 UAT — dữ liệu khách hàng | 4 miền năng lực, policy tuổi, rubric, template báo cáo/chứng nhận cần khách hàng duyệt |
| Email/push/Zalo provider production | SMTP/FCM/Zalo OA credentials chưa kết nối live |
| StoryMee live SSO | Seams sẵn sàng (`storymee-compat`); chờ cookie domain agreement |
| Private object storage re-host | Tạm thời Vidtory CDN; S3/R2 sau |
| Full Mee SVG compose | 1.3k SVG layers — CDN sau, không thuộc course runtime |
| Rich station visual builder UI | Soft-archive + reorder shipped; builder kéo-thả deferred |
| Expo mobile parity | Reference `Documents/AIkid/AIkidApp`; không thuộc mục tiêu này |

## Role matrix (product)

| Role | Responsibilities |
|------|------------------|
| **admin** | Accounts, system health, course CRUD, analytics, sessions revoke, Vidtory AI key, competency framework, credential config, report config, schedule config |
| **teacher** | Own class + roster, lecture CMS (title, content JSON, videoUrl), soft-archive/reorder, session/lesson plan, attendance, grading queue, observations → competency evidence, student progress |
| **parent** | Linked children only, progress view, share approve/reject, course enroll/unenroll for child, schedule/report/credential view |
| **student** | Enroll, progress, assessment attempts, offline learning, portfolio request-share, achievements, notifications (no admin/teacher CMS) |
| **content_editor** *(optional future)* | Catalog-only writes without full admin — not enabled; admin covers content ops for v1 |

## Reference systems (read-only)

- **AIkid** (`Documents/AIkid`): designer assets, Expo kids lobby patterns  
- **StoryMee 2-MCP-Core**: Fastify modules, env, Docker, account/session separation  
- **Curriculum**: `AI_Education_Research_and_36_Week_Curriculum_Ages_8-11.md`
