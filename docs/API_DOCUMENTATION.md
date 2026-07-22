# E-learning AIKids - TOÀN BỘ API ROUTE MAP

Tài liệu này cung cấp danh sách đầy đủ và chi tiết 100% các API hiện có trong hệ thống, được sắp xếp khoa học theo đúng thứ tự logic miền nghiệp vụ. Các API đều bao gồm đầy đủ cấu trúc request và mô phỏng response.

---

## 1. AUTH MODULE (`/api/auth`)

### Đăng nhập Người lớn
Login for Parent, Teacher, or Admin using email and password.
Authorizations: None

**Request Body schema**: `application/json`
- `email` (string, email, required)
- `password` (string, min 8, required)

**Responses**
200 Logged in successfully.

`post`
`/api/auth/login/adult`

**Response samples**
200 - Content type: `application/json`
```json
{
  "user": {
    "id": "string",
    "email": "parent@example.com",
    "role": "parent",
    "nickname": "Phụ huynh",
    "avatarId": "string",
    "onboarded": true,
    "active": true
  }
}
```

### Đăng nhập Học sinh
Login for Students using nickname and optional PIN.
Authorizations: None

**Request Body schema**: `application/json`
- `nickname` (string, required)
- `avatarId` (string, optional)
- `pin` (string, 6 digits, optional)
- `createIfMissing` (boolean, optional)

**Responses**
200 Logged in successfully.

`post`
`/api/auth/login/student`

**Response samples**
200 - Content type: `application/json`
```json
{
  "user": {
    "id": "string",
    "role": "student",
    "nickname": "BeBo",
    "avatarId": "avatar-robot",
    "level": 1,
    "xp": 0,
    "onboarded": false,
    "active": true
  }
}
```

### Đăng nhập Google
Login or register using Google Single Sign-On.
Authorizations: None

**Request Body schema**: `application/json`
- `credential` (string, OIDC id_token, required)
- `role` (enum: ['parent', 'teacher'], default 'parent')

**Responses**
200 Logged in successfully.

`post`
`/api/auth/login/google`

### Lấy cấu hình Google SSO
Authorizations: None

`get`
`/api/auth/google/config`

### Đăng ký tài khoản Người lớn
Authorizations: None

**Request Body schema**: `application/json`
- `role` (enum: ['parent', 'teacher'], required)
- `email` (string, email, required)
- `password` (string, required)
- `nickname` (string, optional)

`post`
`/api/auth/register/adult`

### Đăng xuất
Authorizations: Cookie Session

`post`
`/api/auth/logout`

### Xem thông tin cá nhân (Me)
Authorizations: Cookie Session

`get`
`/api/auth/me`

### Cập nhật thông tin cá nhân (Me)
Authorizations: Cookie Session

**Request Body schema**: `application/json`
- `onboarded` (boolean, optional)
- `goal` (enum, optional)
- `nickname` (string, optional)
- `avatarId` (string, optional)

`patch`
`/api/auth/me`

### Quên mật khẩu
Authorizations: None

**Request Body schema**: `application/json`
- `email` (string, email, required)

`post`
`/api/auth/forgot-password`

### Đặt lại mật khẩu
Authorizations: None

**Request Body schema**: `application/json`
- `token` (string, required)
- `password` (string, required)

`post`
`/api/auth/reset-password`

### Thay đổi mật khẩu
Authorizations: Cookie Session

**Request Body schema**: `application/json`
- `currentPassword` (string, required)
- `newPassword` (string, required)

`post`
`/api/auth/change-password`

---

## 2. CATALOG MODULE (`/api/courses`)

### Lấy danh sách khóa học
Authorizations: Cookie Session

**query Parameters**
- `ageTrack` or `track` (string, optional, e.g. L1, L2)

**Responses**
200 List of courses.

`get`
`/api/courses`

