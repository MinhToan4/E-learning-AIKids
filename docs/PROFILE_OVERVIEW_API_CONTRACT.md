# AI Kids profile overview API contract

## Topology

```text
Vercel frontend → StoryMee Hub/backend on Ubuntu
Profile media URLs → storage VPS in Germany
```

The aggregate endpoint is owned by the Ubuntu backend. The German storage VPS
does not aggregate profile data and receives no profile API requests.

```http
GET /api/v1/profile/overview
Authorization: Bearer <access-token>
```

```json
{
  "profile": {
    "settings": {
      "childProfileId": "child-1",
      "slug": "bo",
      "enabled": true,
      "visibility": ["family"],
      "modules": ["achievements", "works"],
      "themeKey": "theme-paco-workshop",
      "frameKey": "frame-cloud-summer",
      "backgroundKey": "background-ai-gate"
    }
  },
  "gamification": {
    "streak": 4,
    "totalXp": 1200,
    "level": 12,
    "achievements": []
  },
  "recentProjects": [],
  "media": {
    "avatarChoices": []
  },
  "rewards": {
    "equipment": [
      {
        "kind": "frame",
        "rewardId": "frame-cloud-summer"
      }
    ]
  }
}
```

Backend requirements:

1. Resolve the child/account context from the access token.
2. Never accept a child or family ID in the query for this `/overview` route.
3. Return only media owned by the actor or explicitly available to that actor.
4. Limit recent projects and achievements; do not embed full inventory history.
5. Use bounded internal queries and execute independent service reads in
   parallel on Ubuntu.
6. Return `401`/`403` when context is invalid. The frontend intentionally does
   not fall back to seven legacy requests for these statuses.
7. Consider `Cache-Control: private, max-age=15` with user/context in the cache
   key; never use a shared public cache for child profile data.

During rollout, the frontend uses the legacy seven-request flow only if the
Ubuntu backend returns `404`, `405` or `501`.
