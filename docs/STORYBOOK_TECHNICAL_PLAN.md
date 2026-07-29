# STORYBOOK OF LEGENDS — Technical Implementation Plan
> Tài Liệu Kỹ Thuật · Version 1.0 · 27/07/2026

> **Implementation note · 29/07/2026:** `apps/api` đã được retire và không còn
> thuộc build/deploy path. Phase đầu được triển khai trong domain + web, đọc tiến
> trình từ StoryMee Hub qua gateway hiện hữu. Các model/endpoint Prisma bên dưới
> là contract đề xuất cho backend Hub, không được migrate vào `apps/api`.

---

## I. TỔNG QUAN KIẾN TRÚC

### As-Is (Hiện tại)

| File | Vai trò | Trạng thái |
|------|---------|------------|
| `apps/api/modules/gamification/achievement.service.ts` | Rule-based, flat list, 8 types | Giữ nguyên |
| `apps/web/features/achievements/AchievementsPage.tsx` | Simple badge list | Giữ nguyên |
| `packages/domain/src/achievements.ts` | 8 cứng types | Thêm LEGACY_MAP |
| `0-Shared-Libs/prisma-client/schema.prisma` | Achievement model cơ bản | Thêm models mới |

### To-Be (Mới) — Thêm vào không breaking

**Prisma models mới:**
- `BookPage`, `BookSticker`, `StickerEarn`, `PageUnlock`
- `SocialReaction`, `PacoPickQuota`
- `WorkShare`, `WorkChallenge`, `WorkRemix`
- `WeeklyPrompt`, `WeeklyPromptSubmission`

**Domain layer mới:**
- `sticker-rules.ts` — Trigger DSL, pure evaluation
- `social-rules.ts` — PacoPick quota, reaction scoring
- `achievements.ts` — thêm `LEGACY_TO_STICKER_MAP`

**API modules mới:**
- `/api/v1/storybook/*`
- `/api/v1/social/*`
- `/api/v1/leaderboard/*`
- `/api/v1/weekly-prompt/*`
- `/api/v1/ebook/*`

**Web features mới:** `apps/web/src/features/storybook/`

**AIKidApp screens mới:** `features/storybook/`

### Nguyên tắc thiết kế

1. **Backward compat** — Achievement cũ không bị phá vỡ
2. **Event-driven trigger** — Sticker unlock qua NATS events
3. **Independent pages** — Trang sách không lock nhau (trừ thứ tự khuyến nghị)
4. **Admin-first extensibility** — Thêm trang/sticker qua DB seed, không code
5. **Personalization at edge** — Video overlay inject phía client

---

## II. DATABASE SCHEMA — PRISMA

### Models mới (additive, non-breaking)