**Response samples**
```json
{
  "courses": [
    {
      "id": "string",
      "title": "string",
      "quests": [],
      "enrolled": true,
      "questCount": 10
    }
  ],
  "tracks": {
    "L1": { "label": "6-8 tuổi", "count": 2 }
  }
}
```

### Xem chi tiết khóa học
Authorizations: Cookie Session

`get`
`/api/courses/:courseId`

### Xem thông tin nhiệm vụ (Quest)
Authorizations: Cookie Session

`get`
`/api/quests/:questId`

---

## 3. PROGRESS MODULE (`/api/progress`)

### Đăng ký khóa học
Authorizations: Cookie Session (Role: student)

**Request Body schema**: `application/json`
- `courseId` (string, required)

`post`
`/api/enrollments`

### Lấy tiến trình khóa học cá nhân
Authorizations: Cookie Session

**query Parameters**
- `childId` (string, optional - bắt buộc nếu là Phụ huynh hoặc Giáo viên)

`get`
`/api/progress/:courseId`

**Response samples**
```json
{
  "courseId": "string",
  "totalStars": 15,
  "totalXp": 1500,
  "completedCount": 3,
  "quests": [
    {
      "id": "string",
      "status": "completed",
      "phase": "check",
      "stars": 5,
      "xpEarned": 500
    }
  ]
}
```

### Bắt đầu nhiệm vụ
Authorizations: Cookie Session (Role: student)

`post`
`/api/progress/:questId/start`

### Chuyển sang trạm tiếp theo
Authorizations: Cookie Session (Role: student)

**Request Body schema**: `application/json`
- `fromPhase` (enum: ['learn', 'game', 'practice', 'check'], optional)

`post`
`/api/progress/:questId/advance`

### Nộp bài thực hành (Practice)
Authorizations: Cookie Session (Role: student)

**Request Body schema**: `application/json`
- `kind` (string, required, e.g. 'prompt', 'sketch', 'character')
- `payload` (object, required)

`post`
`/api/progress/:questId/practice`

### Nộp bài hoặc kiểm tra kết quả tại trạm hiện tại
Authorizations: Cookie Session (Role: student)

`post`
`/api/progress/:questId/check`

---

## 4. TEACHER MODULE (`/api/teacher`)

### Lấy thông tin lớp học của Giáo viên
Authorizations: Cookie Session (Role: teacher, admin)

`get`
`/api/teacher/class`

### Cập nhật / Tạo lớp học
Authorizations: Cookie Session (Role: teacher)

**Request Body schema**: `application/json`
- `name` (string, required)
- `code` (string, required)

`post`
`/api/teacher/class`

### Lấy danh sách bài giảng
Authorizations: Cookie Session (Role: teacher, admin)

`get`
`/api/teacher/lectures`

### Thêm bài giảng mới
Authorizations: Cookie Session (Role: teacher, admin)

`post`
`/api/teacher/lectures`

### Cập nhật bài giảng
Authorizations: Cookie Session (Role: teacher, admin)

`patch`
`/api/teacher/lectures/:questId`

### Xóa (ẩn) bài giảng
Authorizations: Cookie Session (Role: teacher, admin)

`delete`
`/api/teacher/lectures/:questId`

### Khôi phục bài giảng đã xóa
Authorizations: Cookie Session (Role: teacher, admin)

`post`
`/api/teacher/lectures/:questId/restore`

### Sắp xếp lại thứ tự bài giảng
Authorizations: Cookie Session (Role: teacher, admin)

`post`
`/api/teacher/lectures/reorder`

### Thêm học sinh vào lớp
Authorizations: Cookie Session (Role: teacher)

`post`
`/api/teacher/class/students`

### Xóa học sinh khỏi lớp
Authorizations: Cookie Session (Role: teacher, admin)

`delete`
`/api/teacher/class/students/:studentId`

### Xem tiến trình của một học sinh trong lớp
Authorizations: Cookie Session (Role: teacher, admin)

