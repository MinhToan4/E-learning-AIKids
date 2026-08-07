# Public profile share contract

This contract exposes a deliberately small, revocable projection of a child
profile. It never makes the authenticated child profile itself public.

## Parent endpoints

All parent endpoints require an authenticated parent actor. The Account service
must verify family ownership server-side; `childId` is never trusted by itself.

### `GET /api/v1/account/family/profile-shares`

```json
{
  "shares": [
    {
      "id": "opaque-share-id",
      "childId": "owned-child-id",
      "url": "/share/opaque-random-token",
      "expiresAt": "2026-09-03T00:00:00.000Z",
      "status": "active",
      "approvedWorkCount": 3
    }
  ]
}
```

### `POST /api/v1/account/family/profile-shares`

```json
{
  "childId": "owned-child-id",
  "expiresInDays": 30,
  "modules": ["works", "achievements"]
}
```

The response is `{ "share": ProfileShare }`. The service must:

- accept only `works` and `achievements` in the first release;
- include only media already approved by a parent;
- generate at least 128 bits of cryptographically secure token entropy;
- store only a token hash and return the raw token only in the share URL;
- return a relative same-origin URL;
- invalidate any previous active link for the same child when rotating it;
- record the parent actor, child, expiry and selected modules in an audit log.

### `DELETE /api/v1/account/family/profile-shares/:shareId`

Revokes the link immediately. Revocation must invalidate cached JSON and media
access, not only hide the page in the frontend.

## Guest endpoint

### `GET /api/v1/account/public/profile-shares/:token`

No application account is required. Return `404` for unknown tokens and `410`
for expired or revoked links without revealing the child identity.

```json
{
  "share": { "expiresAt": "2026-09-03T00:00:00.000Z" },
  "profile": {
    "nickname": "Bo",
    "avatarUrl": "https://media.example/safe-avatar.webp",
    "themeKey": null
  },
  "achievements": [
    { "id": "achievement-id", "name": "Bạn học bền bỉ", "iconUrl": null }
  ],
  "works": [
    {
      "id": "public-work-id",
      "title": "Chuyến đi của Paco",
      "description": "Một câu chuyện ngắn.",
      "kind": "Truyện tranh",
      "thumbnailUrl": "https://media.example/publication-bound-thumbnail.webp"
    }
  ]
}
```

The projection must never contain email, exact age/date of birth, school,
classroom, teacher, location, friends, streak, XP history, internal child/user
IDs, or unapproved free-form content.

## Delivery and abuse controls

- Apply `Cache-Control: private, no-store` until purge-on-revoke is proven.
- Rate-limit by token and network origin without exposing viewer identity.
- Strip image metadata and serve publication-bound media URLs.
- Set a restrictive CSP and disallow framing by untrusted origins.
- Keep the route out of sitemaps and return `noindex, nofollow, noarchive`.
- Social Open Graph rendering must use the same safe projection and must not put
  a child's full name or learning metrics in metadata.
