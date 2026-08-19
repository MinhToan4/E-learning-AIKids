# AI Kids API route tree

All browser requests must pass through `src/shared/lib/api.ts`. Components
should prefer a domain adapter (`learningApi`, `mediaApi`, `creativeApi`)
instead of depending directly on a Hub service path.

```text
/api/v1
├── account
│   ├── auth, session, context, workspaces
│   ├── public profiles and profile shares
│   └── admin users and login logs
├── lms
│   ├── me: pathway, competency map, credentials
│   ├── family: children, progress, schedule, reports
│   ├── aikids/teacher: classes, courses, grading
│   └── aikids/admin: courses and learning configuration
├── gamification
│   ├── me: streak, achievements, storybook, social, rewards
│   ├── catalog
│   └── admin/studio: Legend & Reward Studio
├── media: gallery, upload, promotion
├── jobs: AI creation jobs and provider policy
├── billing: plans, subscriptions, course checkout, admin
├── notifications
└── system/aikids/admin
```

The machine-readable source is `src/shared/lib/api-route-tree.ts`. Update that
registry and its tests whenever a route family, owner, role or Hub prefix
changes. Compatibility mappings remain in `api.ts` until all callers have
migrated to domain adapters.

## Feature flow matrix

| Feature | UI owner | Adapter | Hub owner | Source of truth |
| --- | --- | --- | --- | --- |
| Lesson and progress | Student frontend | `learningApi` | core-lms | LMS progress |
| Parent Learning | Parent frontend | `learningApi` | core-lms | Family child projection |
| Teacher classes and grading | Teacher frontend | learning compatibility facade | core-lms | Class/assessment records |
| Achievements and equipment | Student frontend | `gamificationApi` | core-gamification | Metric projections and grants |
| Legend/Reward configuration | Admin CMS | `legendStudioApi` | core-gamification | Versioned studio item |
| Profile Card layout | Admin CMS + profile frontend | `legendStudioApi` | core-gamification | Published system layout |
| Artwork/upload | Frontend and CMS | `mediaApi` | core-media | Media gallery/storage |
| AI creation | Creative frontend | `creativeApi` | core-jobs | Job and generated asset |

## Achievement event chain

```text
Frontend action
→ owning backend validates action
→ domain event (for example lesson.completed)
→ metric projection (lessons_completed)
→ requirement evaluation (gte 10)
→ evolution tier unlocked
→ reward grant
→ frontend/CMS reads the resulting projection
```

The selectable metric/event dictionary is maintained in
`src/features/achievements/achievement-config.ts`. CMS must send a registered
metric instead of accepting arbitrary metric text.

## Content lifecycle

```text
draft → review → published → retired
  ↑                   |
  └── new version ────┘
```

Published versions remain immutable for eligibility/grant history. Editing a
published item creates a draft version; presentation-only corrections still
pass review and publish so rollback and audit history remain deterministic.

Deleting a Studio reward is a soft-delete lifecycle operation: the frontend
transitions the version to `retired` and never issues a permanent `DELETE`.
The owning gamification service must record `archivedAt`, append an audit entry,
exclude the version from production reads, and schedule irreversible purge for
`archivedAt + 72 hours`. The purge worker, permissions, and retention guarantee
are backend responsibilities; existing learner grants and inventory are never
removed by this lifecycle.

## Error contract

Hub errors should return `code`, `message`, optional `field`, and `requestId`.
`ApiError` preserves these values so CMS can highlight the exact invalid field
and operations can correlate the request across Hub and the owning service.

## Review checklist

1. UI calls a domain adapter; it does not call `fetch` or storage directly.
2. Legacy route resolves to exactly one canonical `/api/v1` target.
3. The route branch declares the correct audience/role.
4. Parent child-scoped routes include the selected child id.
5. Mutations preserve idempotency, request normalization and 401 fail-closed behavior.
6. Add or update a gateway contract test before changing a mapping.
