export const OFFLINE_CACHE_NAME = 'aikids-learning-v1'
export const OFFLINE_DEVICE_KEY = 'aikids.learning.device-id'
export const OFFLINE_GRANT_PREFIX = 'aikids.learning.offline-grant.'
export const OFFLINE_EVENT_PREFIX = 'aikids.learning.offline-events.'

export async function clearOfflineLearningData() {
  if ('caches' in window) await caches.delete(OFFLINE_CACHE_NAME)
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (
      key &&
      (key.startsWith(OFFLINE_GRANT_PREFIX) ||
        key.startsWith(OFFLINE_EVENT_PREFIX) ||
        key === OFFLINE_DEVICE_KEY)
    ) {
      localStorage.removeItem(key)
    }
  }
}
