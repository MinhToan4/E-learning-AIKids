-- =============================================================================
-- AI Kids Creator Academy — Production Schema (Greenfield)
-- Date: 2026-07-20
-- Target: Supabase PostgreSQL
--
-- Design principles:
--   • UUID native IDs (gen_random_uuid) — optimal B-tree index
--   • snake_case naming (PostgreSQL standard)
--   • CHECK constraints on enum-like columns
--   • Partial + composite indexes matching actual query patterns
--   • COMMENT on every table + key columns
--   • jsonb metadata for extensibility without migration
--   • Cascade FK strategy per domain rules
--   • StoryMee-compatible structure (shared user, session cookie)
--
-- Apply:
--   Supabase Dashboard → SQL Editor → paste & run
--   OR: psql "$DATABASE_URL" -f aikids_schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 0. DROP existing tables (order respects FK dependencies)
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS public."Notification" CASCADE;
DROP TABLE IF EXISTS public."DailyStreak" CASCADE;
DROP TABLE IF EXISTS public."Achievement" CASCADE;
DROP TABLE IF EXISTS public."Approval" CASCADE;
DROP TABLE IF EXISTS public."Project" CASCADE;
DROP TABLE IF EXISTS public."Asset" CASCADE;
DROP TABLE IF EXISTS public."QuestProgress" CASCADE;
DROP TABLE IF EXISTS public."Enrollment" CASCADE;
DROP TABLE IF EXISTS public."Quest" CASCADE;
DROP TABLE IF EXISTS public."Course" CASCADE;
DROP TABLE IF EXISTS public."Session" CASCADE;
DROP TABLE IF EXISTS public."User" CASCADE;
DROP TABLE IF EXISTS public."ClassRoom" CASCADE;

-- Also drop new-style tables if re-running
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.daily_streaks CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.approvals CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.quest_progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.quests CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.parent_profiles CASCADE;
DROP TABLE IF EXISTS public.teacher_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.classrooms CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- A. CORE IDENTITY
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- A1) users — central identity for all actors
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
    id            uuid DEFAULT gen_random_uuid() NOT NULL,
    role          text NOT NULL,
    email         text,
    password_hash text,
    pin_hash      text,            -- optional parent PIN for child login
    nickname      text,
    avatar_id     text,
    level         integer DEFAULT 1 NOT NULL,
    xp            integer DEFAULT 0 NOT NULL,
    onboarded     boolean DEFAULT false NOT NULL,
    goal          text,             -- comic | video | character
    active        boolean DEFAULT true NOT NULL,
    parent_id     uuid,             -- student → parent link
    class_id      uuid,             -- student → classroom link
    metadata      jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at    timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at    timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_role_check CHECK (
        role = ANY (ARRAY['student'::text, 'parent'::text, 'teacher'::text, 'admin'::text])
    ),
    CONSTRAINT users_goal_check CHECK (
        goal IS NULL OR goal = ANY (ARRAY['comic'::text, 'video'::text, 'character'::text])
    )
);

CREATE UNIQUE INDEX users_email_key
    ON public.users USING btree (email)
    WHERE (email IS NOT NULL);

CREATE INDEX users_role_active_idx
    ON public.users USING btree (role, active);

CREATE INDEX users_parent_id_idx
    ON public.users USING btree (parent_id)
    WHERE (parent_id IS NOT NULL);

CREATE INDEX users_class_id_idx
    ON public.users USING btree (class_id)
    WHERE (class_id IS NOT NULL);

COMMENT ON TABLE public.users IS
    'Central identity table. All roles (student/parent/teacher/admin) share one table.';
COMMENT ON COLUMN public.users.role IS 'student | parent | teacher | admin';
COMMENT ON COLUMN public.users.active IS 'Soft-disable without deleting progress';
COMMENT ON COLUMN public.users.metadata IS 'Extensible JSON — notification prefs, locale, etc.';

