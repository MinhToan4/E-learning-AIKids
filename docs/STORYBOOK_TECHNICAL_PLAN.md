# Storybook & Social — Technical Plan

> Cập nhật theo code trên nhánh `codex/feature-storybook-social-interaction`.
>
> Nguyên tắc: domain rules thuần; Hub giữ source of truth; client localStorage chỉ là prototype/fallback.

## 1. Kiến trúc đích

```text
AIKid Web / AIKids App
        │
        ▼
StoryMee Hub /api/v1
        │
        ├── Account: child, family, school context
        ├── LMS: learning events and progress
        ├── Media: gallery, approval, public assets
        ├── Gamification: XP, streak, achievements
        ├── Storybook: sticker progress and chapter rewards
        └── Social: graph, feed, reaction and workspace ACL
```

Web không sở hữu social graph hoặc reward inventory ở production.

## 2. Domain packages hiện có

| File | Trách nhiệm |
|---|---|
| `rewards.ts` | Catalog, unlock rule, reward kind |
| `social-rules.ts` | Paco quota, score, favorite limit, friend code |
| `sticker-rules.ts` | Evaluate trigger an toàn |
| `xp-levels.ts` | XP toàn hệ sinh thái |
| `progress.ts` | Tiến độ bài học |

Rules phải deterministic, không đọc DB/localStorage và có unit test.

## 3. Web modules hiện có

```text
features/storybook/
  pages/StorybookPage.tsx
  components/BookSpread.tsx
  components/ChapterRewardCard.tsx
  components/GalleryWall.tsx
  components/SocialLeaderboard.tsx
  components/InteractionBoard.tsx

features/profile/
  pages/ProfilePage.tsx
  pages/PublicProfilePage.tsx
  components/AvatarPickerModal.tsx
  profile-showcase.ts

features/rewards/
  RewardCollection.tsx
  EquippedProfile.tsx
  reward-equipment.ts

features/community/
  components/SocialGraphPanel.tsx
  components/ActivityFeed.tsx
  components/WorkspaceSharingPanel.tsx
  community-store.ts
  workspace-sharing.ts
```

Các file `*-store.ts`, `chapter-rewards.ts` đang dùng localStorage và phải được thay bằng API adapter khi Hub sẵn sàng.

## 4. Data model đề xuất

### Storybook

```text
StorybookPage(id, slug, title, group, version)
StorybookSticker(id, pageId, slot, triggerKey, boss)
StorybookSticker(userId, stickerId, earnedAt, sourceEventId, sourceType)
ChapterReward(pageId, rewardId)
RewardInventory(userId, rewardId, unlockedAt, sourceEventId, sourceType)
RewardEquipment(userId, kind, rewardId, updatedAt)
```

Ràng buộc:

- unique `(childId, stickerId)`;
- unique `(childId, rewardId)`;
- unique active equipment `(childId, kind)`;
- `sourceEventId` idempotent.

### Social graph

```text
FriendInvite(id, senderChildId, recipientChildId, tokenHash, status, expiresAt)
ChildConnection(id, childAId, childBId, status, approvedAt)
FavoriteConnection(childId, connectionId, position)
ChildBlock(blockerChildId, blockedChildId, createdAt)
```

Favorite giới hạn 6 bằng transaction/server validation, không chỉ client.

### Feed

```text
SocialActivity(id, actorChildId, type, safeFields, audiences[], sourceEventId, createdAt)
SocialReaction(id, activityId, actorChildId, type, createdAt)
```

### Public Profile và Workspace

```text
PublicProfile(childId, slug, themeRewardId, settingsJson, updatedAt)
WorkspaceGrant(workspaceId, audienceType, audienceId, permission, approvedBy, revokedAt)
```

## 5. API contract cần triển khai

### Storybook

| Method | Route | Mục đích |
|---|---|---|
| GET | `/api/v1/storybook/me` | Pages, sticker progress, claimed rewards |
| POST | `/api/v1/storybook/chapters/:slug/claim` | Claim Boss + reward idempotently |
| GET | `/api/v1/rewards/me` | Inventory và equipment |
| PUT | `/api/v1/rewards/me/equipment/:kind` | Trang bị reward |

### Social graph

| Method | Route | Mục đích |
|---|---|---|
| POST | `/api/v1/social/invites` | Tạo code/QR token |
| POST | `/api/v1/social/invites/accept` | Nhận lời mời |
| POST | `/api/v1/social/invites/:id/approve` | Parent approve |
| GET | `/api/v1/social/connections` | Danh sách kết nối |
| PUT | `/api/v1/social/connections/:id/favorite` | Ghim/bỏ ghim |
| DELETE | `/api/v1/social/connections/:id` | Hủy kết nối |
| POST | `/api/v1/social/blocks` | Block |

