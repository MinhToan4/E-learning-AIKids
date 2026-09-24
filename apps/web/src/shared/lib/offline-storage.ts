export const OFFLINE_CACHE_NAME = 'aikids-learning-v1'
export const OFFLINE_DEVICE_KEY = 'aikids.learning.device-id'
export const OFFLINE_GRANT_PREFIX = 'aikids.learning.offline-grant.'
export const OFFLINE_EVENT_PREFIX = 'aikids.learning.offline-events.'

// Browser-only learner state must never survive an account/profile switch on
// a shared family device. Server-backed records remain untouched.
export const LEARNER_CACHE_KEYS = [
  'aiki_backpack_saved_works',
  'aikids_completed_lessons',
  'aikids_golden_rules_progress_v1',
] as const

export const LEARNER_CACHE_PREFIXES = [
  'aiki_studio_session_',
  'aiki_studio_turns_',
  'aikids_lesson_stage_',
  'aikids_lesson_completed_stages_',
] as const

export async function clearOfflineLearningData() {
  if ('caches' in window) await caches.delete(OFFLINE_CACHE_NAME)
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (
      key &&
      (key.startsWith(OFFLINE_GRANT_PREFIX) ||
        key.startsWith(OFFLINE_EVENT_PREFIX) ||
        key === OFFLINE_DEVICE_KEY ||
        LEARNER_CACHE_KEYS.includes(key as (typeof LEARNER_CACHE_KEYS)[number]) ||
        LEARNER_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)))
    ) {
      localStorage.removeItem(key)
    }
  }
}