-- ---------------------------------------------------------------------------
-- A2) parent_profiles — extended parent preferences
-- ---------------------------------------------------------------------------
CREATE TABLE public.parent_profiles (
    id                  uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id             uuid NOT NULL,
    phone               text,
    preferred_language  text DEFAULT 'vi'::text NOT NULL,
    notification_prefs  jsonb DEFAULT '{}'::jsonb NOT NULL,
    max_children        integer DEFAULT 5 NOT NULL,
    metadata            jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at          timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT parent_profiles_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX parent_profiles_user_id_key
    ON public.parent_profiles USING btree (user_id);

COMMENT ON TABLE public.parent_profiles IS
    'Extended parent profile. Children = users WHERE parent_id = this user.';

-- ---------------------------------------------------------------------------
-- A3) teacher_profiles — extended teacher preferences
-- ---------------------------------------------------------------------------
CREATE TABLE public.teacher_profiles (
    id                  uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id             uuid NOT NULL,
    display_name        text,
    bio                 text,
    subjects            text[] DEFAULT ARRAY[]::text[],
    languages           text[] DEFAULT ARRAY['vi'::text],
    verification_status text DEFAULT 'none'::text NOT NULL,
    metadata            jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at          timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT teacher_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_profiles_verification_check CHECK (
        verification_status = ANY (ARRAY['none'::text, 'pending'::text, 'verified'::text, 'rejected'::text])
    )
);

CREATE UNIQUE INDEX teacher_profiles_user_id_key
    ON public.teacher_profiles USING btree (user_id);

COMMENT ON TABLE public.teacher_profiles IS
    'Teacher profile — bio, subjects, verification. One per teacher User.';

-- ---------------------------------------------------------------------------
-- A4) sessions — auth sessions (cookie-based)
-- ---------------------------------------------------------------------------
CREATE TABLE public.sessions (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    token      text NOT NULL,
    user_id    uuid NOT NULL,
    ip_address text,
    user_agent text,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT sessions_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX sessions_token_key
    ON public.sessions USING btree (token);

CREATE INDEX sessions_user_id_idx
    ON public.sessions USING btree (user_id);

CREATE INDEX sessions_expires_at_idx
    ON public.sessions USING btree (expires_at);

COMMENT ON TABLE public.sessions IS
    'Auth sessions — cookie-based, Redis-cached. Expired rows cleaned by cron.';

-- ---------------------------------------------------------------------------
-- A5) classrooms — teacher-owned study groups
-- ---------------------------------------------------------------------------
CREATE TABLE public.classrooms (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    name       text NOT NULL,
    code       text NOT NULL,
    teacher_id uuid NOT NULL,
    status     text DEFAULT 'active'::text NOT NULL,
    metadata   jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT classrooms_pkey PRIMARY KEY (id),
    CONSTRAINT classrooms_status_check CHECK (
        status = ANY (ARRAY['active'::text, 'archived'::text])
    )
);

CREATE UNIQUE INDEX classrooms_code_key
    ON public.classrooms USING btree (code);

CREATE INDEX classrooms_teacher_id_idx
    ON public.classrooms USING btree (teacher_id);

COMMENT ON TABLE public.classrooms IS
    'Teacher-owned study group. Students link via users.class_id.';

-- ═══════════════════════════════════════════════════════════════════════════
-- B. CURRICULUM & LEARNING
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- B1) courses — catalog
-- ---------------------------------------------------------------------------
CREATE TABLE public.courses (
    id             text NOT NULL,  -- stable slug: course-comic, course-video, etc.
    title          text NOT NULL,
    short_title    text NOT NULL,
    tagline        text NOT NULL,
    description    text NOT NULL,
    cover_from     text NOT NULL,  -- gradient start color
    cover_to       text NOT NULL,  -- gradient end color
    accent         text NOT NULL,
    cover_image    text,
    age_label      text NOT NULL,
    duration_label text NOT NULL,
    product_label  text NOT NULL,
    status         text DEFAULT 'open'::text NOT NULL,
    recommended    boolean DEFAULT false NOT NULL,
    skills_json    text NOT NULL,    -- JSON array of skills
    outcomes_json  text DEFAULT '[]'::text NOT NULL,
    sort_order     integer DEFAULT 0 NOT NULL,
    created_at     timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at     timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_status_check CHECK (
        status = ANY (ARRAY['open'::text, 'soon'::text, 'archived'::text])
    )
);

CREATE INDEX courses_status_sort_idx
    ON public.courses USING btree (status, sort_order);

COMMENT ON TABLE public.courses IS
    'Course catalog. ID is stable slug for URL-friendly routes.';

