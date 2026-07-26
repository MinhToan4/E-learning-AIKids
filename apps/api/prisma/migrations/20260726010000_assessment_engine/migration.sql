-- Versioned question bank and assessment lifecycle.
CREATE TABLE "question_bank_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "course_id" TEXT,
    "title" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_bank_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "question_bank_items_status_check"
      CHECK ("status" IN ('active', 'archived'))
);

CREATE TABLE "question_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "prompt_json" JSONB NOT NULL,
    "answer_key_json" JSONB NOT NULL,
    "rubric_json" JSONB NOT NULL DEFAULT '{}',
    "explanation" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "age_bands" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "authored_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_versions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "question_versions_version_check" CHECK ("version" > 0),
    CONSTRAINT "question_versions_type_check"
      CHECK ("type" IN ('single_choice', 'multiple_choice', 'drag_drop', 'short_text', 'ordering', 'artifact')),
    CONSTRAINT "question_versions_difficulty_check"
      CHECK ("difficulty" IN ('easy', 'medium', 'hard')),
    CONSTRAINT "question_versions_status_check"
      CHECK ("status" IN ('draft', 'published', 'archived'))
);

CREATE TABLE "assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "quest_id" TEXT,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'course_final',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessments_kind_check"
      CHECK ("kind" IN ('lesson_check', 'course_final', 'diagnostic', 'practice')),
    CONSTRAINT "assessments_status_check"
      CHECK ("status" IN ('active', 'archived'))
);

CREATE TABLE "assessment_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "instructions_json" JSONB NOT NULL DEFAULT '{}',
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "pass_score" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "cooldown_minutes" INTEGER NOT NULL DEFAULT 0,
    "allow_resume" BOOLEAN NOT NULL DEFAULT true,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT false,
    "feedback_policy" TEXT NOT NULL DEFAULT 'after_publish',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessment_versions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_versions_version_check" CHECK ("version" > 0),
    CONSTRAINT "assessment_versions_duration_check" CHECK ("duration_minutes" BETWEEN 1 AND 480),
    CONSTRAINT "assessment_versions_pass_score_check" CHECK ("pass_score" BETWEEN 0 AND 100),
    CONSTRAINT "assessment_versions_max_attempts_check" CHECK ("max_attempts" BETWEEN 1 AND 100),
    CONSTRAINT "assessment_versions_cooldown_check" CHECK ("cooldown_minutes" BETWEEN 0 AND 525600),
    CONSTRAINT "assessment_versions_feedback_policy_check"
      CHECK ("feedback_policy" IN ('after_submit', 'after_grade', 'after_publish', 'never')),
    CONSTRAINT "assessment_versions_status_check"
      CHECK ("status" IN ('draft', 'published', 'archived'))
);

CREATE TABLE "assessment_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_version_id" UUID NOT NULL,
    "question_version_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "required" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "assessment_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_items_order_check" CHECK ("order" > 0),
    CONSTRAINT "assessment_items_points_check" CHECK ("points" > 0)
);

CREATE TABLE "assessment_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_version_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "client_attempt_id" TEXT NOT NULL,
    "client_submission_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "item_order_json" JSONB NOT NULL DEFAULT '[]',
    "submitted_at" TIMESTAMP(3),
    "graded_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "earned_points" DOUBLE PRECISION,
    "possible_points" DOUBLE PRECISION,
    "score_percent" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_attempts_attempt_number_check" CHECK ("attempt_number" > 0),
    CONSTRAINT "assessment_attempts_version_check" CHECK ("version" > 0),
    CONSTRAINT "assessment_attempts_score_check"
      CHECK ("score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100),
    CONSTRAINT "assessment_attempts_status_check"
      CHECK ("status" IN ('in_progress', 'submitted', 'pending_review', 'graded', 'revision_requested', 'published', 'void'))
);

CREATE TABLE "assessment_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attempt_id" UUID NOT NULL,
    "question_version_id" UUID NOT NULL,
    "response_json" JSONB NOT NULL,
    "auto_ratio" DOUBLE PRECISION,
    "manual_ratio" DOUBLE PRECISION,
    "final_ratio" DOUBLE PRECISION,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessment_responses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_responses_ratios_check"
      CHECK (
        ("auto_ratio" IS NULL OR "auto_ratio" BETWEEN 0 AND 1) AND
        ("manual_ratio" IS NULL OR "manual_ratio" BETWEEN 0 AND 1) AND
        ("final_ratio" IS NULL OR "final_ratio" BETWEEN 0 AND 1)
      ),
    CONSTRAINT "assessment_responses_version_check" CHECK ("version" > 0)
);

CREATE TABLE "assessment_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "response_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewer_id" UUID,
    "rubric_scores_json" JSONB NOT NULL DEFAULT '{}',
    "ai_draft_json" JSONB,
    "feedback" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessment_reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_reviews_status_check"
      CHECK ("status" IN ('pending', 'in_review', 'reviewed', 'resubmission_requested', 'published')),
    CONSTRAINT "assessment_reviews_version_check" CHECK ("version" > 0)
);

CREATE TABLE "artifact_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "response_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "project_id" UUID,
    "asset_id" UUID,
    "storage_object_id" UUID,
    "snapshot_json" JSONB NOT NULL,
    "checksum" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "artifact_submissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "artifact_submissions_one_source_check"
      CHECK (num_nonnulls("project_id", "asset_id", "storage_object_id") = 1)
);

