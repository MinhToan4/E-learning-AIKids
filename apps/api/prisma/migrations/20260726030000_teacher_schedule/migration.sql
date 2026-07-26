-- AlterTable
ALTER TABLE "classrooms" ADD COLUMN     "allowed_age_bands" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "class_type" TEXT NOT NULL DEFAULT 'group',
ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "course_id" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "max_level" INTEGER NOT NULL DEFAULT 99,
ADD COLUMN     "meeting_url" TEXT,
ADD COLUMN     "min_level" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "class_memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_memberships_pkey" PRIMARY KEY ("id")
);

-- Preserve the legacy one-class link as the first active membership.
INSERT INTO "class_memberships" ("class_id", "student_id")
SELECT "class_id", "id"
FROM "users"
WHERE "class_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- CreateTable
CREATE TABLE "schedule_policies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "class_type" TEXT NOT NULL,
    "max_capacity" INTEGER NOT NULL,
    "change_deadline_hours" INTEGER NOT NULL,
    "max_reschedules_per_period" INTEGER NOT NULL,
    "period_days" INTEGER NOT NULL,
    "reminder_offsets_minutes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "reminder_channels" TEXT[] DEFAULT ARRAY['in_app']::TEXT[],
    "absence_policy_json" JSONB NOT NULL DEFAULT '{}',
    "makeup_policy_json" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_id" UUID NOT NULL,
    "quest_id" TEXT,
    "title" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "location" TEXT,
    "meeting_url" TEXT,
    "enrollment_deadline" TIMESTAMP(3),
    "change_deadline" TIMESTAMP(3),
    "lesson_plan_json" JSONB NOT NULL DEFAULT '{}',
    "session_note" TEXT,
    "attendance_finalized_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_session_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "class_session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_revisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attendance_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "previous_status" TEXT,
    "new_status" TEXT NOT NULL,
    "previous_note" TEXT,
    "new_note" TEXT,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_placement_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "course_id" TEXT NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "target_class_id" UUID,
    "requested_level" INTEGER NOT NULL,
    "availability_json" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolution_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_placement_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reschedule_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "target_session_id" UUID,
    "student_id" UUID NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "preferred_starts_at" TIMESTAMP(3) NOT NULL,
    "preferred_ends_at" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "handled_by_id" UUID,
    "decision_reason" TEXT,
    "handled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reschedule_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_reminder_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "last_error" TEXT,
      "provider_message_id" TEXT,
      "next_attempt_at" TIMESTAMP(3),
      "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_reminder_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_observations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teacher_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "course_id" TEXT,
    "session_id" UUID,
    "body" TEXT NOT NULL,
    "strengths_json" JSONB NOT NULL DEFAULT '[]',
    "development_json" JSONB NOT NULL DEFAULT '[]',
    "score_percent" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_observations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_memberships_student_id_status_idx" ON "class_memberships"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "class_memberships_class_id_student_id_key" ON "class_memberships"("class_id", "student_id");

