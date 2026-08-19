# Reward Studio lifecycle & mapping contract

Frontend owner: `apps/web`  
Backend owner: `core-gamification` through StoryMee Hub

## Purpose

Reward assets and reward requirements have independent versioned lifecycles.
The frontend never grants rewards locally and never treats a route guard as
authorization. Every mutation below is admin-only and must be enforced by the
Hub and `core-gamification`.

## Studio item lifecycle

Existing base: `/api/v1/gamification/admin/studio`

| Method | Path | Meaning |
| --- | --- | --- |
| `DELETE` | `/:id` | Hard-delete a draft only after dependency check |
| `POST` | `/:id/revert-to-draft` | Return review/scheduled version to draft |
| `GET` | `/:id/dependencies` | Return references and `canDelete` |
| `GET` | `/:id/audit` | Return immutable audit events |

Published items are immutable. “Remove from production” calls the existing
`POST /:id/retire`; it must not erase learner inventory or historical grants.

Dependency response:

```json
{
  "canDelete": false,
  "references": [{ "type": "reward_mapping", "label": "Level 15 rewards" }]
}
```

Audit response:

```json
{
  "entries": [{
    "id": "audit_01",
    "action": "published",
    "actorName": "Admin",
    "createdAt": "2026-08-18T03:00:00.000Z",
    "summary": "v3 replaced v2"
  }]
}
```

## Independent reward mappings

Base: `/api/v1/gamification/admin/reward-mappings`

| Method | Path | Meaning |
| --- | --- | --- |
| `GET` | `/` | List mapping versions |
| `POST` | `/` | Create draft mapping |
| `PUT` | `/:id` | Update an unpublished version |
| `DELETE` | `/:id` | Delete a draft after dependency check |
| `POST` | `/:id/review` | Submit draft for review |
| `POST` | `/:id/publish` | Atomically publish mapping version |
| `POST` | `/:id/retire` | Stop future grants; preserve history |
| `POST` | `/:id/revert-to-draft` | Return review to draft |
| `GET` | `/:id/dependencies` | Inspect references before destructive action |
| `GET` | `/:id/audit` | Read immutable audit events |

Mapping payload:

```json
{
  "name": "Level 15 rewards",
  "requirement": {
    "type": "xp_level",
    "operator": "gte",
    "value": 15
  },
  "rewardIds": ["frame-cloud", "title-explorer"]
}
```

Supported requirement types are `xp_level`, `action`, `storybook_sticker`,
`event`, and `achievement`. Reward IDs must resolve to existing reward catalog
codes. Publishing must be atomic, reject invalid or retired rewards, and append
an audit event. `401/403` responses remain authoritative; the frontend fails
closed and does not cache or simulate mutations.