`get`
`/api/teacher/students/:studentId/progress`

### Lấy thông tin hồ sơ Giáo viên
Authorizations: Cookie Session (Role: teacher)

`get`
`/api/teacher/profile`

### Cập nhật hồ sơ Giáo viên
Authorizations: Cookie Session (Role: teacher)

`patch`
`/api/teacher/profile`

### Quản lý khóa học riêng của Giáo viên
`post` `/api/teacher/courses`
`patch` `/api/teacher/courses/:courseId`
`get` `/api/teacher/class/stats`

---

## 5. PARENT MODULE (`/api/parent`)

### Xem danh sách gói cước
`get` `/api/parent/plans`

### Lấy trạng thái đăng ký của gia đình
`get` `/api/parent/subscription`

### Kích hoạt / Thay đổi gói
`post` `/api/parent/subscription`
**Body**: `{"planCode": "family"}`

### Lấy danh sách tài khoản con cái
`get` `/api/parent/children`

### Thêm hồ sơ bé mới
`post` `/api/parent/children`
**Body**: `{"nickname": "Bin", "pin": "123456", "avatarId": "string"}`

### Chỉnh sửa hồ sơ bé
`patch` `/api/parent/children/:childId`

### Vô hiệu hóa tài khoản bé
`delete` `/api/parent/children/:childId`

### Theo dõi tiến trình học của bé
`get` `/api/parent/children/:childId/progress`

### Cổng bảo mật (Parent Gate - Chuyển quyền từ con sang mẹ)
`post` `/api/parent/gate/verify`
**Body**: `{"password": "string"}`

### Đăng nhập nhanh vào tài khoản bé
`post` `/api/parent/children/:childId/enter`
**Body**: `{"pin": "123456"}`

### Xem danh sách yêu cầu phê duyệt
`get` `/api/parent/approvals`

### Xử lý phê duyệt (Accept/Reject)
`post` `/api/parent/approvals/:id/decide`
**Body**: `{"decision": "approved", "note": "Giỏi lắm"}`

### Xem hồ sơ Phụ huynh
`get` `/api/parent/profile`

### Cập nhật hồ sơ Phụ huynh
`patch` `/api/parent/profile`

---

## 6. PORTFOLIO MODULE (`/api/backpack`, `/api/projects`)

### Xem Balo (Tài nguyên cá nhân)
`get` `/api/backpack`

### Xem Dự án cuối khóa
`get` `/api/projects`

### Xin phụ huynh chia sẻ dự án
`post` `/api/projects/:projectId/request-share`
**Body**: `{"destination": "family"}`

---

## 7. GAMIFICATION MODULE (`/api/gamification`)

### Xem chuỗi ngày học liên tục (Streak)
`get` `/api/gamification/streak`

### Điểm danh hàng ngày
`post` `/api/gamification/check-in`

### Lấy danh sách huy hiệu / thành tựu
`get` `/api/gamification/achievements`

### Bảng xếp hạng thi đua
`get` `/api/gamification/leaderboard`

---

## 8. MEDIA MODULE (`/api/media`)

### Free-form file upload (CMS / Curriculum)
Upload a media file with custom metadata.
Authorizations: Cookie Session (Role: teacher, admin)

**Request Body schema**: `multipart/form-data` hoặc `application/json` (nếu dùng JSON cần gửi `fileBase64`)
- `file` (binary/base64, required): File tải lên (max 20MB, image)
- `purpose` (string, optional): Mục đích sử dụng (vd: `cms_media`)
- `questId` (string, optional): ID nhiệm vụ học tập liên kết.

**Responses**
201 The file has been successfully uploaded.

`post`
`/api/media/upload`

**Response samples**
201 - Content type: `application/json`
```json
{
  "asset": {
    "id": "uuid-string",
    "url": "https://vidtory-cdn.../file.png",
    "mediaId": "string",
    "name": "cms-upload.png",
    "storageBackend": "vidtory_cdn",
    "note": "cms_or_admin_upload_only_not_student_freeform"
  }
}
```