-- CreateIndex
CREATE INDEX "schedule_policies_class_type_status_idx" ON "schedule_policies"("class_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_policies_code_version_key" ON "schedule_policies"("code", "version");

-- CreateIndex
CREATE INDEX "class_sessions_class_id_starts_at_idx" ON "class_sessions"("class_id", "starts_at");

-- CreateIndex
CREATE INDEX "class_sessions_status_starts_at_idx" ON "class_sessions"("status", "starts_at");

-- CreateIndex
CREATE INDEX "class_sessions_quest_id_idx" ON "class_sessions"("quest_id");

-- CreateIndex
CREATE INDEX "attendance_records_student_id_updated_at_idx" ON "attendance_records"("student_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "class_session_participants_session_id_student_id_key" ON "class_session_participants"("session_id", "student_id");
CREATE INDEX "class_session_participants_student_id_status_idx" ON "class_session_participants"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_session_id_student_id_key" ON "attendance_records"("session_id", "student_id");

-- CreateIndex
CREATE INDEX "attendance_revisions_attendance_id_created_at_idx" ON "attendance_revisions"("attendance_id", "created_at");

-- CreateIndex
CREATE INDEX "attendance_revisions_actor_id_created_at_idx" ON "attendance_revisions"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "class_placement_requests_status_course_id_created_at_idx" ON "class_placement_requests"("status", "course_id", "created_at");

-- CreateIndex
CREATE INDEX "class_placement_requests_student_id_status_idx" ON "class_placement_requests"("student_id", "status");

-- CreateIndex
CREATE INDEX "reschedule_requests_student_id_status_created_at_idx" ON "reschedule_requests"("student_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "reschedule_requests_status_created_at_idx" ON "reschedule_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "reschedule_requests_target_session_id_idx" ON "reschedule_requests"("target_session_id");

-- CreateIndex
CREATE INDEX "session_reminder_deliveries_status_next_attempt_at_scheduled_for_idx" ON "session_reminder_deliveries"("status", "next_attempt_at", "scheduled_for");

-- CreateIndex
CREATE UNIQUE INDEX "session_reminder_deliveries_session_id_recipient_id_channel_key" ON "session_reminder_deliveries"("session_id", "recipient_id", "channel", "scheduled_for");

-- CreateIndex
CREATE INDEX "teacher_observations_student_id_status_updated_at_idx" ON "teacher_observations"("student_id", "status", "updated_at");

-- CreateIndex
CREATE INDEX "teacher_observations_teacher_id_updated_at_idx" ON "teacher_observations"("teacher_id", "updated_at");

-- CreateIndex
CREATE INDEX "classrooms_course_id_status_idx" ON "classrooms"("course_id", "status");

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_memberships" ADD CONSTRAINT "class_memberships_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_memberships" ADD CONSTRAINT "class_memberships_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_session_participants" ADD CONSTRAINT "class_session_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "class_session_participants" ADD CONSTRAINT "class_session_participants_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_revisions" ADD CONSTRAINT "attendance_revisions_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_revisions" ADD CONSTRAINT "attendance_revisions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_placement_requests" ADD CONSTRAINT "class_placement_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_placement_requests" ADD CONSTRAINT "class_placement_requests_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_placement_requests" ADD CONSTRAINT "class_placement_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_placement_requests" ADD CONSTRAINT "class_placement_requests_target_class_id_fkey" FOREIGN KEY ("target_class_id") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_target_session_id_fkey" FOREIGN KEY ("target_session_id") REFERENCES "class_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_reminder_deliveries" ADD CONSTRAINT "session_reminder_deliveries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_reminder_deliveries" ADD CONSTRAINT "session_reminder_deliveries_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_observations" ADD CONSTRAINT "teacher_observations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_observations" ADD CONSTRAINT "teacher_observations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_observations" ADD CONSTRAINT "teacher_observations_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_observations" ADD CONSTRAINT "teacher_observations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "classrooms"
  ALTER COLUMN "allowed_age_bands" SET NOT NULL,
  ADD CONSTRAINT "classrooms_type_check" CHECK ("class_type" IN ('one_to_one', 'group')),
  ADD CONSTRAINT "classrooms_capacity_check" CHECK ("capacity" > 0),
  ADD CONSTRAINT "classrooms_level_check" CHECK ("min_level" > 0 AND "max_level" >= "min_level"),
  ADD CONSTRAINT "classrooms_status_check" CHECK ("status" IN ('draft', 'open', 'confirmed', 'active', 'completed', 'cancelled'));
ALTER TABLE "class_memberships"
  ADD CONSTRAINT "class_memberships_status_check" CHECK ("status" IN ('active', 'left'));
ALTER TABLE "schedule_policies"
  ALTER COLUMN "reminder_offsets_minutes" SET NOT NULL,
  ALTER COLUMN "reminder_channels" SET NOT NULL,
  ADD CONSTRAINT "schedule_policies_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "schedule_policies_type_check" CHECK ("class_type" IN ('one_to_one', 'group')),
  ADD CONSTRAINT "schedule_policies_capacity_check" CHECK ("max_capacity" > 0),
  ADD CONSTRAINT "schedule_policies_deadline_check" CHECK ("change_deadline_hours" >= 0),
  ADD CONSTRAINT "schedule_policies_reschedule_check" CHECK ("max_reschedules_per_period" >= 0 AND "period_days" > 0),
  ADD CONSTRAINT "schedule_policies_status_check" CHECK ("status" IN ('draft', 'published', 'archived'));
ALTER TABLE "class_sessions"
  ADD CONSTRAINT "class_sessions_time_check" CHECK ("ends_at" > "starts_at"),
  ADD CONSTRAINT "class_sessions_status_check" CHECK ("status" IN ('scheduled', 'in_progress', 'completed', 'cancelled'));
ALTER TABLE "attendance_records"
  ADD CONSTRAINT "attendance_records_status_check" CHECK ("status" IN ('present', 'absent', 'late', 'excused')),
  ADD CONSTRAINT "attendance_records_version_check" CHECK ("version" > 0);
ALTER TABLE "class_session_participants"
  ADD CONSTRAINT "class_session_participants_status_check" CHECK ("status" IN ('active', 'cancelled')),
  ADD CONSTRAINT "class_session_participants_source_check" CHECK ("source_type" IN ('membership', 'reschedule', 'manual'));
ALTER TABLE "attendance_revisions"
  ADD CONSTRAINT "attendance_revisions_status_check" CHECK ("new_status" IN ('present', 'absent', 'late', 'excused'));
ALTER TABLE "class_placement_requests"
  ADD CONSTRAINT "class_placement_requests_level_check" CHECK ("requested_level" > 0),
  ADD CONSTRAINT "class_placement_requests_status_check" CHECK ("status" IN ('pending', 'placed', 'rejected', 'cancelled'));
ALTER TABLE "reschedule_requests"
  ADD CONSTRAINT "reschedule_requests_time_check" CHECK ("preferred_ends_at" > "preferred_starts_at"),
  ADD CONSTRAINT "reschedule_requests_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected', 'cancelled'));
ALTER TABLE "session_reminder_deliveries"
  ADD CONSTRAINT "session_reminders_channel_check" CHECK ("channel" IN ('in_app', 'push', 'email', 'zalo')),
  ADD CONSTRAINT "session_reminders_status_check" CHECK ("status" IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  ADD CONSTRAINT "session_reminders_attempts_check" CHECK ("attempts" >= 0);
ALTER TABLE "teacher_observations"
  ADD CONSTRAINT "teacher_observations_status_check" CHECK ("status" IN ('draft', 'published', 'archived')),
  ADD CONSTRAINT "teacher_observations_score_check" CHECK ("score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100),
  ADD CONSTRAINT "teacher_observations_version_check" CHECK ("version" > 0);
