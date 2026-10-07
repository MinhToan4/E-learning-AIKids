# AI Kids engineering contract

These rules apply to every agent and every change in this repository.

## Sources of truth

- StoryMee Hub and its owning core service are authoritative for identity,
  family ownership, enrollment, entitlements, payment, lesson completion,
  stars, XP, achievements, inventory, certificates and portfolio assets.
- Browser storage is allowed only for UI preferences and recoverable drafts or
  an explicitly owned offline mutation queue. It must never unlock content,
  award value, establish payment state or override a server projection.
- Every learner-scoped query, mutation, cache key, draft and queued event must
  carry the authenticated learner id. Never infer ownership from the last
  profile used on a device.
- Parent billing is household/account scoped. Learner learning data is child
  scoped. Do not combine those scopes in one cache or API model.

## Required behavior

- Student PIN login is temporarily disabled. A child enters learning only from
  an authenticated parent session selecting an owned child profile. Do not add
  PIN inputs, send PIN fields, or re-enable child/PIN endpoints without an
  explicit product decision and an end-to-end security review.
- All browser HTTP uses `apps/web/src/shared/lib/api.ts` and `/api/*` Hub routes.
- Treat 401/403 and missing ownership context as closed access, not as a reason
  to fall back to local/demo data.
- On account/profile changes, clear unscoped learner drafts, API caches and
  query caches before rendering the new identity.
- Offline writes require an owner id and an idempotency key. Replay only while
  that same learner owns the authenticated session. Ownerless legacy records
  are quarantined, never guessed or auto-migrated.
- A local draft may improve resume UX, but only a confirmed server response may
  mark completion, stars, XP, achievements, inventory or entitlement as final.

## Change checklist

Before editing a learning/payment/asset flow, trace:

1. authenticated actor and resource owner;
2. Hub endpoint and owning service;
3. query/cache/storage key and its scope;
4. offline, retry and idempotency behavior;
5. 401, 403, network failure and profile-switch behavior;
6. regression tests proving two children on one browser cannot see or mutate
   each other's data.

Read `docs/DATA_OWNERSHIP_AND_OFFLINE_SYNC.md` for the full contract. Run the
web typecheck, relevant Vitest suites, build, and `git diff --check` before
handoff. Never deploy production or edit production data without explicit
authorization.

For end-to-end Hub/core/DB inspection, follow the ecosystem SSOT at
`../../infra/00-Ecosystem-Docs/03-ops/AIKIDS_END_TO_END_AUDIT_RUNBOOK.md`.

## Anti-AI-Slop & Human-Craft Icon Policy (Bắt Buộc)

- **TUYỆT ĐỐI CẤM** import hoặc render các icon/SVG mang dấu hiệu AI sáo rỗng: `Sparkles`, `Wand2`, `Bot`, `Cpu`, `CircuitBoard` trong toàn bộ UI học sinh, phụ huynh và giáo viên.
- **Quy tắc thay thế chuẩn Montessori / Hallmark Craft**:
  - Học tập / Trạm / Vào học: `Play` ▶, `Compass` 🧭, `BookOpen` 📖, `CheckCircle2`
  - Nghệ thuật / Sáng tạo: `Palette` 🎨, `Pencil` ✏️, `Folder` 📁, `Image` 🖼️
  - Thành tích / Sao: `Star` ⭐, `Award` 🏅, `Trophy` 🏆
  - Nhân vật đồng hành: Mèo AIKI (linh vật Mèo vẽ tay hoạt hình), không vẽ robot kim loại hay vi mạch công nghệ.
  - Ngôn từ: Dùng "lượt sáng tạo" hoặc "vẽ tranh", không dùng "lượt tạo ảnh AI" hay từ ngữ công nghệ khô khan với trẻ em và phụ huynh.

