-- Supports bounded admin trend queries without scanning child-learning tables.
CREATE INDEX IF NOT EXISTS "users_created_at_idx"
  ON "users"("created_at");

CREATE INDEX IF NOT EXISTS "quest_progress_status_updated_at_idx"
  ON "quest_progress"("status", "updated_at");

CREATE INDEX IF NOT EXISTS "projects_created_at_idx"
  ON "projects"("created_at");
