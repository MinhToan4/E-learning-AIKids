# Feature map — AI Kids Creator Academy

Internal inventory of **done** vs **in progress**, mapped to research sources (AIkid designer, StoryMee MCP-Core patterns, 36-week curriculum).

## Done (shipped in this monorepo)

| Area | Capability | Where |
|------|------------|--------|
| Auth | Student nickname+avatar; adult email+bcrypt; httpOnly session | `apps/api` auth module |
| RBAC | Roles: admin, teacher, parent, student; domain `can()` matrix + settings | `packages/domain` + API guards |
| Catalog | **L1 8–9 + L2 10–11** K1–K6 courses seeded (stations JSON) | `prisma/seed/courses/curriculum.ts` |
| Learning | Quest map, stations video→game→practice→check, ideate/produce | progress + domain stations |
| Lecture playback | YouTube watch URLs → privacy-enhanced embed; HTTPS media → native player | `LectureVideo` + curriculum preview URL |
| Practice review | Preview sản phẩm riêng tư + phản hồi lưu trước khi trẻ chủ động sang check | `LessonPage` + `practice-result` |
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
| Parent CMS | Children list, progress, share approvals | parent module + FE |
| Family model | Parent-owned kids, household Free/Plus/Family, PIN, enter-as-child, enroll gate | `family.ts` + Plan/Subscription + parent FE |
| Phase 4 student FE | Streak, achievements page, notification bell, profile stats | web features |
| Phase 6 polish | Skeletons, empty/error states, PageMotion, mobile safe-area, clay badges | shared UI + pages |
| Phase 6 assets | Avatar catalog 12+, course cover hints, designer Soft Clay chrome | `assets.ts` / `avatars.ts` |
| Phase 6 StoryMee seams | Account map, cookie domain, API alias; health công khai tối giản | `shared/seams/storymee-compat` |
| Safety | Nickname + free-text PII filter | domain safety |
| Ops | Docker compose + Redis, env-only secrets | `docker-compose.yml` |
| Agent skills | UI (Hallmark / UI-UX Pro Max), RBAC, domain, eng workflow | `.agents/skills/` |

## In progress / recommended next

| Area | Notes |
|------|--------|
| Markdown-faithful every micro-activity | Skeleton K1–K6 both tracks seeded; progressive copy fill-in |
| CDN + object storage | Video URLs are columns; host files on S3/R2 + CDN |
| StoryMee MCP-Core merge | Documented seams only — modular Fastify mirrors core-account/session |
| Expo mobile parity | Reference `Documents/AIkid/AIkidApp`; not this goal |
| Full Mee SVG compose | 1.3k SVG layers — CDN later, not course runtime |
| Phase 5 station JSON builder UI | Soft-archive + reorder shipped; rich station visual builder deferred |
| Private object storage re-host | Temporary Vidtory CDN; S3/R2 later |
| StoryMee live SSO | Seams ready (`storymee-compat`); wait for gateway cookie agreement |

## Role matrix (product)

| Role | Responsibilities |
|------|------------------|
| **admin** | Accounts, system health, course overview, force role/status |
| **teacher** | Own classes, roster, create/edit lectures (title, content JSON fields, **videoUrl**) |
| **parent** | Linked children only, progress view, share approve/reject |
| **student** | Enroll, progress, portfolio request-share (no admin/teacher CMS) |
| **content_editor** *(optional future)* | Catalog-only writes without full admin — not enabled; admin covers content ops for v1 |

## Reference systems (read-only)

- **AIkid** (`Documents/AIkid`): designer assets, Expo kids lobby patterns  
- **StoryMee 2-MCP-Core**: Fastify modules, env, Docker, account/session separation  
- **Curriculum**: `AI_Education_Research_and_36_Week_Curriculum_Ages_8-11.md`
