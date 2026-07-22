-- Firebase is an infrastructure projection; Postgres remains source of truth.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firebase_uid" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_firebase_uid_key"
  ON "users"("firebase_uid");

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "push_status" TEXT NOT NULL DEFAULT 'not_requested',
  ADD COLUMN IF NOT EXISTS "push_attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "push_next_attempt_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "push_last_error" TEXT,
  ADD COLUMN IF NOT EXISTS "push_dispatched_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "notifications_push_status_push_next_attempt_at_idx"
  ON "notifications"("push_status", "push_next_attempt_at");

CREATE TABLE IF NOT EXISTS "push_devices" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "platform" TEXT NOT NULL DEFAULT 'web',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "push_devices_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "push_devices_token_hash_key" ON "push_devices"("token_hash");
CREATE INDEX IF NOT EXISTS "push_devices_user_id_enabled_idx"
  ON "push_devices"("user_id", "enabled");

CREATE TABLE IF NOT EXISTS "storage_objects" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "object_path" TEXT NOT NULL,
  "bucket" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "size" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "quest_id" TEXT,
  "project_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ready_at" TIMESTAMP(3),
  CONSTRAINT "storage_objects_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "storage_objects_object_path_key"
  ON "storage_objects"("object_path");
CREATE INDEX IF NOT EXISTS "storage_objects_user_id_created_at_idx"
  ON "storage_objects"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "storage_objects_status_created_at_idx"
  ON "storage_objects"("status", "created_at");

-- Hot portfolio feeds use owner + time ordering; single-column indexes force extra sorts.
CREATE INDEX IF NOT EXISTS "assets_user_id_created_at_idx"
  ON "assets"("user_id", "created_at" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "projects_user_id_updated_at_idx"
  ON "projects"("user_id", "updated_at" DESC, "id" DESC);
