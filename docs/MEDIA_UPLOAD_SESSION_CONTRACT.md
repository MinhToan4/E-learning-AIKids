# StoryMee media upload-session contract

## Deployment boundary

```text
Vercel frontend
  → StoryMee Hub/backend on the Ubuntu application server
  → original and derivative files on the separate storage VPS in Germany
```

The Ubuntu backend owns authentication, metadata, processing state and worker
orchestration. The German VPS is the storage origin; it does not become the
StoryMee application backend.

This is the target contract for profile-avatar uploads. The browser authenticates
only to StoryMee Hub. The Hub issues a short-lived upload URL on the configured
`VITE_STORAGE_PUBLIC_URL` origin.

## 1. Create an owner-bound session

```http
POST /api/v1/media/upload-sessions
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "purpose": "profile_avatar",
  "fileName": "avatar.webp",
  "contentType": "image/webp",
  "size": 483221
}
```

```json
{
  "uploadId": "upload_01J...",
  "mediaId": "media_01J...",
  "uploadUrl": "https://storage.storymee.com/uploads/...",
  "uploadHeaders": {
    "Content-Type": "image/webp"
  },
  "expiresAt": "2026-07-31T10:30:00Z"
}
```

The Hub derives `ownerUserId` from the access token. It must not accept a user,
family, bucket or object key from the browser. Limit avatars to JPG, PNG or WebP
and 5 MB both here and at storage.

## 2. Direct storage PUT

The browser sends the file to `uploadUrl` with no StoryMee access token and no
cookies. Storage CORS must allow `PUT` and `Content-Type` from the deployed
frontend origins. The signed URL should expire within 5–15 minutes.

## 3. Finalize

```http
POST /api/v1/media/upload-sessions/upload_01J.../finalize
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "mediaId": "media_01J..."
}
```

The Hub must re-check session ownership, expiry, object existence, byte size and
content checksum before enqueueing processing. Finalize must be idempotent.

```json
{
  "asset": {
    "id": "media_01J...",
    "mediaId": "media_01J...",
    "status": "processing"
  }
}
```

During deployment migration, the frontend falls back to the legacy Hub upload
only when session creation returns `404`, `405` or `501`. Authentication,
ownership, rate-limit, validation, storage and processing errors never fall back.
