# Profile avatar media contract

## Current transition request

```http
PATCH /api/v1/account/family/me/avatar
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "avatarMediaId": "media_01J...",
  "avatarUrl": "https://storage.storymee.com/..."
}
```

`avatarMediaId` is the durable identity. `avatarUrl` is a temporary backwards
compatibility field and must not be treated as proof of ownership.

## Required backend behavior

1. Resolve the actor exclusively from the access token.
2. Load the media row by `avatarMediaId`.
3. Require `media.ownerUserId === actor.userId`.
4. Require purpose `profile_avatar`, state `ready`, and an accepted moderation
   state.
5. Persist `avatarMediaId`; derive delivery URLs from media/storage metadata.
6. Return `401` for missing/invalid authentication and `403` for ownership or
   family-boundary failures. Never silently accept another user's media URL.
7. During migration, URL-only payloads may remain supported for existing
   records. New uploads must use media ID.

The frontend retries a URL-only request only when a legacy deployment rejects
the new field with `400` or `422`. It never retries `401` or `403`.