-- ---------------------------------------------------------------------------
-- B2) quests — lesson stations within a course
-- ---------------------------------------------------------------------------
CREATE TABLE public.quests (
    id              text NOT NULL,  -- stable slug: meet-mascot, etc.
    course_id       text NOT NULL,
    "order"         integer NOT NULL,
    title           text NOT NULL,
    skill           text NOT NULL,
    reward          text NOT NULL,
    duration        text NOT NULL,
    hook            text NOT NULL,
    accent          text NOT NULL,
    icon            text DEFAULT 'star'::text NOT NULL,
    practice_kind   text DEFAULT 'chips'::text NOT NULL,
    video_url       text,           -- CDN / storage URL
    goals_json      text NOT NULL,  -- JSON string[]
    learn_cards_json text NOT NULL, -- JSON LearnCard[]
    check_json      text NOT NULL,  -- JSON check questions
    chips_json      text,           -- optional prompt chips

    CONSTRAINT quests_pkey PRIMARY KEY (id),
    CONSTRAINT quests_practice_kind_check CHECK (
        practice_kind = ANY (ARRAY[
            'chips'::text, 'story'::text, 'comic'::text,
            'detective'::text, 'character'::text, 'video'::text, 'intro'::text
        ])
    )
);

CREATE UNIQUE INDEX quests_course_id_order_key
    ON public.quests USING btree (course_id, "order");

CREATE INDEX quests_course_id_idx
    ON public.quests USING btree (course_id);

COMMENT ON TABLE public.quests IS
    'Lesson station. Each quest belongs to one course, ordered by "order" field.';

-- ---------------------------------------------------------------------------
-- B3) enrollments — user enrolled in course
-- ---------------------------------------------------------------------------
CREATE TABLE public.enrollments (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid NOT NULL,
    course_id  text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT enrollments_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX enrollments_user_course_key
    ON public.enrollments USING btree (user_id, course_id);

CREATE INDEX enrollments_user_id_idx
    ON public.enrollments USING btree (user_id);

COMMENT ON TABLE public.enrollments IS
    'Student → Course enrollment. One row per user per course.';

-- ---------------------------------------------------------------------------
-- B4) quest_progress — per-user learning progress
-- ---------------------------------------------------------------------------
CREATE TABLE public.quest_progress (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid NOT NULL,
    quest_id   text NOT NULL,
    status     text DEFAULT 'locked'::text NOT NULL,
    phase      text DEFAULT 'learn'::text NOT NULL,
    stars      integer DEFAULT 0 NOT NULL,
    xp_earned  integer DEFAULT 0 NOT NULL,
    data_json  text,             -- practice payload
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT quest_progress_pkey PRIMARY KEY (id),
    CONSTRAINT quest_progress_status_check CHECK (
        status = ANY (ARRAY['locked'::text, 'available'::text, 'in_progress'::text, 'completed'::text])
    ),
    CONSTRAINT quest_progress_phase_check CHECK (
        phase = ANY (ARRAY['learn'::text, 'practice'::text, 'check'::text])
    ),
    CONSTRAINT quest_progress_stars_check CHECK (stars >= 0 AND stars <= 3)
);

CREATE UNIQUE INDEX quest_progress_user_quest_key
    ON public.quest_progress USING btree (user_id, quest_id);

CREATE INDEX quest_progress_user_id_idx
    ON public.quest_progress USING btree (user_id);

-- Partial index: fast lookup for completed quests (gamification queries)
CREATE INDEX quest_progress_user_completed_idx
    ON public.quest_progress USING btree (user_id)
    WHERE (status = 'completed'::text);

COMMENT ON TABLE public.quest_progress IS
    'Per-user quest progress. Phases: learn → practice → check. Stars 0-3.';

-- ═══════════════════════════════════════════════════════════════════════════
-- C. PORTFOLIO & SOCIAL
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- C1) assets — student-created creative assets
-- ---------------------------------------------------------------------------
CREATE TABLE public.assets (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid NOT NULL,
    type       text NOT NULL,     -- comic_panel | character | video_clip | story
    name       text NOT NULL,
    quest_id   text,
    thumbnail  text NOT NULL,
    private    boolean DEFAULT true NOT NULL,
    meta_json  text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT assets_pkey PRIMARY KEY (id),
    CONSTRAINT assets_type_check CHECK (
        type = ANY (ARRAY['comic_panel'::text, 'character'::text, 'video_clip'::text, 'story'::text])
    )
);

