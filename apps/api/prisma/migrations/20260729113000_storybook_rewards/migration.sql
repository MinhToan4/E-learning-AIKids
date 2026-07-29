CREATE TABLE IF NOT EXISTS "storybook_stickers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "sticker_id" TEXT NOT NULL,
  "source_event_id" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storybook_stickers_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "storybook_stickers_source_event_id_key"
  ON "storybook_stickers"("source_event_id");
CREATE UNIQUE INDEX IF NOT EXISTS "storybook_stickers_user_id_sticker_id_key"
  ON "storybook_stickers"("user_id", "sticker_id");
CREATE INDEX IF NOT EXISTS "storybook_stickers_user_id_earned_at_idx"
  ON "storybook_stickers"("user_id", "earned_at");

CREATE TABLE IF NOT EXISTS "reward_inventory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "reward_id" TEXT NOT NULL,
  "source_event_id" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reward_inventory_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "reward_inventory_source_event_id_key"
  ON "reward_inventory"("source_event_id");
CREATE UNIQUE INDEX IF NOT EXISTS "reward_inventory_user_id_reward_id_key"
  ON "reward_inventory"("user_id", "reward_id");
CREATE INDEX IF NOT EXISTS "reward_inventory_user_id_unlocked_at_idx"
  ON "reward_inventory"("user_id", "unlocked_at");

CREATE TABLE IF NOT EXISTS "reward_equipment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "kind" TEXT NOT NULL,
  "reward_id" TEXT NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reward_equipment_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "reward_equipment_user_id_kind_key"
  ON "reward_equipment"("user_id", "kind");
CREATE INDEX IF NOT EXISTS "reward_equipment_user_id_idx"
  ON "reward_equipment"("user_id");
