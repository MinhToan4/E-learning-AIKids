# Vidtory Media: ref / startImages, upload, ownership học sinh & lưu cloud

> **Mục đích:** Tài liệu thiết kế / hiện trạng / hướng đi — **chưa bắt buộc implement ngay**.  
> Dùng làm blueprint khi tối ưu generation, portfolio và multi-tenant an toàn.  
> **Cập nhật:** 2026-07-20 · AI Kids Creator Academy monorepo

---

## 1. Tóm tắt vấn đề

| # | Vấn đề | Ý nghĩa |
|---|--------|---------|
| A | API Vidtory: **1 ảnh ref** vs **nhiều ảnh** | Phải map đúng field: `refImageUrl` / `startImages` |
| B | Upload file → URL/Media ID | Dùng `POST /media/upload` (SDK `ai.media.upload`) trước khi gen i2v/r2v |
| C | **Một API key merchant** cho cả hệ thống | Mọi job/media trên Vidtory thuộc **cùng merchant** — không phải “account từng học sinh” |
| D | Không được lẫn sản phẩm giữa học sinh | Isolation phải do **AIKids** (DB + storage path + RBAC), không dựa vào “mỗi bé một Vidtory key” |
| E | Muốn lưu cloud ảnh/video trả về từ Vidtory | Nên **re-host** về cloud của mình (Supabase Storage / R2/S3) làm **source of truth** |

**Kết luận ngắn:** Vidtory = **nhà máy gen** (merchant shared). AIKids = **sổ cái sở hữu** (student-scoped). Cloud của bạn = **kho tư liệu bền**.

---

## 2. API / SDK Vidtory (chuẩn field)

Nguồn: `@vidtory/ai-sdk` (`Documents/vidtory-sdk/javascript`) + OpenAPI merchant (`https://bapi.vidtory.net`).

### 2.1 Auth

- Header: `x-api-key: <merchant_key>`
- AIKids hiện lưu key **mã hóa** trong `system_settings` (admin), fallback `VIDTORY_API_KEY` env.
- **Không** đưa key ra browser / từng student.

### 2.2 Generate Image — `POST /generative-core/image`

| Field | Khi dùng | Ghi chú SDK |
|-------|----------|-------------|
| `prompt` | Bắt buộc | Text mô tả |
| `modelId` | Admin routing % | Default SDK: `gemini-3.1-flash-image-preview` |
| `aspectRatio` | Admin config | SQUARE / LANDSCAPE / PORTRAIT… |
| `resolution` | Admin config | `1K` \| `2K` \| `4K` |
| **`refImageUrl`** | **1 ảnh** tham chiếu | URL, Base64, hoặc **Media ID (UUID)** |
| **`startImages`** | **Nhiều ảnh** đầu vào | `string[]` hoặc `StartImageObject[]` (`data` + optional `cropCoordinates`) |
| `styleImageUrl` | 1 ảnh style | Tùy use-case art style |
| `sampleCharacterUrl` | 1 ảnh character | Tùy consistency nhân vật |

**Quy tắc đề xuất AIKids (chưa code đầy đủ):**

```
n = số ảnh input hợp lệ (đã upload / có URL)
n === 0  → text-only image gen (không ref)
n === 1  → refImageUrl = media[0]   (và KHÔNG nhồi trùng startImages trừ khi SDK yêu cầu)
n >= 2   → startImages = media[]    (refImageUrl optional: ảnh “chính” = startImages[0] nếu product cần)
```

### 2.3 Generate Video — `POST /generative-core/video`

| Field | Khi dùng |
|-------|----------|
| `prompt` | Bắt buộc |
| `modelId` | Admin weight pool (theo **modelId**, không chia t2v/i2v) |
| **`mode`** | **Tự động theo tình huống** (đã chốt product): có ref → `i2v`, thuần text → `t2v` |
| **`refImageUrl`** | **1 still** cho i2v (URL / Base64 / Media ID) |
| **`refImageEndUrl`** | Optional frame cuối |
| **`startImages`** | **Nhiều still** (storyboard / multi-keyframe) nếu product hỗ trợ |
| `duration`, `aspectRatio` | Admin routing |

