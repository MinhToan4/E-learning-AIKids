const prefetched = new Set<string>()
const prefetchTimers = new Map<string, ReturnType<typeof setTimeout>>()

type NetworkInformation = {
  saveData?: boolean
  effectiveType?: string
}

function canPrefetchRoute(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  if (window.matchMedia?.('(hover: none), (pointer: coarse)').matches) return false

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (connection?.saveData) return false
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g' || connection?.effectiveType === '3g') return false
  return true
}

function resolveRouteKey(path: string): string {
  const normalized = path.split('?')[0]
  return normalized === '/admin/legends'
    ? 'admin-legends'
    : normalized === '/lab/mee-cat' || normalized === '/mee-cat-studio'
      ? 'mee-cat'
    : normalized.startsWith('/asmo/curriculum')
      ? 'asmo-curriculum'
      : normalized.startsWith('/asmo/journey')
        ? 'asmo-journey'
        : normalized.split('/').filter(Boolean)[0] ?? 'home'
}

function loadRouteChunk(key: string) {
  return key === 'admin-legends'
    ? Promise.all([import('@/features/admin/pages/AdminPage'), import('@/features/admin/components/LegendRewardStudio')])
    : key === 'mee-cat' ? import('@/features/mee-rig/pages/MeeCatStudioPage')
    : key === 'asmo-curriculum' ? Promise.all([import('@/features/asmo/pages/AsmoCurriculumRoadmapPage'), import('@/features/asmo/pages/AsmoCurriculumLessonPage')])
    : key === 'asmo-journey' ? import('@/features/asmo/pages/AsmoLearningJourneyPage')
    : key === 'admin' ? import('@/features/admin/pages/AdminPage')
    : key === 'teacher' ? import('@/features/teacher/pages/TeacherPage')
      : key === 'parent' ? import('@/features/parent/pages/ParentPage')
        : key === 'home' ? import('@/features/home/pages/HomePage')
          : key === 'world' ? import('@/features/world/pages/WorldPage')
            : key === 'progress' ? import('@/features/leaderboard/pages/LeaderboardPage')
              : key === 'events' ? import('@/features/events/pages/EventsPage')
                : key === 'storybook' ? import('@/features/storybook/pages/StorybookPage')
                  : key === 'community' ? import('@/features/storybook/pages/CommunityPage')
                    : key === 'achievements' ? import('@/features/achievements/pages/AchievementsPage')
                      : key === 'backpack' ? import('@/features/backpack/pages/BackpackPage')
                        : key === 'profile' ? import('@/features/profile/pages/ProfilePage')
                          : key === 'creative' ? import('@/features/creative/pages/CreativePage')
                            : key === 'asmo' ? import('@/features/asmo/pages/AsmoHubPage')
                              : null
}

/** Cancel a pending prefetch timer if mouse leaves before debounce expires. */
export function cancelPrefetchRoute(path?: string) {
  if (path) {
    const key = resolveRouteKey(path)
    const timer = prefetchTimers.get(key)
    if (timer) {
      clearTimeout(timer)
      prefetchTimers.delete(key)
    }
  } else {
    for (const [, timer] of prefetchTimers) {
      clearTimeout(timer)
    }
    prefetchTimers.clear()
  }
}

/** Warm the route chunk while the user hovers/focuses a navigation item with 180ms debounce. */
export function prefetchRoute(path: string) {
  if (!canPrefetchRoute()) return
  const key = resolveRouteKey(path)
  if (prefetched.has(key)) return

  // Cancel any pending prefetch for other routes during rapid cursor sweeping (Hover Storm)
  for (const [otherKey, pendingTimer] of prefetchTimers) {
    if (otherKey !== key) {
      clearTimeout(pendingTimer)
      prefetchTimers.delete(otherKey)
    }
  }

  // Debounce existing timer for this key
  const existingTimer = prefetchTimers.get(key)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  const timer = setTimeout(() => {
    prefetchTimers.delete(key)
    if (prefetched.has(key)) return
    prefetched.add(key)
    const load = loadRouteChunk(key)
    void load?.catch(() => prefetched.delete(key))
  }, 180)

  prefetchTimers.set(key, timer)
}