```prisma
model BookPage {
  id             String     @id @default(cuid())
  slug           String     @unique          // "P01", "event-tet-2026"
  title          String
  group          PageGroup
  sortOrder      Int
  colorPrimary   String
  colorSecondary String
  chapterArtUrl  String?
  isActive       Boolean    @default(true)
  isEvent        Boolean    @default(false)
  eventStartAt   DateTime?
  eventEndAt     DateTime?
  unlockVideoUrl String?
  unlockType     UnlockType @default(VIDEO)
  rewardBadgeKey String?
  rewardFrameKey String?
  rewardTitle    String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  stickers       BookSticker[]
  unlocks        PageUnlock[]
}

enum PageGroup { LEARNING CREATIVE SOCIAL MILESTONE EVENT }
enum UnlockType { VIDEO INTERACTIVE_STORY EBOOK PDF }

model BookSticker {
  id               String      @id @default(cuid())
  pageId           String
  slot             Int         // 1–9
  name             String
  triggerType      TriggerType
  triggerCondition String      // DSL: "quests.completed >= 1"
  icon             String
  isFoil           Boolean     @default(false)
  isAnimated       Boolean     @default(false)
  foilStyle        String?
  hint1            String?
  hint2            String?
  hint3            String?
  hint1UnlockDays  Int         @default(0)
  hint2UnlockDays  Int         @default(3)
  hint3UnlockDays  Int         @default(7)
  xpReward         Int         @default(50)
  createdAt        DateTime    @default(now())
  page             BookPage    @relation(fields: [pageId], references: [id])
  earnRecords      StickerEarn[]
  @@unique([pageId, slot])
}

enum TriggerType { COMPLETION SOCIAL HIDDEN }

model StickerEarn {
  id          String      @id @default(cuid())
  userId      String
  stickerId   String
  earnedAt    DateTime    @default(now())
  earnContext Json?
  user        User        @relation(fields: [userId], references: [id])
  sticker     BookSticker @relation(fields: [stickerId], references: [id])
  @@unique([userId, stickerId])
  @@index([userId])
}

model PageUnlock {
  id             String    @id @default(cuid())
  userId         String
  pageId         String
  unlockedAt     DateTime  @default(now())
  videoWatched   Boolean   @default(false)
  videoWatchedAt DateTime?
  user           User      @relation(fields: [userId], references: [id])
  page           BookPage  @relation(fields: [pageId], references: [id])
  @@unique([userId, pageId])
  @@index([userId])
}

model SocialReaction {
  id           String         @id @default(cuid())
  reactorId    String
  targetType   ReactionTarget
  targetId     String
  reactionType ReactionType
  createdAt    DateTime       @default(now())
  reactor      User           @relation("ReactorReactions", fields: [reactorId], references: [id])
  @@unique([reactorId, targetType, targetId, reactionType])
  @@index([targetType, targetId])
  @@index([reactorId])
  @@index([createdAt])
}

enum ReactionTarget { PROJECT STORY CHARACTER MEE }
enum ReactionType { EXCELLENT CREATIVE HOT LOVE INSIGHTFUL PACO_PICK }

model PacoPickQuota {
  id        String @id @default(cuid())
  userId    String
  weekKey   String // "2026-W30"
  usedCount Int    @default(0)
  user      User   @relation(fields: [userId], references: [id])
  @@unique([userId, weekKey])
}

model WorkShare {
  id         String         @id @default(cuid())
  sharerId   String
  targetType ReactionTarget
  targetId   String
  shareScope ShareScope
  sharedAt   DateTime       @default(now())
  linkToken  String?        @unique
  sharer     User           @relation(fields: [sharerId], references: [id])
  @@index([sharerId])
  @@index([targetType, targetId])
}

enum ShareScope { FAMILY CLASS COMMUNITY LINK }

model WorkChallenge {
  id               String          @id @default(cuid())
  challengerId     String
  challengedId     String
  prompt           String
  challengerWorkId String?
  challengedWorkId String?
  status           ChallengeStatus @default(PENDING)
  expiresAt        DateTime
  createdAt        DateTime        @default(now())
  resolvedAt       DateTime?
  challenger       User            @relation("ChallengerChallenges", fields: [challengerId], references: [id])
  challenged       User            @relation("ChallengedChallenges", fields: [challengedId], references: [id])
  @@index([challengerId])
  @@index([challengedId])
  @@index([status, expiresAt])
}

enum ChallengeStatus { PENDING ACCEPTED COMPLETED EXPIRED DECLINED }

model WorkRemix {
  id           String         @id @default(cuid())
  remixerId    String
  originalType ReactionTarget
  originalId   String
  remixType    ReactionTarget
  remixId      String
  createdAt    DateTime       @default(now())
  remixer      User           @relation(fields: [remixerId], references: [id])
  @@index([remixerId])
  @@index([originalType, originalId])
}

model WeeklyPrompt {
  id          String                    @id @default(cuid())
  weekKey     String                    @unique
  promptText  String
  promptEmoji String                    @default("🎨")
  isActive    Boolean                   @default(true)
  createdAt   DateTime                  @default(now())
  submissions WeeklyPromptSubmission[]
}

model WeeklyPromptSubmission {
  id          String       @id @default(cuid())
  promptId    String
  userId      String
  targetType  ReactionTarget
  targetId    String
  submittedAt DateTime     @default(now())
  prompt      WeeklyPrompt @relation(fields: [promptId], references: [id])
  user        User         @relation(fields: [userId], references: [id])
  @@unique([promptId, userId, targetId])
}
```