**Quy tắc mode (đã implement hướng này):**

```
hasRefImage ? 'i2v' : 't2v'
```

**Mở rộng multi-image (tương lai):**

```
n === 0 → t2v
n === 1 → i2v + refImageUrl
n >= 2  → mode theo merchant (thường i2v/r2v) + startImages = [...]
          (có thể set refImageUrl = startImages[0] nếu API yêu cầu “primary”)
```

### 2.4 Upload media — `POST /media/upload`

```
POST https://bapi.vidtory.net/media/upload
Content-Type: multipart/form-data
x-api-key: ...

file: <binary max 20MB>
metadata: JSON string hoặc object  ← RẤT QUAN TRỌNG cho multi-tenant
```

**Response 201 (rút gọn):**

```json
{
  "id": "uuid-media",
  "fileName": "...",
  "fileType": "image/png",
  "fileSize": 12345,
  "url": "https://...",
  "metadata": { },
  "createdAt": "...",
  "updatedAt": "..."
}
```

SDK:

```ts
const media = await ai.media.upload({
  file: bufferOrBlob,
  fileName: 'ref.png',
  metadata: {
    // Xem mục 4 — gắn identity AIKids
    aikids_user_id: userId,
    aikids_role: 'student',
    purpose: 'i2v_ref',
  },
})
// Dùng media.url hoặc media.id làm refImageUrl / startImages[]
```

List / filter: `GET /media?metadata=...` — **hỗ trợ** nhưng **không thay** RBAC AIKids (merchant list vẫn “thấy” theo key, filter chỉ là tiện ích).

---

## 3. Hiện trạng dự án AIKids (as-is)

### 3.1 Kiến trúc tổng

```
Browser (student/parent/teacher/admin)
    │  cookie session (httpOnly)
    ▼
Fastify API (apps/api)
    │  Prisma
    ▼
Supabase Postgres          Redis (cache / rate-limit)
    │
    └── (optional) Supabase JS client — Storage CHƯA wire production pipeline
```

### 3.2 Generation & media (cập nhật sau implement M1–M2 partial)

| Thành phần | Trạng thái |
|------------|------------|
| Admin API key (encrypted) | ✅ |
| Model weight % theo **modelId** | ✅ |
| Mode video **t2v / i2v situational** | ✅ (theo có/không ref) |
| Base URL editable (`https://bapi.vidtory.net`) | ✅ |
| Soft Clay prompt bias | ✅ |
| Mock fallback khi không key / lỗi | ✅ |
| `POST /api/media/upload` → Vidtory `media.upload` | ✅ **Teacher/admin CMS only** |
| Student free photo upload | ❌ **Blocked** — an toàn trẻ em / chống lạm dụng |
| Ref = chỉ sản phẩm trong khóa (`isCourseCreatedAsset`) | ✅ `GET /api/media/refs` |
| Promote course asset → Vidtory | ✅ `POST /api/media/promote` |
| Metadata `aikids_user_id` (+ purpose, quest, tenant) | ✅ |
| Map 0/1/N → `refImageUrl` / `startImages` | ✅ (`packages/domain` media-refs) |
| Practice chỉ nhận `assetIds[]` course-created | ✅ (bỏ raw refUrls từ client) |
| Asset row `userId` + metaJson mirror tags | ✅ |
| **Re-host** kết quả gen / upload sang cloud **AIKids riêng** | ❌ **Chưa** — **hiện lưu URL CDN Vidtory** vào `assets.thumbnail` / project |
| Signed URL private bucket AIKids | ❌ Chưa (cần Supabase Storage / R2) |
| Cleanup TTL media merchant | ❌ Chưa |
| Bảng `generation_jobs` audit | ❌ Chưa |

#### Hiện trạng storage (thực tế — đọc kỹ)

