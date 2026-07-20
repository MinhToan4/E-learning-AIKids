-- Additive migration: User.active, ClassRoom.updatedAt, Quest.videoUrl
-- Compatible with SQLite (Prisma migrate) and conceptually with PostgreSQL.

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable ClassRoom
ALTER TABLE "ClassRoom" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable Quest — lecture video URL (CDN / object storage)
ALTER TABLE "Quest" ADD COLUMN "videoUrl" TEXT;