CREATE INDEX assets_user_id_idx
    ON public.assets USING btree (user_id);

CREATE INDEX assets_quest_id_idx
    ON public.assets USING btree (quest_id)
    WHERE (quest_id IS NOT NULL);

COMMENT ON TABLE public.assets IS
    'Student creative outputs (comic panels, characters, videos, stories).';

-- ---------------------------------------------------------------------------
-- C2) projects — student portfolio projects (composed of assets)
-- ---------------------------------------------------------------------------
CREATE TABLE public.projects (
    id           uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id      uuid NOT NULL,
    title        text NOT NULL,
    kind         text NOT NULL,
    thumbnail    text NOT NULL,
    private      boolean DEFAULT true NOT NULL,
    share_status text DEFAULT 'private'::text NOT NULL,
    data_json    text,
    created_at   timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT projects_pkey PRIMARY KEY (id),
    CONSTRAINT projects_kind_check CHECK (
        kind = ANY (ARRAY['comic'::text, 'video'::text, 'character'::text])
    ),
    CONSTRAINT projects_share_status_check CHECK (
        share_status = ANY (ARRAY['private'::text, 'pending'::text, 'shared'::text])
    )
);

CREATE INDEX projects_user_id_idx
    ON public.projects USING btree (user_id);

-- Fast lookup for pending approvals
CREATE INDEX projects_pending_idx
    ON public.projects USING btree (share_status)
    WHERE (share_status = 'pending'::text);

COMMENT ON TABLE public.projects IS
    'Student portfolio project. share_status flows: private → pending → shared/private.';

-- ---------------------------------------------------------------------------
-- C3) approvals — parent approval workflow for sharing projects
-- ---------------------------------------------------------------------------
CREATE TABLE public.approvals (
    id          uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id  uuid NOT NULL,
    child_id    uuid NOT NULL,     -- student requesting
    parent_id   uuid,              -- parent deciding (null = not yet assigned)
    destination text DEFAULT 'family'::text NOT NULL,
    status      text DEFAULT 'pending'::text NOT NULL,
    note        text,
    created_at  timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT approvals_pkey PRIMARY KEY (id),
    CONSTRAINT approvals_destination_check CHECK (
        destination = ANY (ARRAY['family'::text, 'class'::text, 'public'::text])
    ),
    CONSTRAINT approvals_status_check CHECK (
        status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])
    )
);

CREATE INDEX approvals_parent_status_idx
    ON public.approvals USING btree (parent_id, status);

CREATE INDEX approvals_child_id_idx
    ON public.approvals USING btree (child_id);

-- Fast lookup for pending approvals per parent
CREATE INDEX approvals_parent_pending_idx
    ON public.approvals USING btree (parent_id)
    WHERE (status = 'pending'::text);

COMMENT ON TABLE public.approvals IS
    'Parent approval flow for student project sharing. pending → approved/rejected.';

-- ═══════════════════════════════════════════════════════════════════════════
-- D. GAMIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- D1) achievements — unlocked milestones
-- ---------------------------------------------------------------------------
CREATE TABLE public.achievements (
    id          uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id     uuid NOT NULL,
    type        text NOT NULL,
    unlocked_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT achievements_pkey PRIMARY KEY (id),
    CONSTRAINT achievements_type_check CHECK (
        type = ANY (ARRAY[
            'first_quest'::text, 'streak_3'::text, 'streak_7'::text, 'streak_30'::text,
            'star_10'::text, 'star_50'::text, 'course_complete'::text, 'project_first'::text
        ])
    )
);

CREATE UNIQUE INDEX achievements_user_type_key
    ON public.achievements USING btree (user_id, type);

CREATE INDEX achievements_user_id_idx
    ON public.achievements USING btree (user_id);

COMMENT ON TABLE public.achievements IS
    'Gamification milestones. Each type can be unlocked once per user.';

-- ---------------------------------------------------------------------------
-- D2) daily_streaks — consecutive learning days
-- ---------------------------------------------------------------------------
CREATE TABLE public.daily_streaks (
    id               uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id          uuid NOT NULL,
    current          integer DEFAULT 0 NOT NULL,
    longest          integer DEFAULT 0 NOT NULL,
    last_active_date text NOT NULL,   -- YYYY-MM-DD format
    updated_at       timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT daily_streaks_pkey PRIMARY KEY (id),
    CONSTRAINT daily_streaks_current_check CHECK (current >= 0),
    CONSTRAINT daily_streaks_longest_check CHECK (longest >= 0)
);