### Migration Strategy

| Bước | Hành động | Ghi chú |
|------|-----------|---------|
| 1 | `prisma migrate dev` — thêm models mới | Additive, zero downtime |
| 2 | Seed `BookPage` + `BookSticker` (8 trang × 9 slots) | Script riêng |
| 3 | Map legacy `Achievement.type` → `StickerEarn` | Migration script one-time |
| 4 | Giữ `Achievement` model deprecated | Remove sau 6 tháng |

---

## III. DOMAIN LAYER

### File mới: `packages/domain/src/sticker-rules.ts`

```typescript
export interface StickerSnapshot {
  // Learning signals
  learning: {
    quests_completed: number;
    quests_perfect: number;
    streak_days: number;
    streak_longest: number;
    xp_total: number;
    level: number;
    video_watched_count: number;
    ebook_read_count: number;
  };
  // Creative signals
  creative: {
    projects_created: number;
    stories_created: number;
    self_character_created: boolean;
    remix_count: number;
    collab_count: number;
    ebook_generated: boolean;
  };
  // Social signals
  social: {
    reactions_given: number;
    reactions_received: number;
    paco_picks: number;            // paco_picks received
    paco_picks_given: number;
    shares_done: number;
    challenges_completed: number;
    weekly_prompts_submitted: number;
    gallery_featured: boolean;
  };
  // Milestone signals
  milestone: {
    pages_completed: number;
    stickers_total: number;
    days_active_30: number;
    parent_approved_count: number;
  };
  // Storybook-specific
  storybook: {
    page_slug: string;
    stickers_on_page: number;
    video_watched: boolean;
  };
}

/**
 * Pure function — no DB, no side effects.
 * Evaluates a trigger DSL condition against a snapshot.
 *
 * DSL examples:
 *   "quests.completed >= 1"
 *   "creative.self_character_created == true"
 *   "social.paco_picks >= 3"
 *   "storybook.stickers_on_page >= 9"
 */
export function evaluateTrigger(
  condition: string,
  snap: StickerSnapshot
): boolean {
  // Implementation: parse DSL → resolve path from snap → compare
  // Namespace map: quests.* → snap.learning.*, creative.* → snap.creative.*
  // Operators: >=, <=, ==, >, <, !=
  throw new Error('Not implemented — see sticker-rules.impl.ts');
}
```

**DSL Namespace mapping:**

| DSL prefix | Snap path |
|-----------|-----------|
| `quests.*` | `snap.learning.*` |
| `creative.*` | `snap.creative.*` |
| `social.*` | `snap.social.*` |
| `milestone.*` | `snap.milestone.*` |
| `storybook.*` | `snap.storybook.*` |

---

### File mới: `packages/domain/src/social-rules.ts`

```typescript
export const PACO_PICK_WEEKLY_LIMIT = 3;

export function canUsePacoPick(usedThisWeek: number): boolean {
  return usedThisWeek < PACO_PICK_WEEKLY_LIMIT;
}

/**
 * Returns ISO week key, e.g. "2026-W30"
 */
export function getCurrentWeekKey(): string {
  const now = new Date();
  // ISO 8601 week number calculation
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export interface ReactionCounts {
  EXCELLENT: number;
  CREATIVE: number;
  HOT: number;
  LOVE: number;
  INSIGHTFUL: number;
  PACO_PICK: number;
}

const REACTION_WEIGHTS: Record<keyof ReactionCounts, number> = {
  EXCELLENT: 1,
  CREATIVE: 1,
  HOT: 1,
  LOVE: 1,
  INSIGHTFUL: 1,
  PACO_PICK: 5,
};

export function computeReactionScore(reactions: ReactionCounts): number {
  return Object.entries(reactions).reduce((total, [key, count]) => {
    return total + (REACTION_WEIGHTS[key as keyof ReactionCounts] ?? 1) * count;
  }, 0);
}
```

