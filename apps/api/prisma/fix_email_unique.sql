-- Fix: Add missing practice_kind values to CHECK constraint
-- The seed data uses 'style' which wasn't in the original constraint

-- Also fix email unique constraint for Prisma upsert
DROP INDEX IF EXISTS public.users_email_key;
ALTER TABLE public.users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Update practice_kind CHECK to include all valid values
ALTER TABLE public.quests DROP CONSTRAINT IF EXISTS quests_practice_kind_check;
ALTER TABLE public.quests ADD CONSTRAINT quests_practice_kind_check CHECK (
    practice_kind = ANY (ARRAY[
        'chips'::text, 'story'::text, 'comic'::text,
        'detective'::text, 'character'::text, 'video'::text,
        'intro'::text, 'style'::text,
        'journal'::text, 'palette'::text, 'match'::text, 'drag'::text,
        'spin'::text, 'sketch'::text, 'ai_pick'::text, 'reflect'::text
    ])
);
