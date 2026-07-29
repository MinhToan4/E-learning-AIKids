CREATE TABLE IF NOT EXISTS "public_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "child_id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "visibility" TEXT[] NOT NULL,
  "modules" TEXT[] NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "public_profiles_child_id_fkey"
    FOREIGN KEY ("child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "public_profiles_child_id_key"
  ON "public_profiles"("child_id");
CREATE UNIQUE INDEX IF NOT EXISTS "public_profiles_slug_key"
  ON "public_profiles"("slug");

CREATE TABLE IF NOT EXISTS "workspace_grants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "audience" TEXT NOT NULL,
  "permission" TEXT NOT NULL DEFAULT 'view',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "approved_by_id" UUID,
  "approved_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_grants_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "workspace_grants_approved_by_id_fkey"
    FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_grants_project_id_audience_key"
  ON "workspace_grants"("project_id", "audience");
CREATE INDEX IF NOT EXISTS "workspace_grants_status_audience_idx"
  ON "workspace_grants"("status", "audience");
CREATE INDEX IF NOT EXISTS "workspace_grants_approved_by_id_idx"
  ON "workspace_grants"("approved_by_id");
