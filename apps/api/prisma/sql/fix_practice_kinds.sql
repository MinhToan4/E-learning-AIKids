-- Expand practice_kind CHECK for curriculum stations (L1/L2 courses)
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