### Feed và Profile

| Method | Route | Mục đích |
|---|---|---|
| GET | `/api/v1/social/feed` | Feed theo context/audience |
| POST | `/api/v1/social/activities/:id/reactions` | Reaction |
| DELETE | `/api/v1/social/activities/:id/reactions/:type` | Gỡ reaction |
| GET | `/api/v1/profiles/:slug` | Public Profile đã lọc quyền |
| PUT | `/api/v1/profiles/me/settings` | Module và audience |
| PUT | `/api/v1/workspaces/:id/grants` | Cập nhật ACL |
| POST | `/api/v1/workspaces/:id/grants/:audience/approve` | Parent approve |
| DELETE | `/api/v1/workspaces/:id/grants/:audience` | Thu hồi ngay |

Không dùng route legacy `/api/social/*` làm source of truth.

## 6. Event flow

```text
LMS/Media/Gamification event
→ durable event bus/outbox
→ Storybook trigger evaluator
→ insert ChildSticker (idempotent)
→ nếu đủ S1–S8: Chapter claim available
→ child claim
→ insert Boss sticker + RewardInventory
→ emit reward.unlocked
→ create SocialActivity theo Profile settings
```

Activity chỉ chứa metadata cho phép chia sẻ. Không đính video, prompt hoặc private workspace body.

## 7. Client migration

### Giai đoạn A — API adapters

- Tạo `storybook-api.ts`, `social-api.ts`, `profile-api.ts`.
- Giữ UI component không phụ thuộc transport.
- Map Hub payload về view model hiện tại.

### Giai đoạn B — chuyển source of truth

- Đọc server trước.
- Migrate local equipment/settings một lần nếu server trống.
- Server trả version/ETag để tránh ghi đè thiết bị khác.
- Xóa local prototype sau thời gian chuyển tiếp.

### Giai đoạn C — realtime

- Feed và reward toast dùng SSE/WebSocket/notification event.
- Không polling dày.

## 8. Safety và authorization

Mọi request phải suy ra child/family/org từ JWT/context, không tin `childId` tùy ý từ body.

Kiểm tra bắt buộc:

- child thuộc family/context;
- parent có quyền approve;
- school membership còn active;
- block trước ACL;
- media đã approved;
- content type không phải Storybook video;
- rate limit và idempotency key.

Public Profile endpoint chỉ trả projection an toàn, không trả raw child record.

## 9. Test plan

### Domain

- friend code normalize/validate;
- favorite limit 6;
- Paco Pick quota theo ISO week;
- sticker trigger fail-closed;
- Chapter claim idempotent;
- reward equipment một item/kind.

### API integration

- hai phụ huynh approve mới active;
- expired invite không nhận được;
- block thu hồi quyền xem;
- workspace video bị từ chối;
- duplicate event không nhân sticker/reward;
- public profile lọc module/audience.

### E2E

1. Hoàn thành trigger → sticker xuất hiện.
2. Đủ 8 sticker → claim reward.
3. Reward xuất hiện trong wardrobe.
4. Trang bị background/frame → private và public Profile đổi.
5. Gửi friend invite → parent approve → favorite.
6. Chia sẻ workspace → audience xem được.
7. Thu hồi → audience mất quyền ngay.

## 10. Observability

Theo dõi:

- trigger received/evaluated/rejected;
- sticker/reward idempotency conflicts;
- invite created/accepted/approved/expired;
- ACL granted/revoked/denied;
- public profile access denied;
- moderation and parent approval latency.

Không log invite token thô, PIN, prompt riêng tư hoặc media URL nhạy cảm.

## 11. Delivery status

| Phase | Kết quả |
|---|---|
| Web product surfaces | Hoàn thành |
| Pure domain rules | Một phần hoàn thành |
| Local prototype stores | Đã thay khỏi luồng production |
| Core Gamification Storybook/Reward persistence và API | Hoàn thành, đã route qua Hub |
| Core Gamification Social Graph/invite/approval/favorite/block | Hoàn thành, đã route qua Hub |
| Core Gamification Activity Feed/reaction/Paco quota | Hoàn thành, đã route qua Hub |
| Core Account Public Profile safe projection | Hoàn thành, đã route qua Hub |
| Core Account Workspace ACL/parent approval/revoke | Hoàn thành, đã route qua Hub |
| StoryMee Hub gateway/deployment | Hoàn thành |
| Signed external Profile share link | Chưa triển khai |
| Cross-device inventory/equipment/social | Hoàn thành |

Luồng production dùng PostgreSQL qua Core Account và Core Gamification. Local storage chỉ còn cache hiển thị thiết bị.
