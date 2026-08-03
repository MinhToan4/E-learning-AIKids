# Reward pack ZIP import

## Topology

```text
Designer/CI
  → StoryMee backend on Ubuntu: auth, session, manifest validation, draft state
  → storage VPS in Germany: ZIP draft bytes and published reward files
```

Designer and CI never receive a persistent credential for the German storage
VPS. The Ubuntu backend issues a short-lived, single-object upload URL.

## ZIP layout

```text
summer-cloud-event.zip
├── manifest.json
└── assets/
    ├── frame-cloud-summer.webp
    ├── frame-cloud-summer--plaque.webp
    ├── frame-cloud-summer--preview.webp
    └── frame-cloud-summer--thumbnail.webp
```

The manifest links rewards, achievements, achievement points, reward unlocks,
bundles and every asset variant. See `docs/reward-pack.example.json`.

Designer workflow, export specifications and the mandatory scalable level
background for every frame are documented in
`docs/REWARD_DESIGNER_UPLOAD_GUIDE.md`.

## CLI

Validate locally:

```bash
npm run rewards:pack -w @aikids/web -- validate ./summer-cloud-event.zip
```

Upload as a draft:

```bash
STORYMEE_API_ORIGIN=https://api.storymee.com \
STORYMEE_STORAGE_ORIGIN=https://storage.storymee.com \
STORYMEE_ADMIN_TOKEN="$SHORT_LIVED_TOKEN" \
npm run rewards:pack -w @aikids/web -- upload ./summer-cloud-event.zip
```

The token must be short-lived and scoped to:

```text
reward_pack:draft:create
reward_pack:upload
```

It must not include `reward_pack:publish` for ordinary designer/CI uploads.

## Ubuntu backend endpoints

```http
POST /api/v1/admin/reward-packs/upload-sessions
POST /api/v1/admin/reward-packs/upload-sessions/{uploadId}/finalize
```

The public paths above are rewritten by StoryMee Hub to:

```text
/internal/v1/gamification/admin/reward-packs/...
```

`core-gamification-api` owns the session and draft records. It asks StoryMee
Hub for an IAM-protected, short-lived MinIO URL; it never returns MinIO
credentials. Required Ubuntu environment:

```text
# storymee-hub and core-gamification-api must share the internal IAM value
HUB_API_KEY=...

# core-gamification-api
HUB_INTERNAL_ORIGIN=http://127.0.0.1:5100
REWARD_PACK_BUCKET=reward-packs
REWARD_PACK_MAX_BYTES=262144000

# storymee-hub: Germany storage VPS connection
MINIO_ENDPOINT=...
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_USE_SSL=true
```

Create-session verifies role, pack/release naming, compressed size, quota and
that the release is not immutable. Finalize verifies object existence, size and
SHA-256, then enqueues safe server-side ZIP inspection.

The backend must independently repeat all CLI validation and additionally:

1. Reject symlinks, absolute paths, traversal, duplicate names and ZIP bombs.
2. Limit compressed/uncompressed bytes, entries and compression ratio.
3. Verify magic bytes, dimensions, transparency and per-kind asset rules.
4. Validate every reward/achievement/bundle relationship transactionally.
5. Detect ID conflicts with already-published catalog records.
6. Store ZIP and extracted draft objects in a private draft prefix.
7. Return `draftId` with `status: validating`; do not activate the catalog.

## Publish boundary

ZIP upload creates a draft only:

```text
uploaded → validating → ready_for_review → approved → published
```

Publication is a separate reviewer/publisher action on the Ubuntu backend. It
creates an immutable release on the German storage VPS, writes the manifest and
only then activates logical `assetId` references in the reward catalog.

## CI handoff

The designer/build workflow uploads exactly one `*.reward-pack.zip` as a
GitHub Artifact. Run `.github/workflows/reward-pack-import.yml` with its source
workflow run ID and artifact name. Configure the protected
`reward-pack-draft` GitHub Environment with:

```text
Variable: STORYMEE_API_ORIGIN
Variable: STORYMEE_STORAGE_ORIGIN
Secret: STORYMEE_REWARD_PACK_DRAFT_TOKEN
```

The workflow can validate and create a draft. It intentionally cannot publish.

## Catalog caching

The published catalog response includes:

```text
Cache-Control: public, max-age=30, s-maxage=300, stale-while-revalidate=86400
ETag: "gamification-<type>-<catalogVersion>"
X-StoryMee-Catalog-Version: <catalogVersion>
```

Catalog records reference immutable versioned assets. Do not purge immutable
asset URLs during rollout; switch the catalog version and retain the preceding
release for rollback.