```
Student upload / gen result
    → Vidtory CDN URL
    → Lưu string URL vào Postgres (assets.thumbnail, projects.thumbnail, metaJson.storageBackend = "vidtory_cdn")
    → KHÔNG copy bytes về Supabase Storage / S3 / R2
```

**Hệ quả tạm thời:**

- Ownership vẫn đúng nhờ cột **`userId`** AIKids + RBAC.
- File vật lý nằm merchant space; nếu URL public bị lộ, người có link có thể xem (giảm rủi ro bằng không list URL chéo user).
- Xóa user AIKids **chưa** auto-xóa media trên Vidtory (cần job metadata sau).
- Khi có cloud riêng: implement Phase M3 re-host, đổi `storageBackend` → `aikids_storage`, giữ `vidtoryMediaId` để cleanup.

### 3.3 Ownership học sinh **trong AIKids** (đã có phần lõi)

Bảng quan trọng:

```
assets
  id, userId, type, name, questId, thumbnail, private, metaJson, createdAt

projects
  id, userId, title, kind, thumbnail, private, shareStatus, dataJson, ...

approvals
  projectId, childId, parentId, status  → parent duyệt chia sẻ
```

- Portfolio **private-by-default**.
- API portfolio/progress filter theo `userId` session.
- Parent chỉ thấy con linked (`parentId`).
- RBAC domain (`packages/domain` authz).

→ **Logic “của học sinh nào” đã nằm trên Postgres AIKids**, không trên account Vidtory.

### 3.4 Khoảng trống khi dùng 1 merchant key

```
                    ┌─────────────────────────┐
                    │  Vidtory Merchant Space │
                    │  (1 API key)            │
                    │  jobs + media chung     │
                    └───────────┬─────────────┘
                                │
        Nếu chỉ tin URL Vidtory + list /media không filter
        → admin/tooling có thể “thấy” media nhiều học sinh
        → URL leak = xem được file (nếu URL public CDN)
```

**Rủi ro:**

1. **Logical mix-up** nếu code gen/list không filter `userId` (bug app).  
2. **URL leakage** nếu trả URL Vidtory public cho client khác.  
3. **Retention / GDPR-kids**: xóa user AIKids không tự xóa media trên merchant.  
4. **Billing / analytics** merchant: khó phân cost theo học sinh nếu không gắn metadata + log nội bộ.

**Không phải rủi ro:** “Học sinh A login xong gọi Vidtory bằng key của A” — vì key **không** ở client; mọi gen qua BE.

---

## 4. Hướng giải quyết ownership (khuyến nghị)

### Nguyên tắc vàng

> **Source of truth ownership = AIKids DB + AIKids Storage.**  
> Vidtory chỉ là **ephemeral generation + optional temp media**.  
> Mọi object học sinh xem lại phải resolve qua **record `assets` / `projects` gắn `userId`**.

### 4.1 Tầng 1 — Bắt buộc (app isolation) — **đã gần đạt**

- Mọi create `Asset` / `Project` luôn set `userId = session.user.id`.
- Mọi list/get check ownership (hoặc parent-of-child / teacher-of-class).
- Không bao giờ `SELECT * FROM assets` không filter cho student API.
- Share chỉ qua `approvals` (đã có).

### 4.2 Tầng 2 — Metadata khi upload Vidtory (nên làm sớm)

Khi `ai.media.upload`:

```json
{
  "aikids_tenant": "aikids-prod",
  "aikids_user_id": "<uuid student>",
  "aikids_quest_id": "<optional>",
  "aikids_purpose": "i2v_ref | start_frame | style | upload_sketch",
  "aikids_asset_id": "<uuid sau khi tạo record, hoặc pending>"
}
```

Lợi ích:

- Debug merchant console / `media.list({ metadata: { aikids_user_id } })`.
- Hỗ trợ cleanup job theo user.
- **Không** thay RBAC: vẫn chặn ở API AIKids.

### 4.3 Tầng 3 — Re-host về cloud riêng (nên làm production)

