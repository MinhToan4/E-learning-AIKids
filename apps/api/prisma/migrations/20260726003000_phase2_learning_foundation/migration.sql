ALTER TABLE "users"
  ADD COLUMN "birth_date" DATE,
  ADD COLUMN "age_band" TEXT NOT NULL DEFAULT 'unassigned';

ALTER TABLE "quests"
  ADD COLUMN "content_version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "offline_allowed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "offline_max_age_hours" INTEGER NOT NULL DEFAULT 72,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "users"
  ADD CONSTRAINT "users_age_band_check"
  CHECK ("age_band" IN ('unassigned', '6_8', '9_11', '11_plus'));

ALTER TABLE "quests"
  ADD CONSTRAINT "quests_offline_max_age_hours_check"
  CHECK ("offline_max_age_hours" BETWEEN 1 AND 720);

CREATE TABLE "age_experience_policies" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "age_band" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "allowed_course_tracks" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "ui_policy_json" JSONB NOT NULL DEFAULT '{}',
  "copy_policy_json" JSONB NOT NULL DEFAULT '{}',
  "permission_policy_json" JSONB NOT NULL DEFAULT '{}',
  "assessment_policy_json" JSONB NOT NULL DEFAULT '{}',
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "published_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "age_experience_policies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "age_experience_policies_age_band_version_key"
    UNIQUE ("age_band", "version"),
  CONSTRAINT "age_experience_policies_age_band_check"
    CHECK ("age_band" IN ('6_8', '9_11', '11_plus')),
  CONSTRAINT "age_experience_policies_status_check"
    CHECK ("status" IN ('draft', 'published', 'archived'))
);

CREATE INDEX "age_experience_policies_age_band_status_version_idx"
  ON "age_experience_policies"("age_band", "status", "version");

CREATE TABLE "course_path_rules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "course_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "prerequisite_course_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "min_completion_percent" INTEGER NOT NULL DEFAULT 100,
  "min_final_score" DOUBLE PRECISION,
  "allowed_age_bands" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "available_from" TIMESTAMP(3),
  "next_course_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "created_by_id" UUID,
  "published_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_path_rules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "course_path_rules_course_id_version_key"
    UNIQUE ("course_id", "version"),
  CONSTRAINT "course_path_rules_completion_check"
    CHECK ("min_completion_percent" BETWEEN 0 AND 100),
  CONSTRAINT "course_path_rules_status_check"
    CHECK ("status" IN ('draft', 'published', 'archived')),
  CONSTRAINT "course_path_rules_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "course_path_rules_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "course_path_rules_course_id_status_idx"
  ON "course_path_rules"("course_id", "status");

CREATE TABLE "course_unlock_overrides" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id" UUID NOT NULL,
  "course_id" TEXT NOT NULL,
  "allowed" BOOLEAN NOT NULL,
  "reason" TEXT NOT NULL,
  "actor_id" UUID NOT NULL,
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_unlock_overrides_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "course_unlock_overrides_student_id_course_id_key"
    UNIQUE ("student_id", "course_id"),
  CONSTRAINT "course_unlock_overrides_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "course_unlock_overrides_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "course_unlock_overrides_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "course_unlock_overrides_actor_id_created_at_idx"
  ON "course_unlock_overrides"("actor_id", "created_at");

CREATE TABLE "lesson_notes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "quest_id" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "anchor_type" TEXT NOT NULL,
  "anchor_value" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lesson_notes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lesson_notes_anchor_type_check"
    CHECK ("anchor_type" IN ('video', 'section', 'slide', 'activity')),
  CONSTRAINT "lesson_notes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lesson_notes_quest_id_fkey"
    FOREIGN KEY ("quest_id") REFERENCES "quests"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "lesson_notes_user_id_quest_id_updated_at_idx"
  ON "lesson_notes"("user_id", "quest_id", "updated_at");

