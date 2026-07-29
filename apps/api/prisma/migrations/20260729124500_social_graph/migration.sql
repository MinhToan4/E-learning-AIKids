CREATE TABLE IF NOT EXISTS "friend_invites" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sender_child_id" UUID NOT NULL,
  "recipient_child_id" UUID,
  "code_hash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'created',
  "recipient_accepted_at" TIMESTAMP(3),
  "sender_parent_approved_at" TIMESTAMP(3),
  "recipient_parent_approved_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "friend_invites_sender_child_id_fkey"
    FOREIGN KEY ("sender_child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "friend_invites_recipient_child_id_fkey"
    FOREIGN KEY ("recipient_child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "friend_invites_code_hash_key"
  ON "friend_invites"("code_hash");
CREATE INDEX IF NOT EXISTS "friend_invites_sender_child_id_status_idx"
  ON "friend_invites"("sender_child_id", "status");
CREATE INDEX IF NOT EXISTS "friend_invites_recipient_child_id_status_idx"
  ON "friend_invites"("recipient_child_id", "status");
CREATE INDEX IF NOT EXISTS "friend_invites_expires_at_idx"
  ON "friend_invites"("expires_at");

CREATE TABLE IF NOT EXISTS "child_connections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "child_a_id" UUID NOT NULL,
  "child_b_id" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "child_connections_child_a_id_fkey"
    FOREIGN KEY ("child_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "child_connections_child_b_id_fkey"
    FOREIGN KEY ("child_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "child_connections_distinct_children_check"
    CHECK ("child_a_id" <> "child_b_id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "child_connections_child_a_id_child_b_id_key"
  ON "child_connections"("child_a_id", "child_b_id");
CREATE INDEX IF NOT EXISTS "child_connections_child_a_id_status_idx"
  ON "child_connections"("child_a_id", "status");
CREATE INDEX IF NOT EXISTS "child_connections_child_b_id_status_idx"
  ON "child_connections"("child_b_id", "status");

CREATE TABLE IF NOT EXISTS "favorite_connections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "child_id" UUID NOT NULL,
  "connection_id" UUID NOT NULL,
  "position" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "favorite_connections_child_id_fkey"
    FOREIGN KEY ("child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "favorite_connections_connection_id_fkey"
    FOREIGN KEY ("connection_id") REFERENCES "child_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "favorite_connections_position_check"
    CHECK ("position" BETWEEN 1 AND 6)
);
CREATE UNIQUE INDEX IF NOT EXISTS "favorite_connections_child_id_connection_id_key"
  ON "favorite_connections"("child_id", "connection_id");
CREATE UNIQUE INDEX IF NOT EXISTS "favorite_connections_child_id_position_key"
  ON "favorite_connections"("child_id", "position");
CREATE INDEX IF NOT EXISTS "favorite_connections_connection_id_idx"
  ON "favorite_connections"("connection_id");

CREATE TABLE IF NOT EXISTS "child_blocks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "blocker_child_id" UUID NOT NULL,
  "blocked_child_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "child_blocks_blocker_child_id_fkey"
    FOREIGN KEY ("blocker_child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "child_blocks_blocked_child_id_fkey"
    FOREIGN KEY ("blocked_child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "child_blocks_distinct_children_check"
    CHECK ("blocker_child_id" <> "blocked_child_id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "child_blocks_blocker_child_id_blocked_child_id_key"
  ON "child_blocks"("blocker_child_id", "blocked_child_id");
CREATE INDEX IF NOT EXISTS "child_blocks_blocked_child_id_idx"
  ON "child_blocks"("blocked_child_id");
