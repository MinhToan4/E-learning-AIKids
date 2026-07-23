-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "aikids_legacy";

-- CreateTable
CREATE TABLE "aikids_legacy"."achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "parent_id" UUID,
    "destination" TEXT NOT NULL DEFAULT 'family',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quest_id" TEXT,
    "thumbnail" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "meta_json" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."classrooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "teacher_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cover_from" TEXT NOT NULL,
    "cover_to" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "cover_image" TEXT,
    "age_label" TEXT NOT NULL,
    "duration_label" TEXT NOT NULL,
    "product_label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "skills_json" TEXT NOT NULL,
    "outcomes_json" TEXT NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "age_track" TEXT NOT NULL DEFAULT 'L1',
    "course_key" TEXT NOT NULL DEFAULT 'K1',

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."daily_streaks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "longest" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."login_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "email" TEXT,
    "outcome" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."parent_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "phone" TEXT,
    "preferred_language" TEXT NOT NULL DEFAULT 'vi',
    "notification_prefs" JSONB NOT NULL DEFAULT '{}',
    "max_children" INTEGER NOT NULL DEFAULT 5,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gate_pin" TEXT,

    CONSTRAINT "parent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "max_children" INTEGER NOT NULL,
    "max_open_courses_per_child" INTEGER NOT NULL,
    "price_monthly" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "features_json" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "share_status" TEXT NOT NULL DEFAULT 'private',
    "data_json" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."quest_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "quest_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'locked',
    "phase" TEXT NOT NULL DEFAULT 'learn',
    "stars" INTEGER NOT NULL DEFAULT 0,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "data_json" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."quests" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "reward" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'star',
    "practice_kind" TEXT NOT NULL DEFAULT 'chips',
    "video_url" TEXT,
    "goals_json" TEXT NOT NULL,
    "learn_cards_json" TEXT NOT NULL,
    "check_json" TEXT NOT NULL,
    "chips_json" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'ideate',
    "stations_json" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_user_id" UUID NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "seats" INTEGER NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_period_end" TIMESTAMP(3),
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "external_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."system_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value_enc" TEXT,
    "meta_json" TEXT NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."teacher_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY['vi']::TEXT[],
    "verification_status" TEXT NOT NULL DEFAULT 'none',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aikids_legacy"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "pin_hash" TEXT,
    "nickname" TEXT,
    "avatar_id" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "goal" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" UUID,
    "class_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "google_sub" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "achievements_user_id_idx" ON "aikids_legacy"."achievements"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_user_id_type_key" ON "aikids_legacy"."achievements"("user_id" ASC, "type" ASC);

-- CreateIndex
CREATE INDEX "approvals_child_id_idx" ON "aikids_legacy"."approvals"("child_id" ASC);

-- CreateIndex
CREATE INDEX "approvals_parent_id_status_idx" ON "aikids_legacy"."approvals"("parent_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "assets_user_id_idx" ON "aikids_legacy"."assets"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_code_key" ON "aikids_legacy"."classrooms"("code" ASC);

-- CreateIndex
CREATE INDEX "classrooms_teacher_id_idx" ON "aikids_legacy"."classrooms"("teacher_id" ASC);

-- CreateIndex
CREATE INDEX "courses_age_track_course_key_idx" ON "aikids_legacy"."courses"("age_track" ASC, "course_key" ASC);

-- CreateIndex
CREATE INDEX "courses_status_sort_order_idx" ON "aikids_legacy"."courses"("status" ASC, "sort_order" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_streaks_user_id_key" ON "aikids_legacy"."daily_streaks"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "aikids_legacy"."enrollments"("user_id" ASC, "course_id" ASC);

-- CreateIndex
CREATE INDEX "enrollments_user_id_idx" ON "aikids_legacy"."enrollments"("user_id" ASC);

-- CreateIndex
CREATE INDEX "login_logs_created_at_idx" ON "aikids_legacy"."login_logs"("created_at" ASC);

-- CreateIndex
CREATE INDEX "login_logs_outcome_idx" ON "aikids_legacy"."login_logs"("outcome" ASC);

-- CreateIndex
CREATE INDEX "login_logs_user_id_idx" ON "aikids_legacy"."login_logs"("user_id" ASC);

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "aikids_legacy"."notifications"("created_at" ASC);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "aikids_legacy"."notifications"("user_id" ASC, "read" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "parent_profiles_user_id_key" ON "aikids_legacy"."parent_profiles"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "aikids_legacy"."plans"("code" ASC);

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "aikids_legacy"."projects"("user_id" ASC);

-- CreateIndex
CREATE INDEX "quest_progress_user_id_idx" ON "aikids_legacy"."quest_progress"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "quest_progress_user_id_quest_id_key" ON "aikids_legacy"."quest_progress"("user_id" ASC, "quest_id" ASC);

-- CreateIndex
CREATE INDEX "quests_course_id_idx" ON "aikids_legacy"."quests"("course_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "quests_course_id_order_key" ON "aikids_legacy"."quests"("course_id" ASC, "order" ASC);

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "aikids_legacy"."sessions"("expires_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "aikids_legacy"."sessions"("token" ASC);

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "aikids_legacy"."sessions"("user_id" ASC);

-- CreateIndex
CREATE INDEX "subscriptions_parent_user_id_status_idx" ON "aikids_legacy"."subscriptions"("parent_user_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_idx" ON "aikids_legacy"."subscriptions"("plan_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "aikids_legacy"."system_settings"("key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_user_id_key" ON "aikids_legacy"."teacher_profiles"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "aikids_legacy"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_sub_key" ON "aikids_legacy"."users"("google_sub" ASC);

-- CreateIndex
CREATE INDEX "users_role_active_idx" ON "aikids_legacy"."users"("role" ASC, "active" ASC);

-- AddForeignKey
ALTER TABLE "aikids_legacy"."achievements" ADD CONSTRAINT "achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."approvals" ADD CONSTRAINT "approvals_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."approvals" ADD CONSTRAINT "approvals_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."approvals" ADD CONSTRAINT "approvals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "aikids_legacy"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."classrooms" ADD CONSTRAINT "classrooms_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."daily_streaks" ADD CONSTRAINT "daily_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "aikids_legacy"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."login_logs" ADD CONSTRAINT "login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."parent_profiles" ADD CONSTRAINT "parent_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."quest_progress" ADD CONSTRAINT "quest_progress_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "aikids_legacy"."quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."quest_progress" ADD CONSTRAINT "quest_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."quests" ADD CONSTRAINT "quests_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "aikids_legacy"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."subscriptions" ADD CONSTRAINT "subscriptions_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "aikids_legacy"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."users" ADD CONSTRAINT "users_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "aikids_legacy"."classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aikids_legacy"."users" ADD CONSTRAINT "users_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "aikids_legacy"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
