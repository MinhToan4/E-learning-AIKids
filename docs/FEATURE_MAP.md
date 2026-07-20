# Feature map — AI Kids Creator Academy

Internal inventory of **done** vs **in progress**, mapped to research sources (AIkid designer, StoryMee MCP-Core patterns, 36-week curriculum).

## Done (shipped in this monorepo)

| Area | Capability | Where |
|------|------------|--------|
| Auth | Student nickname+avatar; adult email+bcrypt; httpOnly session | `apps/api` auth module |
| RBAC | Roles: admin, teacher, parent, student; domain `can()` matrix | `packages/domain` + API guards |
| Catalog | Courses/quests seeded in DB (not FE fixtures) | `prisma/seed` |
| Learning | Quest map, learn→practice→check, unlock rules | progress + domain |
| AIkid creative core | Character traits, **art-style** pick, comic 4-panel in course path | domain `creative` + seed `style-pick` + LessonPage |
| Designer Soft Clay | Lobby/hub/styles catalog; workshop hub on home | `assets.ts` + public/designer |
| Portfolio | Private-by-default projects + parent approval | portfolio + parent modules |
| Teacher CMS | Class roster, lecture list, create/update lecture + **videoUrl** | teacher module + FE |
| Admin CMS | List users, create accounts, system stats | admin module + FE |
| Parent CMS | Children list, progress snapshot, share approvals | parent module + FE |
| Safety | Nickname + free-text PII filter | domain safety |
| Ops | Docker compose (postgres+api+web), env-only secrets | `docker-compose.yml` |
| Agent skills | UI (Hallmark / UI-UX Pro Max), RBAC, domain, eng workflow | `.agents/skills/` |

## In progress / recommended next

| Area | Notes |
|------|--------|
| Full 36-week curriculum seed | Research doc complete; seed has 4 representative courses only |
| Live AI generation | Mock image path today; wire SpaceXAI / MCP media later |
| Redis session / rate-limit store | Single-node in-memory rate limit; Redis for multi-instance |
| CDN + object storage | Video URLs are columns; host files on S3/R2 + CDN |
| StoryMee MCP-Core merge | Documented seams only — modular Fastify mirrors core-account/session |
| Expo mobile parity | Reference `Documents/AIkid/AIkidApp`; not this goal |
| Full Mee SVG compose | 1.3k SVG layers — CDN later, not course runtime |

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
