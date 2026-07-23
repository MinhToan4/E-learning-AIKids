-- Keep PostgreSQL validation aligned with the values produced by the current
-- learning, portfolio and completion flows. Constraints remain restrictive.

ALTER TABLE aikids_legacy.quest_progress
  DROP CONSTRAINT IF EXISTS quest_progress_phase_check;
ALTER TABLE aikids_legacy.quest_progress
  ADD CONSTRAINT quest_progress_phase_check
  CHECK (phase = ANY (ARRAY[
    'learn'::text,
    'game'::text,
    'practice'::text,
    'check'::text
  ]));

ALTER TABLE aikids_legacy.assets
  DROP CONSTRAINT IF EXISTS assets_type_check;
ALTER TABLE aikids_legacy.assets
  ADD CONSTRAINT assets_type_check
  CHECK (type = ANY (ARRAY[
    'comic_panel'::text,
    'character'::text,
    'video_clip'::text,
    'story'::text,
    'panel'::text,
    'sticker'::text,
    'badge'::text
  ]));

ALTER TABLE aikids_legacy.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE aikids_legacy.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY[
    'achievement'::text,
    'approval'::text,
    'quest_complete'::text,
    'course_completion'::text,
    'streak'::text,
    'system'::text
  ]));

ALTER TABLE aikids_legacy.achievements
  DROP CONSTRAINT IF EXISTS achievements_type_check;
ALTER TABLE aikids_legacy.achievements
  ADD CONSTRAINT achievements_type_check
  CHECK (
    type = ANY (ARRAY[
      'first_quest'::text,
      'streak_3'::text,
      'streak_7'::text,
      'streak_30'::text,
      'star_10'::text,
      'star_50'::text,
      'course_complete'::text,
      'project_first'::text
    ])
    OR type LIKE 'course_complete:%'
  );