CREATE TABLE "lesson_bookmarks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "quest_id" TEXT NOT NULL,
  "label" TEXT,
  "anchor_type" TEXT NOT NULL,
  "anchor_value" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lesson_bookmarks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lesson_bookmarks_anchor_type_check"
    CHECK ("anchor_type" IN ('video', 'section', 'slide', 'activity')),
  CONSTRAINT "lesson_bookmarks_user_id_quest_id_anchor_type_anchor_value_key"
    UNIQUE ("user_id", "quest_id", "anchor_type", "anchor_value"),
  CONSTRAINT "lesson_bookmarks_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lesson_bookmarks_quest_id_fkey"
    FOREIGN KEY ("quest_id") REFERENCES "quests"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "lesson_bookmarks_user_id_quest_id_created_at_idx"
  ON "lesson_bookmarks"("user_id", "quest_id", "created_at");

CREATE TABLE "lesson_resumes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "quest_id" TEXT NOT NULL,
  "percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "position_seconds" INTEGER NOT NULL DEFAULT 0,
  "section_id" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "last_occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lesson_resumes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lesson_resumes_user_id_quest_id_key"
    UNIQUE ("user_id", "quest_id"),
  CONSTRAINT "lesson_resumes_percent_check"
    CHECK ("percent" BETWEEN 0 AND 100),
  CONSTRAINT "lesson_resumes_position_check"
    CHECK ("position_seconds" >= 0),
  CONSTRAINT "lesson_resumes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lesson_resumes_quest_id_fkey"
    FOREIGN KEY ("quest_id") REFERENCES "quests"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "lesson_resumes_user_id_updated_at_idx"
  ON "lesson_resumes"("user_id", "updated_at");

CREATE TABLE "offline_grants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "quest_id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "content_version" INTEGER NOT NULL,
  "manifest_json" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "offline_grants_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "offline_grants_user_id_quest_id_device_id_key"
    UNIQUE ("user_id", "quest_id", "device_id"),
  CONSTRAINT "offline_grants_status_check"
    CHECK ("status" IN ('active', 'expired', 'revoked', 'stale')),
  CONSTRAINT "offline_grants_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "offline_grants_quest_id_fkey"
    FOREIGN KEY ("quest_id") REFERENCES "quests"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "offline_grants_status_expires_at_idx"
  ON "offline_grants"("status", "expires_at");

CREATE TABLE "offline_progress_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "quest_id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "client_event_id" TEXT NOT NULL,
  "percent" DOUBLE PRECISION NOT NULL,
  "position_seconds" INTEGER NOT NULL,
  "section_id" TEXT,
  "occurred_at" TIMESTAMP(3) NOT NULL,
  "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "offline_progress_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "offline_progress_events_user_id_device_id_client_event_id_key"
    UNIQUE ("user_id", "device_id", "client_event_id"),
  CONSTRAINT "offline_progress_events_percent_check"
    CHECK ("percent" BETWEEN 0 AND 100),
  CONSTRAINT "offline_progress_events_position_check"
    CHECK ("position_seconds" >= 0),
  CONSTRAINT "offline_progress_events_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "offline_progress_events_quest_id_fkey"
    FOREIGN KEY ("quest_id") REFERENCES "quests"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "offline_progress_events_user_id_quest_id_occurred_at_idx"
  ON "offline_progress_events"("user_id", "quest_id", "occurred_at");

CREATE TABLE "audit_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" UUID,
  "action" TEXT NOT NULL,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "reason" TEXT,
  "before_json" JSONB,
  "after_json" JSONB,
  "request_id" TEXT,
  "ip_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_events_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "audit_events_target_type_target_id_created_at_idx"
  ON "audit_events"("target_type", "target_id", "created_at");
CREATE INDEX "audit_events_actor_id_created_at_idx"
  ON "audit_events"("actor_id", "created_at");
CREATE INDEX "audit_events_action_created_at_idx"
  ON "audit_events"("action", "created_at");