Sau khi job COMPLETED và có `result.url` từ Vidtory:

```
1. Download bytes (server-side, timeout, size limit)
2. Upload Supabase Storage / S3 / R2
   path: tenants/{tenant}/users/{userId}/assets/{assetId}/{filename}
3. Lưu permanent URL (hoặc signed URL pattern) vào assets.thumbnail / metaJson
4. (Optional) Xóa media temp trên Vidtory sau N ngày
```

**Bucket policy / RLS Storage (Supabase):**

- Path prefix = `userId` → policy: chỉ service role ghi; đọc qua **signed URL** do API cấp sau ownership check.
- **Không** public bucket “mọi người list được”.

### 4.4 Tầng 4 — Bảng audit generation (khuyến nghị)

```text
generation_jobs
  id, userId, kind (image|video), provider ('vidtory'),
  modelId, videoMode (t2v|i2v),
  requestMetaJson,           -- prompt hash, aspect, weights pick
  providerJobId,             -- generationHistoryId
  providerMediaIds Json,     -- media id đã upload
  resultProviderUrl,         -- URL tạm Vidtory
  resultStoredUrl,           -- URL cloud AIKids
  status, error, createdAt, completedAt
```

→ Cost, debug, không lẫn user, replay policy.

### 4.5 Những hướng **không** khuyến nghị (v1)

| Hướng | Vì sao tránh |
|-------|----------------|
| Mỗi học sinh một Vidtory API key | Ops không scale; key management; billing nát |
| FE gọi thẳng Vidtory | Lộ key; không RBAC; PII/prompt leak |
| Chỉ tin `metadata` merchant làm auth | Merchant API không thay session AIKids |
| Lưu base64 SVG/dataURL lâu dài trong Postgres | DB phình; không CDN; khó backup |

---

## 5. Luồng đề xuất (to-be)

### 5.1 Upload sketch / ảnh tay học sinh → ref cho i2v

```
Student FE
  │ multipart ảnh (hoặc canvas export)
  ▼
POST /api/media/upload-ref   (AIKids — auth student)
  │ validate: type, size ≤ 20MB, virus-ish checks, ownership
  │ optional: nén/resize Sharp
  ▼
Vidtory ai.media.upload({ file, metadata: { aikids_user_id, ... } })
  │
  ▼
AIKids Asset row: type=ref|panel, userId, thumbnail=providerUrl|storedUrl, metaJson
  │
  ▼
Response: { assetId, urlForGen }  // FE không cần key
```

### 5.2 Practice gen video

```
POST /api/progress/:questId/practice  { kind: 'video', payload: { prompt, assetIds?: [] } }
  │
  ├─ resolve assets by userId (ownership)
  ├─ pick modelId by weight pool (admin)
  ├─ mode = assetIds.length >= 1 ? 'i2v' : 't2v'
  ├─ 1 asset  → refImageUrl
  ├─ N assets → startImages (+ optional refImageUrl = first)
  ▼
Vidtory generateVideo → poll job
  │
  ├─ result URL
  ▼
re-host → Storage path user-scoped
  │
  ▼
Project + Asset + generation_jobs (userId)
```

### 5.3 Practice gen image (tương tự)

```
n ref assets:
  0 → pure prompt
  1 → refImageUrl
  N → startImages
→ pick image modelId by weight
→ re-host → Asset(userId)
```

### 5.4 Parent xem / duyệt

```
Parent API chỉ join children parentId = me
Đọc thumbnail từ Storage signed URL sau ownership check
Không list merchant /media
```

---

## 6. Mapping field nhanh (checklist implement sau)

| Tình huống product | mode | Field chính |
|--------------------|------|-------------|
| Text → ảnh | (image) | `prompt` |
| 1 sketch → ảnh | (image) | `refImageUrl` |
| Nhiều ref → ảnh | (image) | `startImages[]` |
| Text → video | `t2v` | `prompt` |
| 1 still → video | `i2v` | `refImageUrl` |
| Nhiều still → video | `i2v` / `r2v`* | `startImages[]` (+ `refImageUrl` first nếu cần) |
| Frame đầu–cuối | `i2v`/`r2v`* | `refImageUrl` + `refImageEndUrl` |

