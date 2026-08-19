# Parent learning gateway contract

Frontend owner: AI Kids web. Backend owner: `core-lms`, exposed only through StoryMee Hub.

The current compatibility routes provide enrollments, lesson progress, pathway, credentials and teacher feedback. They do not provide trustworthy learning duration, event timestamps, weekly goals or interruption alerts. The browser must not infer or persist those fields.

## Authorization and privacy

- Every route requires a parent context and server-side parent-child ownership verification.
- Return `403` when the child is outside the authenticated family; do not return an empty payload.
- Child identity is nickname/avatar only. Do not include child email, phone, PIN, access token or private free-form content.
- Activity is family-private and must not be used to create a public/global leaderboard.
- Event pagination must use an opaque cursor.

## Learning summary

`GET /api/v1/lms/family/children/:childId/learning-summary`

```json
{
  "child": { "id": "child-id", "nickname": "Bo", "avatarUrl": null },
  "activeEnrollment": {
    "id": "enrollment-id",
    "courseId": "course-id",
    "courseTitle": "Khám phá AI",
    "completionPercent": 42,
    "currentLesson": { "id": "lesson-id", "title": "Trạm 4", "phase": "practice" }
  },
  "week": {
    "sessionsCompleted": 2,
    "learningMinutes": 38,
    "goalSessions": 3,
    "lastActivityAt": "2026-08-17T01:30:00.000Z"
  },
  "attention": {
    "unreadFeedbackCount": 1,
    "pendingApprovalCount": 0,
    "inactiveDays": 2,
    "recommendedAction": "continue_current_lesson"
  }
}
```

All counts and recommendations are computed by the owning services. `null` means unavailable; it must not be converted to zero.

## Activity timeline

`GET /api/v1/lms/family/children/:childId/activity?courseId=:courseId&cursor=:cursor&limit=20`

```json
{
  "events": [
    {
      "id": "event-id",
      "kind": "lesson_completed",
      "occurredAt": "2026-08-17T01:30:00.000Z",
      "course": { "id": "course-id", "title": "Khám phá AI" },
      "lesson": { "id": "lesson-id", "title": "Trạm 3" },
      "phase": "check",
      "durationMinutes": 18,
      "stars": 3,
      "xpEarned": 40
    }
  ],
  "nextCursor": null
}
```

Allowed `kind` values: `lesson_started`, `phase_completed`, `lesson_completed`, `credential_issued`, `teacher_feedback_published`, `creation_submitted`, `creation_approved`.

Do not expose raw prompts, answers, media bodies or teacher-only notes in this feed.

## Weekly goal

`GET /api/v1/lms/family/children/:childId/weekly-goal`

`PUT /api/v1/lms/family/children/:childId/weekly-goal`

```json
{
  "sessionsPerWeek": 3,
  "reminderDays": [1, 3, 6],
  "reminderLocalTime": "19:00",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

Validation belongs to `core-lms`: 1-7 sessions, unique weekdays 0-6, valid IANA timezone and local `HH:mm`. A weekly goal is encouragement, not an unlock rule or authorization control.

## Learning time policy

`GET /api/v1/lms/family/children/:childId/time-policy`

`PUT /api/v1/lms/family/children/:childId/time-policy`

```json
{
  "mode": "remind",
  "dailyLimitMinutes": 45,
  "sessionLimitMinutes": 25,
  "breakAfterMinutes": 20,
  "allowedWindows": [{ "weekday": 1, "start": "18:00", "end": "20:00" }],
  "timezone": "Asia/Ho_Chi_Minh"
}
```

Allowed modes are `off`, `remind` and `block`. The default is `remind`. Hard limits must be enforced by `core-lms` at session start, phase transitions and lesson unlock; a browser timer is not authoritative. Offline events must reconcile against the server policy without deleting learning evidence.

## Analytics summary

`GET /api/v1/lms/family/children/:childId/analytics?range=7d|30d|90d`

The response provides server-computed active learning time and trends. Background tab time and idle time must not count as active learning.

```json
{
  "range": "7d",
  "totals": {
    "activeMinutes": 62,
    "sessions": 4,
    "lessonsCompleted": 3,
    "averageSessionMinutes": 15
  },
  "daily": [
    { "date": "2026-08-17", "activeMinutes": 18, "sessions": 1, "lessonsCompleted": 1 }
  ],
  "comparison": { "activeMinutesPercent": 18, "lessonsCompletedDelta": 1 },
  "attention": [{ "code": "repeated_check_pause", "count": 2, "courseId": "course-id" }]
}
```

Analytics is descriptive, not a learner score. High duration must not be interpreted as high competency.

## Competency evidence pipeline

Learning events are immutable inputs. Competency snapshots are derived outputs:

`learning event -> evidence -> versioned skill mapping -> competency snapshot`

Each qualifying event must include `eventId`, learner/enrollment/course/lesson identifiers, phase, kind, `occurredAt`, `activeSeconds`, result summary and `mappingVersion`. Raw answers, prompts and private media must not be copied into the parent analytics feed.

```json
{
  "eventId": "event-id",
  "learnerId": "child-id",
  "enrollmentId": "enrollment-id",
  "courseId": "course-id",
  "lessonId": "lesson-id",
  "phase": "check",
  "kind": "phase_completed",
  "occurredAt": "2026-08-17T01:30:00.000Z",
  "activeSeconds": 720,
  "result": { "scorePercent": 82, "attemptCount": 2, "completed": true },
  "mappingVersion": "ai-competency-v2"
}
```

Evidence records reference their source event and skill. They are append-only and retain the mapping version used at calculation time. Reprocessing creates a new snapshot instead of rewriting history.

```json
{
  "skillId": "prompt-iteration",
  "sourceEventId": "event-id",
  "evidenceType": "assessment",
  "value": 0.82,
  "weight": 0.7,
  "observedAt": "2026-08-17T01:30:00.000Z"
}
```

Parent competency responses must expose level, evidence count, last observation and trend, while keeping `no_data` distinct from `not_met`. Frameworks and mappings are backend-published and versioned; the frontend must never invent skill names or thresholds.

## Enrollment follow-up

Billing and LMS use three separate concepts:

- **Plan** (`core-billing`): family limits and commercial entitlement, including `maxChildren` and `maxOpenCoursesPerChild`.
- **Program** (`core-lms`): a catalog grouping of ordered course regions; it is not itself proof of access.
- **Enrollment** (`core-lms`): the canonical child-to-course access record that places one region in the child's pathway.

The parent UI must show plan consumption as `open enrolled courses / maxOpenCoursesPerChild` for each child. Completed or paused enrollment history is retained; plan changes must not delete progress. Billing checkout success is not sufficient to display access until LMS confirms entitlement/enrollment.

Paid plan selection uses `POST /api/v1/billing/me/checkout` with an idempotency key. The UI displays the returned payment URL or transfer hint, then reloads the canonical subscription only after Billing reports the new plan active.

The current frontend compatibility route enrolls individual courses. Programs containing multiple regions need an atomic server operation before the frontend can promise all-or-nothing enrollment:

`POST /api/v1/lms/family/children/:childId/program-enrollments`

```json
{ "programId": "program-id" }
```

The response must return the canonical enrollment/entitlement state. Payment success alone must never grant learning access in the browser.
