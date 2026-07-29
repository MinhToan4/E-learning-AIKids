CREATE TABLE IF NOT EXISTS "social_activities" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actor_child_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "icon" TEXT,
  "cover_url" TEXT,
  "reward_id" TEXT,
  "reference_id" TEXT,
  "audiences" TEXT[] NOT NULL,
  "source_event_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "social_activities_actor_child_id_fkey"
    FOREIGN KEY ("actor_child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "social_activities_source_event_id_key"
  ON "social_activities"("source_event_id");
CREATE INDEX IF NOT EXISTS "social_activities_actor_child_id_created_at_idx"
  ON "social_activities"("actor_child_id", "created_at");
CREATE INDEX IF NOT EXISTS "social_activities_created_at_idx"
  ON "social_activities"("created_at");

CREATE TABLE IF NOT EXISTS "social_reactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "activity_id" UUID NOT NULL,
  "actor_child_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "social_reactions_activity_id_fkey"
    FOREIGN KEY ("activity_id") REFERENCES "social_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "social_reactions_actor_child_id_fkey"
    FOREIGN KEY ("actor_child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "social_reactions_activity_id_actor_child_id_key"
  ON "social_reactions"("activity_id", "actor_child_id");
CREATE INDEX IF NOT EXISTS "social_reactions_actor_child_id_type_created_at_idx"
  ON "social_reactions"("actor_child_id", "type", "created_at");
CREATE INDEX IF NOT EXISTS "social_reactions_activity_id_type_idx"
  ON "social_reactions"("activity_id", "type");
