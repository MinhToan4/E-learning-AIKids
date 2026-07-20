# Shared vs unique BE seams (MCP-Core · AIkid · E-learning)

## Shared-by-pattern (keep aligned, do not re-fork)

| Pattern | StoryMee `2-MCP-Core` | This monorepo |
|---------|----------------------|---------------|
| Modular Fastify feature folders | `core-*-api/src/modules` | `apps/api/src/modules/*` |
| Env-driven secrets / CORS / cookies | dotenv + compose | `config/env.ts`, `.env.example` |
| Account session boundary | `core-account-api` | `auth` + httpOnly `Session` |
| Vertical HTTP modules | account / media / job | catalog, progress, parent, teacher, admin |
| Docker Postgres path | infra compose | `docker-compose.yml` |

**Use in common:** session model ideas, module layout, env hygiene, rate-limit/helmet posture.  
**Do not** re-host every MCP microservice inside this repo.

## Unique to e-learning (local, own modules)

| Capability | Why local |
|------------|-----------|
| Curriculum courses / quests / `videoUrl` lectures | Edtech CMS, not MCP media jobs |
| Quest unlock learn→practice→check | Domain progress rules |
| Parent share approvals + private portfolio | Kids safety product |
| Teacher class roster + lecture CMS | School CMS |
| Admin accounts soft-disable | Ops for academy |

## From AIkid xưởng sáng tạo (core into **courses**, not full Expo port)

| AIkid core | Taken into course path | Not taken (this goal) |
|------------|------------------------|------------------------|
| Lobby hub cards (character / art / comic) | Home hub + course covers via designer pack | Full Expo lobby router |
| **Character** builder | Quest `practiceKind: character` + trait chips | Full Mee 1.3k SVG composer |
| **Art style** picker | Quest `practiceKind: style` + designer style cards | Freehand canvas + Gateway STYLE templates |
| **Comic** 4-panel | Quest `practiceKind: comic` + portfolio project | Full comic editor HTML |
| Soft Clay designer assets | `apps/web/public/assets/designer/**` | Plastic neon AI chrome |

## Deferred / out of band

- Live Gateway job AI (`core-job-api` templates)
- Full Mee pack CDN compose
- StoryMee multi-service rewrite
- Native AIkidApp store parity