---

### File sửa: `packages/domain/src/achievements.ts`

Thêm vào cuối file:

```typescript
/**
 * Maps legacy Achievement.type values to new BookSticker slugs.
 * Used for one-time migration script.
 * DO NOT remove until Achievement model is fully deprecated.
 */
export const LEGACY_TO_STICKER_MAP: Record<string, string> = {
  // Format: "legacy_type" → "P{page}-S{slot}"
  'FIRST_QUEST':        'P01-S1',
  'QUEST_STREAK_7':     'P01-S4',
  'FIRST_PROJECT':      'P02-S1',
  'FIRST_STORY':        'P03-S1',
  'FIRST_CHARACTER':    'P02-S3',
  'SOCIAL_SHARE':       'P05-S1',
  'REACTION_RECEIVED':  'P05-S4',
  'LEVEL_UP':           'P04-S1',
};
```

---

## IV. API ROUTES — FASTIFY

### Module mới: `apps/api/src/modules/storybook/`

#### Storybook Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/api/v1/storybook/pages` | All pages + user progress |
| `GET` | `/api/v1/storybook/pages/:slug` | Page detail + 9 stickers |
| `GET` | `/api/v1/storybook/pages/:slug/hint/:slot` | Hint (chỉ khi S8 earned) |
| `POST` | `/api/v1/storybook/stickers/check` | Trigger check after events |
| `GET` | `/api/v1/storybook/profile` | Summary: pages, stickers, shelf |
| `PUT` | `/api/v1/storybook/shelf` | Update 5 pinned badges |
| `POST` | `/api/v1/storybook/pages/:slug/video-watched` | Mark video watched |
| `GET` | `/api/v1/storybook/video-unlock/:slug` | Overlay data cho video |

#### Social Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/v1/social/react` | React (validate PacoPick quota) |
| `DELETE` | `/api/v1/social/react` | Un-react |
| `GET` | `/api/v1/social/reactions/:targetType/:targetId` | Get reactions |
| `POST` | `/api/v1/social/share` | Share work |
| `POST` | `/api/v1/social/challenge` | Create challenge |
| `PATCH` | `/api/v1/social/challenge/:id/accept` | Accept challenge |
| `PATCH` | `/api/v1/social/challenge/:id/complete` | Complete challenge |
| `POST` | `/api/v1/social/remix` | Create remix |
| `GET` | `/api/v1/social/gallery` | Curated 3×3 (zone param) |

#### Leaderboard & Other

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/api/v1/leaderboard/:tab` | 7 tabs, period + scope params |
| `GET` | `/api/v1/weekly-prompt/current` | Current week prompt |
| `POST` | `/api/v1/weekly-prompt/submit` | Submit work to prompt |
| `POST` | `/api/v1/ebook/generate` | Start ebook job |
| `GET` | `/api/v1/ebook/status/:jobId` | Poll job status |

### Sticker Check Flow

```
Client → POST /api/v1/storybook/stickers/check
  body: { eventType: string, context: Record<string, unknown> }

→ API: buildSnapshot(userId) — query DB aggregate
→ Domain: evaluateTrigger(condition, snap) for each BookSticker
  - filter: userId NOT already in StickerEarn