CREATE UNIQUE INDEX daily_streaks_user_id_key
    ON public.daily_streaks USING btree (user_id);

COMMENT ON TABLE public.daily_streaks IS
    'Consecutive learning streak tracker. One row per student.';

-- ---------------------------------------------------------------------------
-- D3) notifications — in-app notifications
-- ---------------------------------------------------------------------------
CREATE TABLE public.notifications (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid NOT NULL,
    type       text NOT NULL,
    title      text NOT NULL,
    body       text NOT NULL,
    read       boolean DEFAULT false NOT NULL,
    data       text,              -- JSON metadata
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_type_check CHECK (
        type = ANY (ARRAY[
            'achievement'::text, 'approval'::text, 'quest_complete'::text,
            'streak'::text, 'system'::text
        ])
    )
);

CREATE INDEX notifications_user_read_idx
    ON public.notifications USING btree (user_id, read);

-- Fast lookup for unread count
CREATE INDEX notifications_user_unread_idx
    ON public.notifications USING btree (user_id)
    WHERE (read = false);

-- Cleanup old notifications index
CREATE INDEX notifications_created_at_idx
    ON public.notifications USING btree (created_at);

COMMENT ON TABLE public.notifications IS
    'In-app notifications. Auto-created by achievement unlocks, approvals, etc.';

-- ═══════════════════════════════════════════════════════════════════════════
-- E. FOREIGN KEYS (idempotent — safe to re-run)
-- ═══════════════════════════════════════════════════════════════════════════

-- Users self-references
DO $$ BEGIN
  ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_class_id_fkey
    FOREIGN KEY (class_id) REFERENCES public.classrooms(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Profile FKs
DO $$ BEGIN
  ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sessions
DO $$ BEGIN
  ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Classrooms
DO $$ BEGIN
  ALTER TABLE ONLY public.classrooms
    ADD CONSTRAINT classrooms_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Curriculum
DO $$ BEGIN
  ALTER TABLE ONLY public.quests
    ADD CONSTRAINT quests_course_id_fkey
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.quest_progress
    ADD CONSTRAINT quest_progress_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.quest_progress
    ADD CONSTRAINT quest_progress_quest_id_fkey
    FOREIGN KEY (quest_id) REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Portfolio
DO $$ BEGIN
  ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_child_id_fkey
    FOREIGN KEY (child_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Gamification
DO $$ BEGIN
  ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.daily_streaks
    ADD CONSTRAINT daily_streaks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- F. TRIGGER: auto-update updated_at
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'updated_at'
          AND table_name NOT LIKE 'pg_%'
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_updated_at ON public.%I; '
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I '
            'FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();',
            t, t
        );
    END LOOP;
END $$;

COMMIT;

-- =============================================================================
-- SCHEMA SUMMARY
-- =============================================================================
--
-- | Table              | Purpose                              | Key indexes
-- |--------------------|--------------------------------------|---------------------------
-- | users              | All actors (student/parent/teacher)   | email (unique partial), role+active, parent_id, class_id
-- | parent_profiles    | Parent prefs, phone, notifications    | user_id (unique)
-- | teacher_profiles   | Teacher bio, subjects, verification   | user_id (unique)
-- | sessions           | Auth sessions (Redis-cached)          | token (unique), user_id, expires_at
-- | classrooms         | Teacher study groups                  | code (unique), teacher_id
-- | courses            | Course catalog                        | status+sort_order
-- | quests             | Lesson stations                       | course_id+order (unique), course_id
-- | enrollments        | User ↔ Course                        | user_id+course_id (unique)
-- | quest_progress     | Learning progress                     | user_id+quest_id (unique), completed partial
-- | assets             | Creative outputs                      | user_id, quest_id partial
-- | projects           | Portfolio projects                    | user_id, pending partial
-- | approvals          | Parent approval flow                  | parent_id+status, child_id, pending partial
-- | achievements       | Gamification milestones               | user_id+type (unique)
-- | daily_streaks      | Consecutive days                      | user_id (unique)
-- | notifications      | In-app notifications                  | user_id+read, unread partial, created_at
-- =============================================================================
