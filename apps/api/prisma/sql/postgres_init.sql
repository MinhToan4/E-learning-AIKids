-- PostgreSQL / Supabase-compatible DDL for AI Kids Creator Academy
-- Apply via: psql $DATABASE_URL -f postgres_init.sql
-- Or: set schema provider to postgresql + prisma migrate deploy
-- All content (courses, quests, video URLs) lives in SQL — not app hardcoding.

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "role" TEXT NOT NULL,
  "email" TEXT UNIQUE,
  "passwordHash" TEXT,
  "pinHash" TEXT,
  "nickname" TEXT,
  "avatarId" TEXT,
  "level" INTEGER NOT NULL DEFAULT 1,
  "xp" INTEGER NOT NULL DEFAULT 0,
  "onboarded" BOOLEAN NOT NULL DEFAULT false,
  "goal" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "parentId" TEXT,
  "classId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "token" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ClassRoom" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "teacherId" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "User"
  DROP CONSTRAINT IF EXISTS "User_parentId_fkey",
  DROP CONSTRAINT IF EXISTS "User_classId_fkey";

ALTER TABLE "User"
  ADD CONSTRAINT "User_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "User"
  ADD CONSTRAINT "User_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "ClassRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "Course" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "shortTitle" TEXT NOT NULL,
  "tagline" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "coverFrom" TEXT NOT NULL,
  "coverTo" TEXT NOT NULL,
  "accent" TEXT NOT NULL,
  "coverImage" TEXT,
  "ageLabel" TEXT NOT NULL,
  "durationLabel" TEXT NOT NULL,
  "productLabel" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "recommended" BOOLEAN NOT NULL DEFAULT false,
  "skillsJson" TEXT NOT NULL,
  "outcomesJson" TEXT NOT NULL DEFAULT '[]',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Quest" (
  "id" TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL REFERENCES "Course"("id") ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "skill" TEXT NOT NULL,
  "reward" TEXT NOT NULL,
  "duration" TEXT NOT NULL,
  "hook" TEXT NOT NULL,
  "accent" TEXT NOT NULL,
  "icon" TEXT NOT NULL DEFAULT 'star',
  "practiceKind" TEXT NOT NULL DEFAULT 'chips',
  "videoUrl" TEXT,
  "goalsJson" TEXT NOT NULL,
  "learnCardsJson" TEXT NOT NULL,
  "checkJson" TEXT NOT NULL,
  "chipsJson" TEXT,
  UNIQUE ("courseId", "order")
);

CREATE INDEX IF NOT EXISTS "Quest_courseId_idx" ON "Quest"("courseId");

CREATE TABLE IF NOT EXISTS "Enrollment" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "courseId" TEXT NOT NULL REFERENCES "Course"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "courseId")
);

CREATE TABLE IF NOT EXISTS "QuestProgress" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "questId" TEXT NOT NULL REFERENCES "Quest"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'locked',
  "phase" TEXT NOT NULL DEFAULT 'learn',
  "stars" INTEGER NOT NULL DEFAULT 0,
  "xpEarned" INTEGER NOT NULL DEFAULT 0,
  "dataJson" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "questId")
);

CREATE INDEX IF NOT EXISTS "QuestProgress_userId_idx" ON "QuestProgress"("userId");

CREATE TABLE IF NOT EXISTS "Asset" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "questId" TEXT,
  "thumbnail" TEXT NOT NULL,
  "private" BOOLEAN NOT NULL DEFAULT true,
  "metaJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Asset_userId_idx" ON "Asset"("userId");

CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "thumbnail" TEXT NOT NULL,
  "private" BOOLEAN NOT NULL DEFAULT true,
  "shareStatus" TEXT NOT NULL DEFAULT 'private',
  "dataJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");

CREATE TABLE IF NOT EXISTS "Approval" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "childId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "parentId" TEXT REFERENCES "User"("id"),
  "destination" TEXT NOT NULL DEFAULT 'family',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Approval_parentId_status_idx" ON "Approval"("parentId", "status");
CREATE INDEX IF NOT EXISTS "Approval_childId_idx" ON "Approval"("childId");

-- Example seed lecture video URLs (replace with your CDN paths in production):
-- UPDATE "Quest" SET "videoUrl" = 'https://cdn.example.com/lectures/meet-mascot.mp4' WHERE id = 'meet-mascot';