→ DB: INSERT StickerEarn[] for newly earned stickers
→ DB: COUNT stickers for page → if 9/9 → INSERT PageUnlock
→ NATS: emit "sticker.earned" + "page.completed" events
→ Response: { newlyUnlocked: StickerDTO[], pageCompleted: PageDTO | null }
```

### PacoPick Validation Flow

```
POST /api/v1/social/react { targetType, targetId, reactionType: "PACO_PICK" }
→ GET PacoPickQuota WHERE userId + weekKey
→ Domain: canUsePacoPick(usedCount)
→ if false → 429 { error: "paco_pick_quota_exceeded" }
→ INSERT SocialReaction
→ UPDATE PacoPickQuota.usedCount++
→ NATS: emit "reaction.paco_pick"
```

---

## V. FRONTEND — WEB (`apps/web/src/features/storybook/`)

### Components

| Component | Mô tả | State |
|-----------|-------|-------|
| `BookShelf.tsx` | Grid danh sách BookPage cards | Server state |
| `BookSpread.tsx` | Layout đôi trang: art trái + 3×3 grid phải | Composed |
| `StickerSlot.tsx` | 1 ô sticker: earned / locked / hidden states | Props |
| `StickerReveal.tsx` | Framer Motion unlock animation | Local |
| `PageCompleteModal.tsx` | Fullscreen video player + overlay | Local |
| `HintPanel.tsx` | Hint level display + "còn N ngày" countdown | Props |
| `ProfileShelf.tsx` | 5 pinned badge slots, drag-to-reorder | Local + mutation |
| `BadgeKiosk.tsx` | Full collection modal | Server state |
| `ReactionBar.tsx` | 6 emoji reaction buttons + counts | Server state |
| `GalleryWall.tsx` | Curated 3×3 grid (NOT infinite scroll) | Server state |
| `ChallengeCard.tsx` | Challenge UI card | Props |
| `WeeklyPromptBanner.tsx` | Current week prompt banner | Server state |

### StickerSlot States

```typescript
type StickerState =
  | { status: 'earned'; sticker: StickerDTO; earnedAt: Date }
  | { status: 'locked'; hint: string | null; daysUntilNextHint: number }
  | { status: 'hidden' };  // HIDDEN type, S9
```

### StickerReveal Animation (Framer Motion)

```typescript
// y: -100 → 0, opacity: 0 → 1, scale: 0.5 → 1
// sparkle particles: stagger 0.05s each
// foil shimmer: CSS linear-gradient animation
// duration: 600ms ease-out
```

### Hooks

```typescript
// useStorybook.ts
const { pages, currentPage, progress } = useStorybook();

// useStickerCheck.ts — fire-and-forget trigger
const { checkAfterEvent } = useStickerCheck();
// useMutation → onSuccess: toast + queryClient.invalidateQueries

// useSocialReactions.ts
const { reactions, react, unreact } = useSocialReactions(targetType, targetId);

// useLeaderboard.ts
const { data, tab, setTab, period, scope } = useLeaderboard();
```

### Integration Points — `useStickerCheck` được gọi từ:

```typescript
// QuestCompleteModal
onClose={() => checkAfterEvent({ type: 'quest_complete', questId })}

// ProjectSaveSuccess
onSuccess={() => checkAfterEvent({ type: 'project_created', projectId })}

// ShareSuccessModal
onShared={() => checkAfterEvent({ type: 'work_shared', targetId })}