\*Confirm `r2v` với merchant docs khi cần; product kids ưu tiên **t2v / i2v** trước.

---

## 7. Lưu cloud: so sánh lựa chọn

| Option | Ưu | Nhược | Phù hợp |
|--------|----|-------|---------|
| **A. Supabase Storage** (cùng project Postgres) | Ín định monorepo, signed URL, RLS path | Cần service_role server-side upload | **Khuyến nghị v1** |
| **B. Cloudflare R2 / S3** | Rẻ bandwidth, CDN | Thêm IAM/infra | Scale 2k concurrent media |
| **C. Chỉ giữ URL Vidtory** | Nhanh | Mất file khi merchant xoá; khó ownership/CDN | Chỉ dev/mock |
| **D. Postgres BYTEA / base64** | Đơn giản | Phá performance DB | **Không** |

**Khuyến nghị production:**

1. **Postgres** = metadata + ownership + quest link.  
2. **Supabase Storage** (hoặc R2) = bytes.  
3. **Vidtory** = gen + temp media (TTL cleanup).  
4. Path: `aikids/{env}/u/{userId}/a/{assetId}/v{n}.webp`.

---

## 8. Bảo mật & compliance (kids)

- [ ] Không log full prompt nếu chứa PII (đã có `validateChildText` — giữ).  
- [ ] Không log API key / raw media base64.  
- [ ] Signed URL TTL ngắn khi share ra client.  
- [ ] Xóa user → soft-delete assets + queue xóa Storage + optional xóa Vidtory media by metadata.  
- [ ] Parent approval trước khi share ngoài “family”.  
- [ ] Rate-limit gen per user (đã có global rate-limit — nên thêm **per-user gen quota**).  
- [ ] OWASP: upload whitelist MIME (`image/png`, `image/jpeg`, `image/webp`), max size, strip EXIF.

---

## 9. Lộ trình triển khai gợi ý (khi bạn sẵn sàng code)

### Phase M1 — Correctness refs — **DONE (2026-07)**

1. ✅ `buildImageGenRefs` / `buildVideoGenRefs` (`packages/domain/src/media-refs.ts`)  
2. ✅ `generatePracticeImage/Video(..., { refUrls })`  
3. ✅ Tests domain + adapter  

### Phase M2 — Upload pipeline — **DONE (2026-07)**

1. ✅ `POST /api/media/upload` (multipart hoặc JSON base64)  
2. ✅ Vidtory `media.upload` + metadata `aikids_*`  
3. ✅ Asset `userId` + practice `assetIds` / `refUrls`  
4. ✅ FE helper `apps/web/src/shared/lib/media-api.ts`  

### Phase M3 — Re-host cloud — **NOT DONE (blocked: no private cloud yet)**

**Hiện trạng đã chốt với product:** dùng tạm **URL Vidtory CDN**.

Còn lại khi có Storage:

1. Worker: fetch result/upload URL → Supabase Storage / R2 path `u/{userId}/a/{assetId}/…`  
2. Bảng `generation_jobs`  
3. FE chỉ nhận signed URL AIKids  
4. Backfill `storageBackend` từ `vidtory_cdn` → `aikids_storage`

### Phase M4 — Ops — **NOT DONE**

1. Cleanup TTL Vidtory media theo `aikids_user_id`  
2. Quota/cost dashboard admin  
3. CDN cache immutable assets  

### Sketch in-lesson (canvas) — **DONE 2026-07**