CREATE UNIQUE INDEX "question_bank_items_code_key" ON "question_bank_items"("code");
CREATE INDEX "question_bank_items_course_id_status_idx" ON "question_bank_items"("course_id", "status");
CREATE UNIQUE INDEX "question_versions_question_id_version_key" ON "question_versions"("question_id", "version");
CREATE INDEX "question_versions_type_status_idx" ON "question_versions"("type", "status");
CREATE INDEX "question_versions_authored_by_id_created_at_idx" ON "question_versions"("authored_by_id", "created_at");
CREATE UNIQUE INDEX "assessments_code_key" ON "assessments"("code");
CREATE INDEX "assessments_course_id_kind_status_idx" ON "assessments"("course_id", "kind", "status");
CREATE INDEX "assessments_quest_id_idx" ON "assessments"("quest_id");
CREATE UNIQUE INDEX "assessment_versions_assessment_id_version_key" ON "assessment_versions"("assessment_id", "version");
CREATE INDEX "assessment_versions_assessment_id_status_idx" ON "assessment_versions"("assessment_id", "status");
CREATE UNIQUE INDEX "assessment_items_assessment_version_id_order_key" ON "assessment_items"("assessment_version_id", "order");
CREATE UNIQUE INDEX "assessment_items_assessment_version_id_question_version_id_key" ON "assessment_items"("assessment_version_id", "question_version_id");
CREATE INDEX "assessment_items_question_version_id_idx" ON "assessment_items"("question_version_id");
CREATE UNIQUE INDEX "assessment_attempts_student_id_assessment_version_id_attempt_number_key" ON "assessment_attempts"("student_id", "assessment_version_id", "attempt_number");
CREATE UNIQUE INDEX "assessment_attempts_student_id_client_attempt_id_key" ON "assessment_attempts"("student_id", "client_attempt_id");
CREATE UNIQUE INDEX "assessment_attempts_client_submission_id_key" ON "assessment_attempts"("client_submission_id");
CREATE INDEX "assessment_attempts_student_id_status_updated_at_idx" ON "assessment_attempts"("student_id", "status", "updated_at");
CREATE INDEX "assessment_attempts_assessment_version_id_status_submitted_at_idx" ON "assessment_attempts"("assessment_version_id", "status", "submitted_at");
CREATE UNIQUE INDEX "assessment_responses_attempt_id_question_version_id_key" ON "assessment_responses"("attempt_id", "question_version_id");
CREATE INDEX "assessment_responses_question_version_id_idx" ON "assessment_responses"("question_version_id");
CREATE UNIQUE INDEX "assessment_reviews_response_id_key" ON "assessment_reviews"("response_id");
CREATE INDEX "assessment_reviews_status_created_at_idx" ON "assessment_reviews"("status", "created_at");
CREATE INDEX "assessment_reviews_reviewer_id_status_idx" ON "assessment_reviews"("reviewer_id", "status");
CREATE UNIQUE INDEX "artifact_submissions_response_id_key" ON "artifact_submissions"("response_id");
CREATE INDEX "artifact_submissions_student_id_created_at_idx" ON "artifact_submissions"("student_id", "created_at");

ALTER TABLE "question_bank_items"
  ADD CONSTRAINT "question_bank_items_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "question_versions"
  ADD CONSTRAINT "question_versions_question_id_fkey"
  FOREIGN KEY ("question_id") REFERENCES "question_bank_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "question_versions"
  ADD CONSTRAINT "question_versions_authored_by_id_fkey"
  FOREIGN KEY ("authored_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assessments"
  ADD CONSTRAINT "assessments_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessments"
  ADD CONSTRAINT "assessments_quest_id_fkey"
  FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assessment_versions"
  ADD CONSTRAINT "assessment_versions_assessment_id_fkey"
  FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_versions"
  ADD CONSTRAINT "assessment_versions_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assessment_items"
  ADD CONSTRAINT "assessment_items_assessment_version_id_fkey"
  FOREIGN KEY ("assessment_version_id") REFERENCES "assessment_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_items"
  ADD CONSTRAINT "assessment_items_question_version_id_fkey"
  FOREIGN KEY ("question_version_id") REFERENCES "question_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessment_attempts"
  ADD CONSTRAINT "assessment_attempts_assessment_version_id_fkey"
  FOREIGN KEY ("assessment_version_id") REFERENCES "assessment_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessment_attempts"
  ADD CONSTRAINT "assessment_attempts_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_responses"
  ADD CONSTRAINT "assessment_responses_attempt_id_fkey"
  FOREIGN KEY ("attempt_id") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_responses"
  ADD CONSTRAINT "assessment_responses_question_version_id_fkey"
  FOREIGN KEY ("question_version_id") REFERENCES "question_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessment_reviews"
  ADD CONSTRAINT "assessment_reviews_response_id_fkey"
  FOREIGN KEY ("response_id") REFERENCES "assessment_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_reviews"
  ADD CONSTRAINT "assessment_reviews_reviewer_id_fkey"
  FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "artifact_submissions"
  ADD CONSTRAINT "artifact_submissions_response_id_fkey"
  FOREIGN KEY ("response_id") REFERENCES "assessment_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "artifact_submissions"
  ADD CONSTRAINT "artifact_submissions_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "artifact_submissions"
  ADD CONSTRAINT "artifact_submissions_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "artifact_submissions"
  ADD CONSTRAINT "artifact_submissions_asset_id_fkey"
  FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "artifact_submissions"
  ADD CONSTRAINT "artifact_submissions_storage_object_id_fkey"
  FOREIGN KEY ("storage_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