// ReactionSent
onReacted={() => checkAfterEvent({ type: 'reaction_given' })}
```

---

## VI. FRONTEND — AIKIDAPP (Expo / React Native)

### Screens

| Screen | Mô tả |
|--------|-------|
| `StorybookScreen` | BookPage grid, NativeWind |
| `PageDetailScreen` | 3×3 StickerGrid + progress |
| `LeaderboardScreen` | Tab bar + list |

### Components

| Component | Notes |
|-----------|-------|
| `BookPageCard` | NativeWind, press → PageDetailScreen |
| `StickerGrid` | FlatList 3-col |
| `StickerBadge` | Earned/locked/hidden states |
| `PageCompleteOverlay` | `expo-video` fullscreen |
| `ReactionPicker` | Bottom sheet (gorhom/bottom-sheet) |
| `HintDrawer` | Swipe-up gesture |

### Platform Notes

```
expo-video              → PageCompleteOverlay video player
react-native-reanimated → foil shimmer (LinearGradient + SharedValue)
FlashList               → GalleryWall, performance on 100+ items
AsyncStorage            → offline cache: pages + stickers + profile
@gorhom/bottom-sheet    → ReactionPicker, HintDrawer
```

---

## VII. VIDEO PERSONALIZATION ENGINE

### Kiến trúc

```
CDN (static)          API                    Client
┌──────────┐    ┌──────────────────┐    ┌──────────────────┐
│ base.mp4 │    │ /video-unlock/   │    │ VideoPlayer.tsx   │
│ (no text)│    │   :slug          │    │                  │
│          │ ←  │ returns JSON     │ →  │ inject overlay:  │
│          │    │ overlay data     │    │ - CSS text layer  │
└──────────┘    └──────────────────┘    │ - image composite │
                                        │ - interactive P02 │
                                        └──────────────────┘
```

### Variables Injected (Client-side)

| Variable | Nguồn | Fallback |
|----------|-------|---------|
| `{{child_name}}` | Profile.displayName | "Bạn nhỏ" |
| `{{quests_completed}}` | StickerSnapshot | "0" |
| `{{streak_longest}}` | StickerSnapshot | "0 ngày" |
| `{{projects_count}}` | StickerSnapshot | "0" |
| `{{stories_count}}` | StickerSnapshot | "0" |
| `{{stars_total}}` | XP aggregate | "0 sao" |
| `{{reactions_received}}` | Social aggregate | "0" |
| `{{project_thumbnails}}` | Array[3] CDN URLs | placeholder |
| `{{story_titles}}` | Array[3] strings | tên tổng quát |

> **Fallback principle:** Giá trị 0 → text tổng quát nhưng vẫn ấm áp, không để trống.

### Ebook Generator

```
POST /api/v1/ebook/generate
→ Fastify job: fetch user stories (max 10)
→ Render HTML via Handlebars template
→ Puppeteer → PDF (A4, print-friendly)
→ Upload to CDN → store jobId + downloadUrl
→ Response: { jobId: string }

GET /api/v1/ebook/status/:jobId
→ { status: "pending" | "processing" | "done" | "error", downloadUrl?: string }
```

---

## VIII. SOCIAL SYSTEM ARCHITECTURE

### Event Flow

```
User action
    ↓
API validates (auth, quota, schema)
    ↓
INSERT (SocialReaction / WorkShare / WorkChallenge / WorkRemix)
    ↓
NATS emit → topic: "social.*"
    ↓
StickerEngine subscriber
    ↓
buildSnapshot(userId)
    ↓
evaluateTriggers(snap)
    ↓
unlock → NATS emit "sticker.earned"
    ↓
Notification service → push + in-app
```

### Gallery Curation (Rule-based, NOT ML)

- 3×3 grid = 9 slots per zone
- **Diversity rule:** cùng 1 user không xuất hiện quá 1 lần trong 3 tuần liên tiếp
- **Freshness rule:** ưu tiên works được react trong 72h gần nhất
- **Quality rule:** reaction score > threshold (configurable per zone)
- **Admin override:** pin bất kỳ work nào vào bất kỳ slot nào

### Notification Types

```typescript
type NotificationType =
  | 'sticker_earned'
  | 'page_completed'
  | 'reaction_received'
  | 'paco_pick_received'
  | 'work_trending'
  | 'remix_created'
  | 'challenge_received'
  | 'co_create_invite'
  | 'mentor_moment'
  | 'showcase_friday_started'
  | 'weekly_prompt_new'
  | 'hint_unlocked';
```

---

## IX. LEADERBOARD ENGINE

### Pattern: Materialized View

```
LeaderboardSnapshot table
  ├── tab: LeaderboardTab
  ├── period: "weekly" | "monthly" | "alltime"
  ├── scope: "global" | "class" | "family"
  ├── rank: Int
  ├── userId: String
  ├── score: Float
  ├── delta: Int (rank change)
  └── refreshedAt: DateTime

