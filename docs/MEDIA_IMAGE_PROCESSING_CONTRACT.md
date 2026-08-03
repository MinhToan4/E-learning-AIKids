# Profile media processing and derivative contract

## Topology

```text
StoryMee Hub/backend: Ubuntu application server
Media files: separate storage VPS in Germany
Frontend: Vercel
```

The Ubuntu backend owns authentication, media ownership, processing state,
moderation decisions and job orchestration. The German VPS stores bytes only.
A worker may run beside the Ubuntu backend or on a dedicated worker host, but
it updates state through the backend-owned media database.

## State machine

```text
created → uploaded → processing → ready
                    ↘ failed
                    ↘ rejected
```

Only a `ready` derivative may become the user's avatar. `original` remains
private and must never be returned as the display URL.

Finalize should verify the uploaded object, enqueue processing and return:

```json
{
  "asset": {
    "id": "media_01J...",
    "mediaId": "media_01J...",
    "status": "processing"
  }
}
```

The frontend polls the authenticated Ubuntu backend:

```http
GET /api/v1/media/upload-sessions/{uploadId}
Authorization: Bearer <access-token>
```

Ready response:

```json
{
  "asset": {
    "id": "media_01J...",
    "mediaId": "media_01J...",
    "status": "ready",
    "displayUrl": "https://storage.storymee.com/user-media/.../display.webp",
    "thumbnailUrl": "https://storage.storymee.com/user-media/.../thumbnail.webp",
    "variants": {
      "display": {
        "url": "https://storage.storymee.com/user-media/.../display.webp",
        "width": 512,
        "height": 512,
        "bytes": 68421
      },
      "thumbnail": {
        "url": "https://storage.storymee.com/user-media/.../thumbnail.webp",
        "width": 128,
        "height": 128,
        "bytes": 9214
      }
    }
  }
}
```

Worker requirements:

1. Verify magic bytes; do not trust browser MIME.
2. Enforce maximum decoded pixels and reject decompression bombs.
3. Normalize orientation and strip EXIF/GPS.
4. Apply child-safety moderation.
5. Crop/fit a square avatar without stretching.
6. Produce WebP `display` 512×512 and `thumbnail` 128×128.
7. Store derivatives on the German storage VPS under a server-generated key.
8. Mark `ready` only after both derivative objects exist.

For `failed` or `rejected`, return a safe message without leaking storage paths,
moderation internals or another family's metadata.