| Hạng mục | Trạng thái |
|----------|------------|
| FE `SketchCanvas` (chỉ vẽ trong bài) | ✅ |
| `practiceKind: sketch` → Asset + `questId` | ✅ |
| meta `kind: sketch`, `purpose: course_sketch`, `courseCreated: true` | ✅ |
| Validate data URL png/jpeg/webp, chặn http ảnh ngoài | ✅ `parseCourseSketchDataUrl` |
| Vào pool ref (`isCourseCreatedAsset` / `/api/media/refs`) | ✅ (có questId) |
| Auto-promote sketch data URL → Vidtory khi gen | ⚠️ Tuỳ chọn: user bấm “Gửi lên Vidtory” trên picker; gen có thể dùng data URL trực tiếp nếu provider chấp nhận |
| Lưu sketch lớn ngoài Postgres (object storage) | ❌ Chưa cloud — data URL trong `thumbnail` (giới hạn ~3MB) |

**Hạn chế biết trước (làm sau nếu cần):**  
- Data URL dài trong DB: ổn pilot, production nên M3 re-host.  
- Promote sketch cần fetch data URL (đã hỗ trợ trong `loadBytesFromThumbnail`).  

---

## 10. “Hướng đi tốt nhất” (decision record)

### Quyết định đề xuất

| Quyết định | Chọn | Lý do |
|------------|------|--------|
| Merchant key | **1 key / env** (admin) | Đơn giản, an toàn nếu BE-only |
| Ownership | **AIKids userId** | Multi-tenant thật |
| Multi image | **startImages**; single **refImageUrl** | Đúng SDK |
| Mode video | **Situational** t2v/i2v | Đúng product chốt |
| Storage SoT | **Cloud riêng** + DB metadata | Bền, CDN, xóa user |
| Vidtory media metadata | **Gắn aikids_user_id** | Debug/cleanup |
| FE | **Không** gọi Vidtory | Không lộ key |

### Anti-goals

- Không multi-key theo học sinh ở v1–v2.  
- Không public list merchant media trên FE.  
- Không coi URL Vidtory là permanent archive.

---

## 11. Sơ đồ tổng (target architecture)

```
┌──────────────┐     session      ┌─────────────────────┐
│ Student FE   │ ───────────────► │ AIKids API (Fastify) │
└──────────────┘                  │  RBAC + ownership    │
                                  └──────────┬──────────┘
                       ┌─────────────────────┼─────────────────────┐
                       ▼                     ▼                     ▼
              Supabase Postgres      Supabase Storage        Vidtory B2B
              assets.userId          /u/{userId}/...         x-api-key merchant
              projects.userId        signed read             media.upload + gen
              generation_jobs                                metadata: aikids_*
```

---

## 12. Liên kết code hiện tại (để lần sau mở đúng chỗ)

| Chủ đề | Path |
|--------|------|
| Adapter gen | `apps/api/src/infrastructure/generation/vidtory.adapter.ts` |
| Routing model % | `packages/domain/src/vidtory-routing.ts` |
| Admin key + routing UI | `apps/web/.../AdminPage.tsx`, `admin.routes.ts` |
| Practice video/image | `apps/api/src/modules/progress/progress.routes.ts` |
| Asset / Project schema | `apps/api/prisma/schema.prisma` |
| Supabase client (chưa storage pipeline) | `apps/api/src/infrastructure/supabase/client.ts` |
| SDK media + gen types | `Documents/vidtory-sdk/javascript/src/{client,types}.ts` |
| Portfolio private | `apps/api/src/modules/portfolio/` |

---

## 13. Checklist “đã hiểu đủ để code sau”

- [x] 1 ảnh → `refImageUrl`; nhiều ảnh → `startImages`  
- [x] Upload multipart `/media/upload` → `id` + `url`  
- [x] Mode video situational, weight % chỉ cho modelId  
- [x] 1 merchant key OK nếu ownership ở AIKids + re-host  
- [x] Cloud riêng = SoT; Vidtory = gen factory  
- [ ] Implement M1–M4 khi product ưu tiên media thật

---

*Tài liệu này cố ý **không** gắn deadline implement — ưu tiên làm đúng kiến trúc ownership trước khi scale 100–2000 concurrent và gen thật.*