### Promote an existing course asset
Promote an existing course asset to Vidtory media (get media id / CDN URL).
Authorizations: Cookie Session (Role: student, teacher, admin)

**Request Body schema**: `application/json`
- `assetId` (string, required): ID của asset cần promote.
- `purpose` (string, optional): Mục đích.

**Responses**
200 Successfully promoted or returned already promoted asset.

`post`
`/api/media/promote`

**Response samples**
200 - Content type: `application/json`
```json
{
  "asset": {
    "id": "uuid-string",
    "url": "https://...",
    "mediaId": "string",
    "storageBackend": "vidtory_cdn",
    "alreadyPromoted": false
  }
}
```

### List course-created assets (Refs)
List only course-created assets of the student (for ref picker).
Authorizations: Cookie Session

**Responses**
200 List of media files.

`get`
`/api/media/refs`

**Response samples**
200 - Content type: `application/json`
```json
{
  "assets": [
    {
      "id": "string",
      "name": "string",
      "type": "panel",
      "url": "string",
      "questId": "string",
      "private": true,
      "createdAt": "2023-10-01T12:00:00Z",
      "courseCreated": true,
      "hasVidtoryMediaId": false,
      "meta": {
        "purpose": "course_ref",
        "generationMode": "ai",
        "storageBackend": "inline_data_url"
      }
    }
  ],
  "policy": "only_course_created_assets_as_ai_refs_no_arbitrary_student_photos"
}
```

### List my media (Legacy)
Same as /refs (kept for older clients).
Authorizations: Cookie Session

**Responses**
200 List of media files.

`get`
`/api/media/mine`

---

## 9. NOTIFICATION MODULE (`/api/notifications`)

### Lấy danh sách thông báo
`get` `/api/notifications`

### Đánh dấu một thông báo đã đọc
`patch` `/api/notifications/:id/read`

### Đánh dấu tất cả đã đọc
`post` `/api/notifications/read-all`

---

## 10. ADMIN MODULE (`/api/admin`)
(Toàn bộ yêu cầu Role: `admin`)

### Kiểm tra hệ thống (Health & Stats)
`get` `/api/admin/system`

### Quản lý cấu hình API Vidtory (AI SDK)
`get` `/api/admin/settings/vidtory`
`put` `/api/admin/settings/vidtory` (Body: `{"apiKey": "...", "routing": {...}}`)
`delete` `/api/admin/settings/vidtory`

### Quản lý tài khoản (Users CRUD)
`get` `/api/admin/users`
`post` `/api/admin/users`
`patch` `/api/admin/users/:id`
`delete` `/api/admin/users/:id` (Vô hiệu hóa)

### Quản lý khóa học tổng
`get` `/api/admin/courses`
`post` `/api/admin/courses`
`patch` `/api/admin/courses/:courseId`

### Dashboard phân tích số liệu
`get` `/api/admin/analytics`

### Quản lý phiên đăng nhập
`get` `/api/admin/sessions`
`delete` `/api/admin/sessions/:id` (Ép đăng xuất)

### Quản trị toàn bộ lớp học
`get` `/api/admin/classrooms`
`delete` `/api/admin/classrooms/:id`

### Quản trị nhật ký đăng nhập
`get` `/api/admin/login-logs`
`delete` `/api/admin/login-logs` (Xóa log quá 24h)

---

## 11. HEALTH (`/api/health`)

### Kiểm tra trạng thái hệ thống
`get` `/api/health`

Phản hồi công khai chỉ có `data.status = "ready"`. Chi tiết cơ sở dữ liệu,
cache, nhà cung cấp và cấu hình không được công khai; quản trị viên xem trạng
thái nội bộ qua khu vực admin đã phân quyền.