Cron: mỗi 15 phút → recalculate + UPSERT snapshot
```

### Trending Tab — Redis

```
ZADD leaderboard:trending:{weekKey} {score} {targetId}
  → triggered on every SocialReaction INSERT
  → score = computeReactionScore(reactions)

GET /api/v1/leaderboard/trending
  → ZREVRANGE 0 49 WITHSCORES
  → join with DB for metadata
  → Response < 100ms (Redis cache)
```

### 7 Leaderboard Tabs

| Tab | Metric | Refresh |
|-----|--------|---------|
| `xp` | XP tổng | 15 phút |
| `streak` | Streak hiện tại | 15 phút |
| `creative` | Works created | 15 phút |
| `social` | Reaction score received | 15 phút |
| `challenge` | Challenges won | 15 phút |
| `trending` | Works reaction score (7 ngày) | Real-time Redis |
| `stickers` | Sticker count | 15 phút |

### Motivational Messages (Pure Domain)

```typescript
// Gap-based, no AI, deterministic
function getMotivationalMessage(myRank: number, topRank: number): string {
  const gap = myRank - topRank;
  if (gap <= 3) return "Chỉ còn 3 bước nữa là bạn dẫn đầu! 🔥";
  if (gap <= 10) return "Bạn đang bứt phá rất tốt! 💪";
  return "Mỗi quest hoàn thành là một bước tiến! ⭐";
}
```

### Performance Targets

| Endpoint | Target | Phương pháp |
|----------|--------|------------|
| `GET /storybook/pages` | < 200ms | Index on userId, cache 60s |
| `POST /stickers/check` | < 500ms | Batch query + domain eval |
| `GET /leaderboard/:tab` | < 100ms | Materialized snapshot |
| `POST /social/react` | < 300ms | Async NATS, sync DB only |
| `POST /ebook/generate` | < 60s | Background job, poll |

---

## X. PHÂN KỲ IMPLEMENTATION

### Phase 1 — Book Core (Tuần 1–6)

- [ ] Prisma migration: thêm tất cả models mới
- [ ] Seed script: 8 BookPage + 72 BookSticker
- [ ] Domain: `sticker-rules.ts` + `evaluateTrigger` DSL parser
- [ ] API: `POST /stickers/check` + `GET /pages` + `GET /pages/:slug`
- [ ] Web: `BookSpread` + `StickerSlot` + `StickerReveal` + `HintPanel`
- [ ] Web: `useStickerCheck` integration vào QuestCompleteModal
- [ ] Leaderboard: tab `xp` + `streak` (2/7)
- [ ] AIKidApp: `StorybookScreen` + `PageDetailScreen`

### Phase 2 — Social Layer (Tuần 7–14)

- [ ] API: `/social/*` (react, share, challenge, remix)
- [ ] Domain: `social-rules.ts` + PacoPick quota
- [ ] API: WeeklyPrompt CRUD
- [ ] Web: `ReactionBar` + `GalleryWall` + `ChallengeCard` + `WeeklyPromptBanner`
- [ ] Leaderboard: tất cả 7 tabs
- [ ] NATS: social event → sticker trigger subscriber
- [ ] AIKidApp: `ReactionPicker` + `HintDrawer`
- [ ] Notification service: 12 notification types

### Phase 3 — Video & Ebook (Tuần 15–20)

- [ ] Base videos: 8 videos CDN upload
- [ ] API: `/video-unlock/:slug` → overlay JSON
- [ ] Web: `PageCompleteModal` với video player + overlay injection
- [ ] API: `/ebook/generate` + Puppeteer job worker
- [ ] AIKidApp: `PageCompleteOverlay` (expo-video)
- [ ] Push notifications: FCM integration

### Phase 4 — Events & Admin (Tuần 21–24)

- [ ] Admin panel: trang quản lý BookPage + BookSticker
- [ ] Event page system: seasonal pages (Tết, Trung Thu)
- [ ] Co-create: shared canvas prototype
- [ ] Showcase Friday automation
- [ ] Performance audit: load test toàn bộ endpoints
- [ ] Migration: legacy Achievement → StickerEarn one-time script
- [ ] Analytics: funnel tracking (page view → sticker earned → page complete)

---

## XI. TEST STRATEGY

### Unit Tests — Domain Layer

```typescript
describe('evaluateTrigger', () => {
  it('should pass "quests.completed >= 1" when 1 quest done');
  it('should fail "quests.completed >= 5" when only 3 done');
  it('should handle "creative.self_character_created == true"');
  it('should handle "social.paco_picks >= 3"');
  it('should return false for unknown DSL namespace');
});

describe('canUsePacoPick', () => {
  it('returns true when usedCount < 3');
  it('returns false when usedCount == 3');
});

describe('computeReactionScore', () => {
  it('weights PACO_PICK at 5x');
  it('returns 0 for empty reactions');
});

describe('getCurrentWeekKey', () => {
  it('returns ISO format "YYYY-WWW"');
});
```

### Integration Tests — API Layer

```typescript
describe('POST /stickers/check', () => {
  it('unlocks sticker when trigger condition met');
  it('does not double-unlock already earned sticker');
  it('triggers page complete when 9/9 stickers earned');
  it('returns empty array when no new unlocks');
});

describe('POST /social/react with PACO_PICK', () => {
  it('succeeds on first 3 uses per week');
  it('returns 429 on 4th attempt');
  it('resets quota on new week');
});

describe('WorkChallenge expiry', () => {
  it('marks EXPIRED when past expiresAt');
  it('does not allow completion of expired challenge');
});
```

### E2E Tests — Playwright

```typescript
test('Quest complete → sticker toast → storybook updated', async ({ page }) => {
  // 1. Complete a quest
  // 2. Assert toast "🎉 Sticker mới!" appears
  // 3. Navigate to Storybook
  // 4. Assert sticker slot shows earned state
});

test('Reaction → leaderboard update', async ({ page }) => {
  // 1. React PACO_PICK to a work
  // 2. Assert trending leaderboard score updated
  // 3. Assert author receives notification
});
```

### Performance Benchmarks

| Test | Tool | Pass Criteria |
|------|------|--------------|
| `POST /stickers/check` | k6 | p95 < 500ms at 100 RPS |
| `GET /leaderboard/xp` | k6 | p95 < 100ms at 500 RPS |
| Ebook generation | Puppeteer timeout | < 60s end-to-end |

---

## XII. SECURITY & EDGE CASES

### Authorization Rules

- User chỉ xem được stickers của chính mình (+ parent)
- PacoPick: validate week boundary tại server (không trust client `weekKey`)
- Challenge: chỉ `challengerId` hoặc `challengedId` mới được PATCH
- Gallery: public read, không expose userId của tác phẩm bị ẩn
- Ebook: chỉ owner mới poll được `/ebook/status/:jobId`

### Edge Cases

| Tình huống | Xử lý |
|-----------|-------|
| User đổi timezone → weekKey sai | Server dùng UTC cho weekKey |
| Event page hết hạn → user có sticker đã earn | Giữ stickers, ẩn page |
| 9/9 stickers nhưng video chưa xem | PageUnlock.videoWatched = false, vẫn unlock |
| Duplicate StickerEarn race condition | `@@unique([userId, stickerId])` → Prisma throws, bắt P2002 |
| Ebook job timeout | Mark `status: "error"`, cleanup temp files |

---

*File này là nguồn sự thật kỹ thuật cho Phase 1–4. Cập nhật khi có thay đổi kiến trúc.*
*Last updated: 2026-07-27 · Owner: StoryMee Engineering*
