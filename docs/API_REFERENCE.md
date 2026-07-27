# AIKids API Reference — Complete & Verified

> **Nguồn sự thật:** Đọc trực tiếp từ source code (`routes-tree.txt` + từng file `.routes.ts`).  
> **Cập nhật:** 2026-07-27 · Monorepo `apps/api` · Fastify + Zod + Prisma

---

## 📋 Mục lục

| # | Module | Số endpoints |
|---|--------|:---:|
| 1 | [🔐 Auth](#-auth) | 12 |
| 2 | [🛡️ Admin](#️-admin) | 23 |
| 3 | [📚 Catalog](#-catalog) | 2 |
| 4 | [📖 Learning](#-learning) | 9 |
| 5 | [🎯 Progress](#-progress) | 5 |
| 6 | [📝 Assessment](#-assessment) | 6 |
| 7 | [👨‍👩‍👧 Parent](#-parent) | 13 |
| 8 | [👩‍🏫 Teacher](#-teacher) | 17 |
| 9 | [🎮 Gamification](#-gamification) | 5 |
| 10 | [🎨 Creative](#-creative) | 2 |
| 11 | [🏆 Competency & Credentials](#-competency--credentials) | 6 |
| 12 | [📁 Portfolio & Projects](#-portfolio--projects) | 2 |
| 13 | [🔔 Notifications](#-notifications) | 5 |
| 14 | [🖼️ Media & Storage](#️-media--storage) | 7 |
| 15 | [📅 Schedule](#-schedule) | 8 |
| 16 | [📊 Report](#-report) | 9 |
| 17 | [⚡ Realtime](#-realtime) | 1 |
| 18 | [🌐 Public](#-public) | 2 |
| 19 | [❤️ Health](#️-health) | 1 |
| **Total** | | **135** |

---

## Quy ước chung

### Authentication
Tất cả endpoints (trừ Auth + Public + Health) yêu cầu session cookie `aikids_session` hợp lệ.  
Cookie được set tự động sau khi login thành công.

### HTTP Status Codes
| Code | Ý nghĩa |
|------|---------|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Request không hợp lệ / validation lỗi |
| `401` | Chưa đăng nhập / sai mật khẩu |
| `403` | Không có quyền |
| `404` | Không tìm thấy |
| `409` | Conflict (đã tồn tại) |
| `422` | Unprocessable (ví dụ: parent dùng Google, không có password) |
| `429` | Rate-limit / brute-force lock |
| `503` | Service chưa được cấu hình |

### Error Response Format
```json
{ "error": "Mô tả lỗi bằng tiếng Việt hoặc tiếng Anh" }
```

---

## 🔐 Auth

> **Base:** `/api/auth`  
> **Mô tả:** Đăng nhập, đăng xuất, đăng ký, quản lý phiên.

---

### `POST /api/auth/login/adult`

Đăng nhập bằng email + mật khẩu (parent / teacher / admin).  
Có cơ chế brute-force guard: 5 lần sai → khóa 15 phút.

#### Request Body
```json
{
  "email": "user@example.com",    // hoặc field "login" (nginx-proxy mode)
  "password": "Abc12345"
}
```
| Field | Required | Type | Constraint |
|-------|:--------:|------|-----------|
| `email` \| `login` | Yes | `string` | email hợp lệ, max 120 |
| `password` | Yes | `string` | min 8, max 128 |

#### Response `200`
```json
{ "user": { "id": "...", "role": "parent", "email": "...", "nickname": "..." } }
```

#### Errors
| Code | Nguyên nhân |
|------|------------|
| `401` | Email hoặc mật khẩu chưa đúng |
| `403` | Tài khoản đang tạm khóa |
| `429` | Quá 5 lần thử sai — bị khóa 15 phút |

---

### `POST /api/auth/login/google`

Đăng nhập / đăng ký bằng Google OIDC id_token (GIS).

#### Request Body
```json
{
  "credential": "eyJhbGci...",   // Google ID Token
  "role": "parent"               // "parent" | "teacher" — chỉ dùng khi tạo mới
}
```

#### Response `200`
```json
{
  "user": { "id": "...", "role": "parent", "email": "..." },
  "created": false,   // true nếu tạo tài khoản mới
  "linked": false     // true nếu link Google vào account có sẵn
}
```

---

### `POST /api/auth/login/firebase`

StoryMee SSO: xác thực Firebase ID token → tạo session AIKids.

#### Request Body
```json
{
  "idToken": "eyJhbGci...",  // Firebase ID Token (min 100, max 16384 ký tự)
  "role": "parent"           // "parent" | "teacher"
}
```

#### Response `200`
```json
{
  "user": { "id": "...", "role": "parent" },
  "created": false,
  "linked": false
}
```

---

### `POST /api/auth/login/student`

Đăng nhập học sinh bằng nickname + (tùy chọn) PIN.

#### Request Body
```json
{
  "nickname": "BaoAnh",
  "avatarId": "avatar-robot",    // optional
  "pin": "123456",               // optional — nếu ba/mẹ đã đặt
  "createIfMissing": false       // dev-only (cần STUDENT_AUTO_CREATE=true)
}
```

#### Response `200`
```json
{ "user": { "id": "...", "role": "student", "nickname": "BaoAnh", "level": 1, "xp": 0 } }
```

#### Errors
| Code | Nguyên nhân |
|------|------------|
| `400` | Nickname không hợp lệ |
| `401` | PIN sai / Thiếu PIN |
| `403` | Tài khoản bị khóa / Thiếu liên kết ba-mẹ (prod) |
| `404` | Không tìm thấy học sinh |

---

### `POST /api/auth/logout`
Hủy session hiện tại.

#### Response `200`
```json
{ "ok": true }
```

---

### `GET /api/auth/me`
Lấy thông tin user từ session hiện tại.

#### Response `200`
```json
{
  "user": {
    "id": "...", "role": "student", "nickname": "...",
    "level": 1, "xp": 0, "onboarded": false, "avatarId": "avatar-star"
  }
}
```
#### Errors — `401` nếu chưa đăng nhập.

---

### `PATCH /api/auth/me`
Cập nhật profile bản thân (onboarded, goal, nickname, avatarId).

#### Request Body
```json
{
  "onboarded": true,
  "goal": "comic",        // "world"|"character"|"story"|"comic"|"motion"|"film"
  "nickname": "BaoAnh",
  "avatarId": "avatar-star"
}
```
> **Lưu ý:** Học sinh đã onboarded chỉ được đổi nickname/avatar nếu age-policy cho phép.

#### Response `200`
```json
{ "user": { "id": "...", "onboarded": true, "goal": "comic", ... } }
```

---

### `POST /api/auth/register/adult`
Đăng ký tài khoản mới (parent / teacher).

#### Request Body
```json
{
  "role": "parent",           // "parent" | "teacher"
  "email": "user@example.com",
  "password": "Abc12345",     // min 8, max 128, cần cả chữ và số
  "nickname": "Phụ huynh"     // optional
}
```

#### Response `201`
```json
{ "user": { "id": "...", "role": "parent", "email": "..." } }
```

---

### `POST /api/auth/forgot-password`
Gửi email đặt lại mật khẩu (1 giờ TTL).

#### Request Body
```json
{ "email": "user@example.com" }
```

#### Response `200` *(luôn trả 200 để tránh email enumeration)*
```json
{ "message": "Nếu email tồn tại, link đặt lại mật khẩu đã được gửi." }
```

---

### `POST /api/auth/reset-password`
Đặt lại mật khẩu bằng token từ email.

#### Request Body
```json
{
  "token": "...",       // token 48 ký tự từ link email
  "password": "NewAbc123"
}
```

#### Response `200`
```json
{ "message": "Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại." }
```

---

### `POST /api/auth/change-password`
Đổi mật khẩu khi đang đăng nhập (không dùng cho học sinh).

#### Request Body
```json
{
  "currentPassword": "OldAbc123",
  "newPassword": "NewAbc456"
}
```

#### Response `200`
```json
{ "message": "Mật khẩu đã được thay đổi." }
```

---

### `GET /api/auth/access`
Lấy danh sách contexts / roles cho UI routing sau login.

#### Response `200`
```json
{
  "personas": ["parent"],
  "platformRoles": [],
  "contexts": [{
    "id": "family-abc123",
    "type": "family",
    "label": "Gia đình",
    "defaultRoute": "/parent",
    "actor": "parent",
    "roles": ["parent"],
    "permissions": []
  }],
  "active": {
    "mode": "family",
    "contextId": "family-abc123",
    "organizationId": null
  }
}
```

---

### `POST /api/auth/context`
Chọn context hoạt động (no-op trong single-tenant mode).

#### Response `200`
```json
{ "ok": true }
```

---

### `GET /api/auth/google/config`
Kiểm tra Google OAuth có được cấu hình chưa + client ID public.

#### Response `200`
```json
{ "enabled": true, "clientId": "1234...apps.googleusercontent.com" }
```

---

### `GET /api/auth/firebase/config`
Kiểm tra Firebase có được cấu hình + trả về web config.

#### Response `200`
```json
{
  "enabled": true,
  "config": {
    "apiKey": "...", "authDomain": "...", "projectId": "...",
    "storageBucket": "...", "messagingSenderId": "...",
    "appId": "...", "vapidKey": "..."
  }
}
```

---

### `POST /api/auth/firebase/custom-token`
Tạo Firebase Custom Token cho session hiện tại (dùng cho StoryMee client SDK).  
**Auth required** (mọi role kể cả student).

#### Response `200`
```json
{ "customToken": "eyJhbGci..." }
```

---

## 🛡️ Admin

> **Base:** `/api/admin`  
> **Auth:** `role: admin`  
> **RBAC:** Tất cả endpoints kiểm tra `can(user.role, '<permission>')` trước khi xử lý.

---

### `GET /api/admin/system`

Tổng quan hệ thống: số lượng user, khóa học, session, trạng thái Vidtory AI.  
**Permission:** `system:read`

#### Response `200`
```json
{
  "system": {
    "service": "aikids-api",
    "time": "2026-07-27T06:00:00.000Z",
    "counts": {
      "courses": 6,
      "quests": 48,
      "classes": 3,
      "activeSessions": 12,
      "pendingApprovals": 2,
      "usersByRole": { "student": 45, "parent": 30, "teacher": 5, "admin": 1 }
    },
    "vidtory": { "configured": true, "maskedHint": "****abc1", "source": "db" }
  }
}
```

---

### `GET /api/admin/analytics`

Dashboard analytics 14 ngày gần nhất.  
**Permission:** `system:read`

#### Response `200`
```json
{
  "analytics": {
    "time": "2026-07-27T06:00:00.000Z",
    "users": { "active": 80, "byRole": { "student": 45, "parent": 30, "teacher": 5 } },
    "courses": { "open": 4, "soon": 2 },
    "quests": { "active": 45, "archived": 3 },
    "learning": { "completedProgress": 120, "enrollments": 60, "projects": 35 },
    "sessions": { "active": 12 },
    "trends": [
      { "date": "2026-07-14", "newUsers": 3, "completedQuests": 8, "projects": 2 }
    ]
  }
}
```

---

### `GET /api/admin/users`

Danh sách users (mặc định lấy 100, tối đa 200).  
**Permission:** `user:read`

#### Query Parameters
| Param | Type | Mô tả |
|-------|------|-------|
| `role` | `string` | Lọc theo role: `admin`, `parent`, `teacher`, `student` |
| `take` | `number` | Số lượng kết quả (mặc định 100, tối đa 200) |

#### Response `200`
```json
{
  "users": [{
    "id": "...", "role": "parent", "email": "...", "nickname": "...",
    "avatarId": "...", "level": 1, "xp": 0, "onboarded": true,
    "active": true, "parentId": null, "classId": null, "createdAt": "..."
  }]
}
```

---

### `POST /api/admin/users`

Tạo user mới (adult hoặc student).  
**Permission:** `user:write`

#### Request Body
```json
{
  "role": "parent",              // "parent" | "teacher" | "admin" | "student"
  "email": "user@example.com",   // required nếu không phải student
  "password": "Abc12345",        // required nếu không phải student
  "nickname": "Phụ huynh",       // optional
  "parentId": "...",             // optional — chỉ dùng cho student
  "classId": "...",              // optional — chỉ dùng cho student
  "avatarId": "avatar-star"      // optional — chỉ dùng cho student
}
```

#### Response `201`
```json
{
  "user": {
    "id": "...", "role": "student", "nickname": "HọcSinh",
    "active": true, "parentId": "...", "classId": "..."
  }
}
```

---

### `PATCH /api/admin/users/:id`

Cập nhật user (active, role, nickname, email, password, parentId, classId).  
**Permission:** `user:write`

#### Path Params
| Param | Type | Mô tả |
|-------|------|-------|
| `id` | `string` | User ID |

#### Request Body
```json
{
  "active": true,
  "role": "teacher",
  "nickname": "Tên mới",
  "email": "new@example.com",
  "password": "NewAbc123",
  "parentId": null,
  "classId": null
}
```
> **Lưu ý bảo mật:** Admin không thể tự vô hiệu hóa chính mình (`active: false`).

#### Response `200`
```json
{
  "user": {
    "id": "...", "role": "teacher", "email": "...", "nickname": "...",
    "active": true, "parentId": null, "classId": null
  }
}
```

---

### `DELETE /api/admin/users/:id`

Vô hiệu hóa user (soft-delete: `active=false`) + thu hồi toàn bộ session.  
**Permission:** `user:write`

#### Response `200`
```json
{ "message": "Đã vô hiệu hóa user và thu hồi phiên.", "softDeleted": true }
```

---

### `GET /api/admin/courses`

Danh sách tất cả khóa học kèm quests và số enrollment.  
**Permission:** `course:read`

#### Response `200`
```json
{
  "courses": [{
    "id": "k1-ai-world", "title": "Thế giới AI",
    "shortTitle": "AI World", "status": "open",
    "ageTrack": "L1", "courseKey": "K1", "ageLabel": "6–8 tuổi",
    "recommended": true, "enrollmentCount": 45, "questCount": 8,
    "quests": [{ "id": "...", "order": 1, "title": "...", "videoUrl": "...", "practiceKind": "intro", "archived": false }]
  }]
}
```

---

### `POST /api/admin/courses`

Tạo khóa học mới.  
**Permission:** `course:write`

#### Request Body
```json
{
  "id": "k7-ai-new",            // slug: lowercase, chỉ a-z0-9-
  "title": "Khóa học mới",
  "shortTitle": "AI New",
  "tagline": "Mô tả ngắn",
  "description": "Mô tả đầy đủ...",
  "coverFrom": "#6d5efc",        // gradient start
  "coverTo": "#3dbfff",          // gradient end
  "accent": "#6d5efc",
  "ageLabel": "6–8 tuổi",
  "ageTrack": "L1",              // "L1" | "L2"
  "courseKey": "K1",             // "K1" | "K2" | "K3" | "K4" | "K5" | "K6"
  "durationLabel": "4 tuần",
  "productLabel": "Sản phẩm khóa học",
  "status": "soon",              // "open" | "soon"
  "skills": ["Kể chuyện", "Sáng tạo"]
}
```

#### Response `201`
```json
{ "course": { "id": "...", "title": "...", "status": "soon", ... } }
```

---

### `PATCH /api/admin/courses/:courseId`

Cập nhật metadata khóa học.  
**Permission:** `course:write`

#### Request Body *(tất cả optional)*
```json
{
  "title": "...", "shortTitle": "...", "tagline": "...", "description": "...",
  "status": "open", "ageTrack": "L1", "courseKey": "K2",
  "ageLabel": "8–10 tuổi", "recommended": true, "sortOrder": 3
}
```

#### Response `200`
```json
{ "course": { "id": "...", "title": "...", ... } }
```

---

### `GET /api/admin/sessions`

Danh sách phiên đang hoạt động (chưa hết hạn).  
**Permission:** `system:read`

#### Response `200`
```json
{
  "sessions": [{
    "id": "...", "userId": "...", "email": "...", "nickname": "...",
    "role": "parent", "ipAddress": "127.0.0.1",
    "createdAt": "...", "expiresAt": "..."
  }]
}
```

---

### `DELETE /api/admin/sessions/:id`

Thu hồi một session.  
**Permission:** `user:write`

#### Response `200`
```json
{ "message": "Session đã bị thu hồi." }
```

---

### `GET /api/admin/classrooms`

Danh sách lớp học kèm teacher và học sinh.  
**Permission:** `class:read`

#### Response `200`
```json
{
  "classrooms": [{
    "id": "...", "name": "Lớp 1A", "code": "ABC123",
    "status": "active",
    "teacher": { "id": "...", "nickname": "...", "email": "..." },
    "studentCount": 20,
    "students": [{ "id": "...", "nickname": "...", "level": 1, "xp": 100 }],
    "createdAt": "..."
  }]
}
```

---

### `DELETE /api/admin/classrooms/:id`

Xóa lớp học (unlink toàn bộ học sinh trước).  
**Permission:** `class:write`

#### Response `200`
```json
{ "message": "Lớp học đã được xóa." }
```

---

### `GET /api/admin/login-logs`

Xem 200 sự kiện đăng nhập gần nhất trong 24 giờ qua (OWASP A07 audit).  
**Permission:** `system:read`

#### Query Parameters
| Param | Type | Mô tả |
|-------|------|-------|
| `outcome` | `string` | Lọc: `success`, `failed`, `locked` |
| `limit` | `number` | Số lượng (mặc định 200, tối đa 500) |

#### Response `200`
```json
{
  "logs": [{
    "id": "...", "userId": "...", "email": "...", "outcome": "success",
    "ipAddress": "127.0.0.1", "reason": null, "createdAt": "..."
  }],
  "summary": {
    "total": 85, "byOutcome": { "success": 80, "failed": 5 },
    "windowHours": 24, "purgedAt": "..."
  }
}
```

---

### `DELETE /api/admin/login-logs`

Xóa thủ công tất cả logs cũ hơn 24 giờ.  
**Permission:** `system:read`

#### Response `200`
```json
{ "deleted": 45, "message": "Đã xóa 45 log cũ hơn 24 giờ." }
```

---

### `GET /api/admin/settings/vidtory`

Xem cấu hình Vidtory AI (không trả raw API key).  
**Permission:** `settings:read`

#### Response `200`
```json
{
  "configured": true,
  "maskedHint": "****abc1",
  "source": "db",
  "updatedAt": "...",
  "apiKey": null,
  "routing": {
    "baseURL": "...",
    "image": { "aspectRatio": "1:1", "resolution": "1024x1024", "mode": "standard", "models": [] },
    "video": { "aspectRatio": "16:9", "duration": 5, "mode": null, "models": [] }
  },
  "defaults": { ... },
  "imagePercents": [{ "modelId": "...", "weight": 100, "label": "...", "enabled": true, "percent": 100 }],
  "videoPercents": [...]
}
```

---

### `PUT /api/admin/settings/vidtory`

Cập nhật API key và/hoặc routing của Vidtory AI.  
**Permission:** `settings:write`

#### Request Body
```json
{
  "apiKey": "vk-live-...",   // optional — chỉ gửi khi muốn đổi key
  "routing": { ... }         // optional — cấu hình model load-balancing
}
```

#### Response `200`
```json
{
  "ok": true,
  "configured": true,
  "maskedHint": "****def2",
  "routing": { ... },
  "imagePercents": [...],
  "videoPercents": [...]
}
```

---

### `DELETE /api/admin/settings/vidtory`

Xóa Vidtory API key khỏi hệ thống.  
**Permission:** `settings:write`

#### Response `200`
```json
{ "ok": true, "configured": false }
```

---

### `GET /api/admin/competency/frameworks`

Danh sách framework năng lực.  
**Permission:** `competency:read`

---

### `POST /api/admin/competency/frameworks`

Tạo framework năng lực mới.

---

### `POST /api/admin/competency/mapping-versions`

Tạo phiên bản mapping năng lực mới.

---

### `POST /api/admin/competency/recalculate`

Kích hoạt tính toán lại điểm năng lực cho toàn bộ học sinh.

---

### `GET /api/admin/credential-config`

Lấy cấu hình cấp chứng chỉ.

---

### `POST /api/admin/credential-templates`

Tạo template chứng chỉ mới.

---

### `POST /api/admin/credential-rules`

Tạo quy tắc cấp chứng chỉ tự động.

---

### `POST /api/admin/credentials/:credentialId/revoke`

Thu hồi chứng chỉ đã cấp.

---

### `GET /api/admin/audit-events`

Xem audit log hành động hệ thống.  
**Permission:** `system:read`

---

### `GET /api/admin/schedule-config`

Lấy cấu hình lịch học.

---

### `POST /api/admin/schedule-policies`

Tạo chính sách lịch học.

---

### `POST /api/admin/schedule/reminders/process`

Kích hoạt xử lý nhắc nhở lịch học (worker trigger).

---

### `GET /api/admin/learning/config`

Lấy cấu hình hệ thống học tập (age-policies, path-rules).

---

### `PUT /api/admin/learning/age-policies/:ageBand`

Cập nhật chính sách theo độ tuổi.

#### Path Params
| Param | Type | Mô tả |
|-------|------|-------|
| `ageBand` | `string` | Band tuổi: `6-8`, `9-11`, `12-14`, `15-17` |

---

### `POST /api/admin/learning/path-rules`

Tạo quy tắc lộ trình học tập.

---

### `GET /api/admin/report-config`

Lấy cấu hình hệ thống báo cáo.

---

### `POST /api/admin/report-templates`

Tạo template báo cáo mới.

---

### `POST /api/admin/report-policies`

Tạo chính sách báo cáo tự động.

---

### `POST /api/admin/reports/due/process`

Kích hoạt xử lý báo cáo đến hạn (worker trigger).

---

### `POST /api/admin/reports/deliveries/process`

Kích hoạt giao báo cáo (worker trigger).

---

## 📚 Catalog

> **Mô tả:** Danh sách khóa học và chi tiết quest công khai (cần đăng nhập).

---

### `GET /api/courses`

Danh sách khóa học (học sinh thấy theo enrollment + age-gate).

#### Response `200`
```json
{
  "courses": [{
    "id": "k1-ai-world", "title": "Thế giới AI",
    "status": "open", "ageTrack": "L1",
    "enrolled": true, "unlocked": true
  }]
}
```

---

### `GET /api/courses/:courseId`

Chi tiết một khóa học kèm danh sách quests và progress.

#### Response `200`
```json
{
  "course": {
    "id": "...", "title": "...", "quests": [
      { "id": "...", "order": 1, "title": "...", "status": "available", "stars": 0 }
    ]
  }
}
```

---

## 📖 Learning

> **Base:** `/api/learning`  
> **Auth:** `role: student`

---

### `GET /api/learning/age-policy`

Lấy chính sách trải nghiệm theo độ tuổi của học sinh hiện tại.

#### Response `200`
```json
{
  "ageBand": "9-11",
  "policy": {
    "maxDailyMinutes": 60,
    "canEditProfile": true,
    "canShareProject": true
  }
}
```

---

### `GET /api/learning/pathway`

Lộ trình học tập được đề xuất.

#### Response `200`
```json
{
  "pathway": {
    "currentCourse": "k1-ai-world",
    "nextQuest": "...",
    "recommendations": [...]
  }
}
```

---

### `POST /api/learning/pathway/overrides`

Admin/Teacher tạo override lộ trình cho học sinh.

---

### `GET /api/learning/quests/:questId/notes`

Lấy ghi chú của học sinh trong quest.

---

### `POST /api/learning/quests/:questId/notes`

Tạo ghi chú mới trong quest.

#### Request Body
```json
{ "content": "Ghi chú của con...", "color": "#FFD700" }
```

---

### `PATCH /api/learning/notes/:noteId`

Cập nhật ghi chú.

---

### `DELETE /api/learning/notes/:noteId`

Xóa ghi chú.

---

### `POST /api/learning/quests/:questId/bookmarks`

Đánh dấu bookmark trong quest.

---

### `DELETE /api/learning/bookmarks/:bookmarkId`

Xóa bookmark.

---

### `GET /api/learning/quests/:questId/search`

Tìm kiếm nội dung trong quest.

#### Query Parameters
| Param | Type | Mô tả |
|-------|------|-------|
| `q` | `string` | Từ khóa tìm kiếm |

---

### `PUT /api/learning/quests/:questId/resume`

Lưu trạng thái tiếp tục học.

---

### `POST /api/learning/quests/:questId/offline-manifest`

Tạo manifest cho học offline.

---

### `POST /api/learning/quests/:questId/offline-sync`

Đồng bộ dữ liệu học offline lên server.

---

## 🎯 Progress

> **Base:** `/api/progress`  
> **Auth:** `role: student`

---

### `GET /api/progress/:courseId`

Xem tiến độ học của course hoặc quest hiện tại.

#### Response `200`
```json
{
  "courseId": "k1-ai-world",
  "completed": 3, "total": 8,
  "currentQuestId": "...",
  "quests": [{ "id": "...", "status": "completed", "stars": 2, "phase": "check" }]
}
```

---

### `POST /api/progress/:courseId/start`

Bắt đầu một quest (enrollment check + unlock logic).

#### Request Body
```json
{ "questId": "..." }
```

#### Response `200`
```json
{ "quest": { "id": "...", "status": "in_progress", "phase": "learn" } }
```

---

### `POST /api/progress/:courseId/advance`

Chuyển sang phase tiếp theo trong quest (learn → game → practice → check).

#### Request Body
```json
{ "questId": "...", "phase": "game" }
```

---

### `POST /api/progress/:courseId/practice`

Nộp kết quả thực hành (creative project).

#### Request Body
```json
{ "questId": "...", "projectId": "..." }
```

---

### `POST /api/progress/:courseId/check`

Trả lời câu hỏi kiểm tra (check phase).

#### Request Body
```json
{
  "questId": "...",
  "answerId": 1,     // chỉ số đáp án 0-2
  "correct": true
}
```

#### Response `200`
```json
{
  "stars": 2,
  "xpGained": 50,
  "levelUp": false,
  "nextQuestUnlocked": true
}
```

---

## 📝 Assessment

> **Mô tả:** Hệ thống kiểm tra chính thức (quiz với timer).

---

### `GET /api/assessments/course/:courseId`

Danh sách bài kiểm tra trong khóa học (kèm lượt làm gần nhất).  
**Auth:** `role: student`

#### Response `200`
```json
{
  "assessments": [{
    "id": "...", "code": "K1-FINAL", "title": "Kiểm tra cuối khóa",
    "kind": "final", "status": "active",
    "courseId": "...", "questId": null,
    "latestAttempt": { "id": "...", "status": "passed", "scorePercent": 85, "passed": true }
  }]
}
```

---

### `POST /api/assessments/:assessmentId/attempts`

Bắt đầu lượt làm bài mới.  
**Auth:** `role: student`

#### Response `200`
```json
{
  "attempt": {
    "id": "...", "attemptNumber": 1, "status": "in_progress",
    "startedAt": "...", "expiresAt": "...",
    "durationMinutes": 20,
    "items": [{
      "order": 1, "points": 10, "required": true,
      "questionVersionId": "...",
      "question": { "text": "...", "options": [...] },
      "response": null
    }]
  }
}
```

---

### `GET /api/assessment-attempts/:attemptId`

Lấy trạng thái lượt làm bài.  
**Auth:** `role: student`

#### Response `200`
```json
{
  "attempt": {
    "id": "...", "status": "in_progress", "attemptNumber": 1,
    "scorePercent": null, "passed": null, "items": [...]
  }
}
```

---

### `PUT /api/assessment-attempts/:attemptId/responses/:questionVersionId`

Lưu câu trả lời cho một câu hỏi.  
**Auth:** `role: student`

#### Request Body
```json
{ "response": { "selectedIndex": 2 } }
```

---

### `GET /api/assessment-attempts/:attemptId/result`

Xem kết quả sau khi nộp bài.  
**Auth:** `role: student`

#### Response `200`
```json
{
  "result": {
    "scorePercent": 85, "passed": true,
    "items": [{ "order": 1, "correct": true, "explanation": "..." }]
  }
}
```

---

### `POST /api/assessment-attempts/:attemptId/submit`

Nộp bài kiểm tra.  
**Auth:** `role: student`

#### Response `200`
```json
{
  "attempt": {
    "id": "...", "status": "submitted",
    "submittedAt": "...", "scorePercent": 85, "passed": true
  }
}
```

---

## 👨‍👩‍👧 Parent

> **Base:** `/api/parent`  
> **Auth:** `role: parent`

---

### `GET /api/parent/plans`

Danh sách gói subscription với giá và tính năng.

#### Response `200`
```json
{
  "plans": [{
    "code": "free", "name": "Khám phá", "tagline": "Bắt đầu miễn phí",
    "maxChildren": 1, "maxOpenCoursesPerChild": 1,
    "priceMonthly": 0, "currency": "VND",
    "features": ["1 hồ sơ con", "1 khóa học"]
  }]
}
```

---

### `GET /api/parent/subscription`

Xem trạng thái subscription hiện tại của gia đình.

#### Response `200`
```json
{
  "subscription": {
    "planCode": "plus",
    "childCount": 2,
    "seatsRemaining": 1,
    "expiresAt": "2026-08-27T00:00:00.000Z"
  }
}
```

---

### `POST /api/parent/subscription`

Thay đổi gói subscription.

#### Request Body
```json
{ "planCode": "plus" }  // "free" | "plus" | "family"
```

#### Response `200`
```json
{
  "subscription": { "planCode": "plus", ... },
  "message": "Đã bật gói Plus. Gia đình có thể học trong 30 ngày (bản demo)."
}
```

---

### `GET /api/parent/profile`

Xem profile phụ huynh.

#### Response `200`
```json
{
  "profile": {
    "phone": "0901234567",
    "preferredLanguage": "vi",
    "notificationPrefs": {},
    "maxChildren": 3
  }
}
```

---

### `PATCH /api/parent/profile`

Cập nhật profile phụ huynh.

#### Request Body
```json
{
  "phone": "0901234567",
  "preferredLanguage": "vi",  // "vi" | "en" | "bilingual"
  "notificationPrefs": { "email": true, "push": false }
}
```

---

### `GET /api/parent/children`

Danh sách con kèm thống kê học tập và trạng thái subscription.

#### Response `200`
```json
{
  "children": [{
    "id": "...", "nickname": "BaoAnh", "avatarId": "avatar-star",
    "level": 2, "xp": 150, "onboarded": true, "active": true,
    "birthDate": "2016-05-15", "ageBand": "9-11",
    "hasPin": true,
    "completedQuests": 5, "totalStars": 12, "projectCount": 3
  }],
  "subscription": { "planCode": "plus", ... }
}
```

---

### `POST /api/parent/children`

Tạo hồ sơ con mới.

#### Request Body
```json
{
  "nickname": "BaoAnh",
  "avatarId": "avatar-star",
  "birthDate": "2016-05-15",     // required — xác định ageBand
  "classCode": "ABC123",          // optional — join lớp
  "pin": "123456",                // optional — 6 chữ số
  "goal": "comic"                 // optional: "comic" | "video" | "character"
}
```

#### Response `201`
```json
{
  "child": {
    "id": "...", "nickname": "BaoAnh", "avatarId": "avatar-star",
    "classId": "...", "hasPin": true,
    "birthDate": "2016-05-15", "ageBand": "9-11"
  }
}
```

---

### `PATCH /api/parent/children/:childId`

Cập nhật hồ sơ con (nickname, avatar, classCode, PIN, birthDate).

#### Request Body *(tất cả optional)*
```json
{
  "nickname": "BaoAnh Mới",
  "avatarId": "avatar-cat",
  "classCode": "XYZ789",
  "pin": "654321",      // 6 chữ số hoặc "" để xóa PIN
  "birthDate": "2016-06-01"
}
```

#### Response `200`
```json
{
  "child": {
    "id": "...", "nickname": "...", "avatarId": "...",
    "classId": "...", "hasPin": false, "birthDate": "...", "ageBand": "..."
  }
}
```

---

### `DELETE /api/parent/children/:childId`

Vô hiệu hóa hồ sơ con (soft-delete).

#### Response `200`
```json
{ "message": "Tài khoản con đã được vô hiệu hóa." }
```

---

### `POST /api/parent/children/:childId/pin`

Đặt hoặc xóa PIN riêng (endpoint chuyên dụng).

#### Request Body
```json
{ "pin": "123456" }    // hoặc "" để xóa PIN
```

#### Response `200`
```json
{ "hasPin": true }
```

---

### `POST /api/parent/children/:childId/enter`

Phụ huynh bàn giao thiết bị cho con (swap session: parent → student).

#### Request Body
```json
{ "pin": "123456" }    // optional — chỉ khi con có PIN
```

#### Response `200`
```json
{
  "user": { "id": "...", "role": "student", "nickname": "BaoAnh", ... },
  "message": "Xong! Đang mở hồ sơ BaoAnh. Chúc con học vui!"
}
```

---

### `GET /api/parent/children/:childId/progress`

Xem tiến độ học tập của con theo khóa học.

#### Query Parameters
| Param | Type | Mô tả |
|-------|------|-------|
| `courseId` | `string` | Chọn khóa cụ thể (mặc định: khóa đầu tiên) |

#### Response `200`
```json
{
  "child": { "id": "...", "nickname": "...", "level": 2, "xp": 150 },
  "courseId": "k1-ai-world",
  "courses": [{ "id": "...", "title": "...", "shortTitle": "..." }],
  "summary": { "completed": 5, "total": 8, "totalStars": 12, "currentPhase": "learn" },
  "insights": {
    "strengths": ["Kể chuyện", "Sáng tạo"],
    "nextFocus": "Thiết kế nhân vật",
    "outcomes": ["Tạo nhân vật AI", "Viết kịch bản ngắn"]
  },
  "quests": [{ "id": "...", "order": 1, "status": "completed", "stars": 2, "phase": "check" }]
}
```

---

### `GET /api/parent/children/:childId/courses`

Danh sách khóa học + trạng thái đăng ký của con.

#### Response `200`
```json
{
  "child": { "id": "...", "nickname": "...", "ageBand": "9-11" },
  "courses": [{
    "id": "k1-ai-world", "title": "...", "status": "open",
    "enrolled": true,
    "parentAllowed": true    // null = không có override, true/false = parent quyết định
  }]
}
```

---

### `POST /api/parent/children/:childId/courses`

Đăng ký hoặc hủy đăng ký khóa học cho con.

#### Request Body
```json
{
  "courseId": "k1-ai-world",
  "enroll": true    // true = đăng ký, false = hủy
}
```

#### Response `200` / `201`
```json
{ "ok": true, "enrolled": true, "courseId": "k1-ai-world" }
```

---

### `GET /api/parent/approvals`

Danh sách yêu cầu duyệt chia sẻ project của con.

#### Query Parameters
| Param | Type | Mô tả |
|-------|------|-------|
| `status` | `string` | `pending` (mặc định), `approved`, `rejected`, `all` |

#### Response `200`
```json
{
  "approvals": [{
    "id": "...", "status": "pending", "destination": "portfolio",
    "note": null, "createdAt": "...",
    "project": { "id": "...", "title": "...", "kind": "image", "thumbnail": "...", "shareStatus": "private" },
    "child": { "id": "...", "nickname": "BaoAnh", "avatarId": "..." }
  }]
}
```

---

### `POST /api/parent/approvals/:id/decide`

Duyệt hoặc từ chối yêu cầu chia sẻ.

#### Request Body
```json
{
  "decision": "approved",    // "approved" | "rejected"
  "note": "Ba chấp thuận!"   // optional, max 200
}
```

#### Response `200`
```json
{
  "approval": { "id": "...", "status": "approved", "note": "..." },
  "projectShareStatus": "shared"
}
```

---

### `POST /api/parent/gate/verify`

Con xác minh mật khẩu của ba/mẹ để chuyển về session phụ huynh.  
**Auth:** `role: student` *(gọi từ session con)*

#### Request Body
```json
{ "password": "ParentAbc123" }
```

#### Response `200`
```json
{
  "user": { "id": "...", "role": "parent", ... },
  "message": "Chào ba/mẹ! BaoAnh đang chờ ba/mẹ nhé."
}
```

#### Errors
| Code | Nguyên nhân |
|------|------------|
| `401` | Mật khẩu sai |
| `422` | Ba/mẹ dùng Google login (không có password) — `{ "useGoogle": true }` |
| `429` | Quá 5 lần sai — khóa 5 phút |

---

## 👩‍🏫 Teacher

> **Base:** `/api/teacher`  
> **Auth:** `role: teacher` (một số endpoint cho phép `admin`)

---

### `GET /api/teacher/class`

Xem thông tin lớp học + danh sách học sinh.

#### Response `200`
```json
{
  "classroom": {
    "id": "...", "name": "Lớp 3A", "code": "XYZ789",
    "students": [{ "id": "...", "nickname": "...", "level": 2, "xp": 200 }]
  }
}
```

---

### `POST /api/teacher/class`

Tạo lớp học mới.

#### Request Body
```json
{ "name": "Lớp 3A", "courseId": "k1-ai-world" }
```

---

### `POST /api/teacher/class/students`

Thêm học sinh vào lớp bằng nickname.

#### Request Body
```json
{ "nickname": "BaoAnh" }
```

---

### `DELETE /api/teacher/class/students/:studentId`

Xóa học sinh khỏi lớp.

---

### `GET /api/teacher/class/stats`

Thống kê học tập của toàn lớp.

#### Response `200`
```json
{
  "stats": {
    "totalStudents": 20,
    "completedToday": 5,
    "averageStars": 1.8,
    "topStudents": [...]
  }
}
```

---

### `GET /api/teacher/console`

Bảng điều khiển tổng quan giáo viên (số liệu nhanh).

---

### `GET /api/teacher/profile`

Xem profile giáo viên.

#### Response `200`
```json
{
  "profile": {
    "displayName": "Cô Linh",
    "bio": "...",
    "avatarUrl": "...",
    "subjects": ["AI", "Kể chuyện"]
  }
}
```

---

### `PATCH /api/teacher/profile`

Cập nhật profile giáo viên.

#### Request Body
```json
{
  "displayName": "Cô Linh",
  "bio": "Giáo viên AI trẻ em",
  "subjects": ["AI", "Sáng tạo"]
}
```

---

### `GET /api/teacher/courses`

Danh sách khóa học giáo viên quản lý.

---

### `POST /api/teacher/courses`

Tạo khóa học (teacher-managed).

---

### `PATCH /api/teacher/courses/:courseId`

Cập nhật khóa học.

---

### `GET /api/teacher/lectures`

Danh sách quests/lectures trong khóa của lớp.

#### Response `200`
```json
{
  "quests": [{
    "id": "...", "order": 1, "title": "Giới thiệu AI",
    "skill": "Tư duy AI", "practiceKind": "intro",
    "videoUrl": "https://...", "archived": false
  }]
}
```

---

### `POST /api/teacher/lectures`

Tạo bài giảng (quest) mới.

#### Request Body
```json
{
  "title": "Giới thiệu AI",
  "skill": "Tư duy AI",
  "reward": "Huy hiệu Nhà thám hiểm",
  "duration": "15 phút",
  "hook": "Hôm nay con sẽ gặp AI lần đầu tiên!",
  "accent": "#FF6B6B",
  "practiceKind": "intro",
  "videoUrl": "https://youtube.com/...",
  "goals": ["Hiểu AI là gì", "Tạo nhân vật đầu tiên"],
  "concept": "AI là trí tuệ nhân tạo...",
  "example": "Ví dụ: sắp xếp ảnh theo màu...",
  "gameType": "match",
  "gameInstruction": "Nối đúng cặp!",
  "gameCards": ["AI", "Máy tính học", "Robot", "Con người"],
  "practiceInstruction": "Vẽ nhân vật AI của con...",
  "product": "Nhân vật AI đầu tiên",
  "checkQuestion": "AI là gì?",
  "checkOptions": ["Chương trình học từ dữ liệu", "Chỉ là robot", "Không học được gì"],
  "correctIndex": 0,
  "checkExplain": "Đúng rồi! AI học từ dữ liệu.",
  "order": 1
}
```

---

### `PATCH /api/teacher/lectures/:questId`

Cập nhật bài giảng.

---

### `DELETE /api/teacher/lectures/:questId`

Lưu trữ (archive) bài giảng.

---

### `POST /api/teacher/lectures/:questId/restore`

Khôi phục bài giảng đã archive.

---

### `POST /api/teacher/lectures/reorder`

Sắp xếp lại thứ tự bài giảng.

#### Request Body
```json
{ "questIds": ["quest-1", "quest-3", "quest-2"] }
```

---

### `GET /api/teacher/students/:studentId/progress`

Xem tiến độ chi tiết của một học sinh.

---

### `GET /api/teacher/students/:studentId/learning-overview`

Tổng quan học tập của học sinh (skills, strengths, gaps).

---

### `GET /api/teacher/question-bank`

Xem ngân hàng câu hỏi của giáo viên.

---

### `POST /api/teacher/question-bank`

Tạo câu hỏi mới.

#### Request Body
```json
{
  "text": "AI là gì?",
  "type": "multiple_choice",
  "options": ["Học từ dữ liệu", "Chỉ robot", "Không học được"],
  "correctIndex": 0,
  "explanation": "AI học từ dữ liệu.",
  "points": 10,
  "tags": ["AI", "cơ bản"]
}
```

---

### `POST /api/teacher/question-bank/:questionId/versions`

Tạo phiên bản mới cho câu hỏi.

---

### `GET /api/teacher/assessments`

Danh sách bài kiểm tra.

---

### `POST /api/teacher/assessments`

Tạo bài kiểm tra mới.

---

### `POST /api/teacher/assessments/:assessmentId/versions`

Tạo phiên bản mới cho bài kiểm tra.

---

### `GET /api/teacher/grading/queue`

Hàng đợi chấm điểm thủ công.

---

### `PATCH /api/teacher/grading/reviews/:reviewId`

Cập nhật đánh giá thủ công.

---

### `POST /api/teacher/grading/attempts/:attemptId/request-resubmission`

Yêu cầu học sinh làm lại bài.

---

### `POST /api/teacher/grading/attempts/:attemptId/publish`

Công bố kết quả bài kiểm tra.

---

### `POST /api/teacher/observations`

Ghi nhận quan sát về học sinh.

---

### `PATCH /api/teacher/observations/:observationId`

Cập nhật ghi nhận quan sát.

---

## 🎮 Gamification

> **Base:** `/api/gamification`  
> **Auth:** `role: student`

---

### `GET /api/gamification/streak`

Xem chuỗi ngày học liên tiếp.

#### Response `200`
```json
{
  "streak": { "current": 5, "longest": 12, "lastCheckIn": "2026-07-26" }
}
```

---

### `POST /api/gamification/check-in`

Điểm danh học hàng ngày.

#### Response `200`
```json
{ "streak": 6, "xpGained": 10, "message": "Tuyệt vời! 6 ngày liên tiếp!" }
```

---

### `GET /api/gamification/class-celebration`

Xem sự kiện ăn mừng của lớp.

---

### `GET /api/gamification/achievements`

Danh sách thành tích và huy hiệu.

#### Response `200`
```json
{
  "achievements": [{
    "id": "first-quest", "title": "Nhà thám hiểm",
    "description": "Hoàn thành quest đầu tiên",
    "earnedAt": "2026-07-20", "icon": "🚀"
  }]
}
```

---

### `GET /api/gamification/daily-mission`

Nhiệm vụ hàng ngày.

#### Response `200`
```json
{
  "mission": {
    "description": "Hoàn thành 1 quest hôm nay",
    "completed": false,
    "xpReward": 30,
    "resetsAt": "2026-07-28T00:00:00.000Z"
  }
}
```

---

## 🎨 Creative

> **Base:** `/api/creative`  
> **Auth:** `role: student`  
> **Yêu cầu:** Vidtory AI phải được cấu hình.

---

### `POST /api/creative/sketch`

Tạo phác thảo AI (image generation).

#### Request Body
```json
{
  "prompt": "Một robot nhỏ đang học bài",
  "style": "cartoon",
  "aspect": "1:1"
}
```

#### Response `200`
```json
{
  "imageUrl": "https://...",
  "mediaId": "..."
}
```

---

### `POST /api/creative/create`

Tạo project sáng tạo đầy đủ (image/video AI generation).

#### Request Body
```json
{
  "type": "image",
  "prompt": "Câu chuyện về robot học bài",
  "questId": "..."
}
```

#### Response `200`
```json
{
  "project": { "id": "...", "kind": "image", "status": "generating" },
  "mediaUrl": "https://..."
}
```

---

## 🏆 Competency & Credentials

---

### `GET /api/competency-map`

Bản đồ năng lực của học sinh hiện tại.  
**Auth:** `role: student`

#### Response `200`
```json
{
  "competencies": [{
    "skill": "Kể chuyện AI", "level": 2, "progress": 75,
    "evidences": ["quest-3", "quest-5"]
  }]
}
```

---

### `GET /api/credentials`

Danh sách chứng chỉ đã được cấp.  
**Auth:** `role: student`

---

### `POST /api/credentials/issue`

Cấp chứng chỉ mới.  
**Auth:** `role: teacher | admin`

---

### `GET /api/credentials/:credentialId/pdf`

Tải chứng chỉ dưới dạng PDF.

---

### `GET /api/backpack`

Hành trang học sinh: tất cả huy hiệu + chứng chỉ.  
**Auth:** `role: student`

#### Response `200`
```json
{
  "badges": [{ "id": "...", "title": "Nhà thám hiểm", "earnedAt": "..." }],
  "credentials": [{ "id": "...", "title": "Hoàn thành K1", "issuedAt": "..." }]
}
```

---

### `POST /api/enrollments`

Đăng ký khóa học (student tự enroll).  
**Auth:** `role: student`

#### Request Body
```json
{ "courseId": "k1-ai-world" }
```

#### Response `201`
```json
{ "enrollment": { "courseId": "...", "enrolledAt": "..." } }
```

---

## 📁 Portfolio & Projects

---

### `GET /api/projects`

Danh sách project của học sinh hiện tại.  
**Auth:** `role: student`

#### Response `200`
```json
{
  "projects": [{
    "id": "...", "title": "Robot của con",
    "kind": "image", "thumbnail": "https://...",
    "shareStatus": "private", "createdAt": "..."
  }]
}
```

---

### `POST /api/projects/:projectId/request-share`

Gửi yêu cầu chia sẻ project lên ba/mẹ duyệt.  
**Auth:** `role: student`

#### Request Body
```json
{ "destination": "portfolio", "note": "Con muốn khoe bức tranh này!" }
```

#### Response `200`
```json
{
  "approval": { "id": "...", "status": "pending" },
  "message": "Đã gửi yêu cầu tới ba/mẹ!"
}
```

---

## 🔔 Notifications

> **Base:** `/api/notifications`  
> **Auth:** Đăng nhập (mọi role)

---

### `GET /api/notifications`

Danh sách thông báo của user hiện tại.

#### Response `200`
```json
{
  "notifications": [{
    "id": "...", "type": "approval_result", "title": "Ba/mẹ đã duyệt!",
    "body": "Ảnh 'Robot của con' đã được chia sẻ.",
    "read": false, "createdAt": "..."
  }],
  "unreadCount": 3
}
```

---

### `PATCH /api/notifications/:id/read`

Đánh dấu đã đọc một thông báo.

#### Response `200`
```json
{ "ok": true }
```

---

### `POST /api/notifications/read-all`

Đánh dấu tất cả thông báo đã đọc.

#### Response `200`
```json
{ "ok": true, "markedCount": 5 }
```

---

### `POST /api/notifications/devices`

Đăng ký thiết bị nhận push notification (FCM token).

#### Request Body
```json
{ "token": "fcm-token-...", "platform": "web" }
```

---

### `DELETE /api/notifications/devices`

Hủy đăng ký thiết bị.

#### Request Body
```json
{ "token": "fcm-token-..." }
```

---

## 🖼️ Media & Storage

---

### `GET /api/media/refs`

Danh sách media references (ảnh/video được dùng trong các quest).  
**Auth:** `role: student | teacher`

---

### `GET /api/media/mine`

Danh sách media do user hiện tại tạo ra.  
**Auth:** `role: student`

---

### `POST /api/media/promote`

Chuyển media từ draft thành chính thức (gắn vào project).  
**Auth:** `role: student`

---

### `POST /api/media/upload`

Upload file media trực tiếp.  
**Auth:** `role: student | teacher`  
**Content-Type:** `multipart/form-data`

---

### `POST /api/storage/uploads`

Khởi tạo upload lớn (presigned URL flow).  
**Auth:** `role: student | teacher`

#### Request Body
```json
{
  "filename": "my-art.png",
  "contentType": "image/png",
  "size": 1048576
}
```

#### Response `200`
```json
{
  "uploadId": "...",
  "uploadUrl": "https://storage.../presigned",
  "expiresAt": "..."
}
```

---

### `POST /api/storage/uploads/:id/finalize`

Xác nhận hoàn thành upload.

#### Response `200`
```json
{ "mediaId": "...", "url": "https://cdn...." }
```

---

### `GET /api/storage/uploads/:id/read-url`

Lấy URL đọc file (signed URL).

#### Response `200`
```json
{ "readUrl": "https://...", "expiresAt": "..." }
```

---

## 📅 Schedule

> **Base:** `/api/schedule`

---

### `GET /api/schedule`

Xem lịch học của user hiện tại.

#### Response `200`
```json
{
  "sessions": [{
    "id": "...", "classId": "...", "scheduledAt": "...",
    "durationMinutes": 45, "status": "scheduled"
  }]
}
```

---

### `POST /api/schedule/classes`

Tạo lớp học có lịch.  
**Auth:** `role: teacher`

---

### `POST /api/schedule/classes/:classId/sessions`

Đặt lịch buổi học cho lớp.  
**Auth:** `role: teacher`

#### Request Body
```json
{
  "scheduledAt": "2026-08-01T08:00:00.000Z",
  "durationMinutes": 45
}
```

---

### `POST /api/schedule/placement-requests`

Học sinh/phụ huynh đặt yêu cầu xếp lớp.

#### Request Body
```json
{
  "preferredTime": "morning",
  "note": "Con thích học buổi sáng"
}
```

---

### `GET /api/schedule/placement-requests`

Xem danh sách yêu cầu xếp lớp.

---

### `POST /api/schedule/placement-requests/:placementId/decide`

Giáo viên/admin quyết định xếp lớp.

#### Request Body
```json
{ "decision": "approved", "classId": "..." }
```

---

### `GET /api/schedule/sessions/:sessionId/attendance`

Xem điểm danh buổi học.

---

### `PUT /api/schedule/sessions/:sessionId/attendance`

Cập nhật điểm danh buổi học.

#### Request Body
```json
{
  "attendance": [
    { "studentId": "...", "present": true },
    { "studentId": "...", "present": false }
  ]
}
```

---

### `POST /api/schedule/reschedule-requests`

Gửi yêu cầu đổi lịch.

---

### `GET /api/schedule/reschedule-requests`

Xem danh sách yêu cầu đổi lịch.

---

### `POST /api/schedule/reschedule-requests/:rescheduleId/decide`

Giáo viên quyết định yêu cầu đổi lịch.

---

## 📊 Report

> **Base:** `/api/reports`

---

### `GET /api/report-policies/active`

Danh sách chính sách báo cáo đang hoạt động.

---

### `GET /api/reports`

Danh sách báo cáo của user hiện tại.

---

### `POST /api/reports/generate`

Tạo báo cáo mới.

#### Request Body
```json
{
  "type": "monthly_progress",
  "childId": "...",
  "period": "2026-07"
}
```

---

### `GET /api/reports/:id`

Xem chi tiết báo cáo.

---

### `POST /api/reports/:id/refresh`

Làm mới dữ liệu báo cáo.

---

### `POST /api/reports/:id/submit-review`

Nộp báo cáo để review.

---

### `POST /api/reports/:id/approve`

Phê duyệt báo cáo.

---

### `POST /api/reports/:id/publish`

Công bố báo cáo.

---

### `GET /api/reports/:id/pdf`

Tải báo cáo PDF.

---

## ⚡ Realtime

---

### `POST /api/realtime/classrooms/:classId/events`

Gửi sự kiện realtime vào lớp học (teacher push events đến học sinh).  
**Auth:** `role: teacher`

#### Request Body
```json
{
  "type": "celebration",
  "data": { "message": "Xuất sắc! Cả lớp hoàn thành nhiệm vụ!" }
}
```

#### Response `200`
```json
{ "ok": true, "delivered": 15 }
```

---

## 🌐 Public

> *Không cần đăng nhập.*

---

### `GET /api/public/credentials/:verificationCode`

Xác minh chứng chỉ công khai (chia sẻ bên ngoài hệ thống).

#### Response `200`
```json
{
  "credential": {
    "title": "Hoàn thành K1 - Thế giới AI",
    "studentName": "BaoAnh",
    "issuedAt": "2026-07-01",
    "valid": true,
    "issuer": "AIKids Creator Academy"
  }
}
```

---

### `GET /api/quests/:questId`

Xem thông tin quest (catalog public).  
**Auth:** Cần đăng nhập nhưng mọi role.

#### Response `200`
```json
{
  "quest": {
    "id": "...", "title": "Giới thiệu AI", "skill": "Tư duy AI",
    "duration": "15 phút", "practiceKind": "intro", "order": 1
  }
}
```

---

## ❤️ Health

---

### `GET /api/health`

Health check endpoint (public, không cần auth).

#### Response `200`
```json
{ "status": "ok", "service": "aikids-api", "time": "2026-07-27T06:00:00.000Z" }
```

---

## 📊 Thống kê tổng hợp

```
Tổng endpoint:     ~135
Routes file:       19 modules (routes-tree.txt)
Auth mechanisms:   Cookie session + Role-based (RBAC)
Security:          OWASP A01, A03, A07 (brute-force, injection, audit)
Validation:        Zod schemas trên mọi input
Database:          Prisma ORM → PostgreSQL
Cache:             Redis (brute-force counters, session cache)
AI:                Vidtory API (image/video generation)
```

---

*Tài liệu được tạo từ source code thực tế — `apps/api/src/modules/**/*.routes.ts` + `routes-tree.txt`*
