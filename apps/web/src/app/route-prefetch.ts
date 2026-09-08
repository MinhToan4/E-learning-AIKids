const prefetched = new Set<string>()

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

/** Warm the route chunk while the user hovers/focuses a navigation item. */
export function prefetchRoute(path: string) {
  if (!canPrefetchRoute()) return
  const normalized = path.split('?')[0]
  const key = normalized === '/admin/legends'
    ? 'admin-legends'
    : normalized === '/lab/mee-cat' || normalized === '/mee-cat-studio'
      ? 'mee-cat'
    : normalized.startsWith('/asmo/curriculum')
      ? 'asmo-curriculum'
      : normalized.startsWith('/asmo/journey')
        ? 'asmo-journey'
        : normalized.split('/').filter(Boolean)[0] ?? 'home'
  if (prefetched.has(key)) return
  prefetched.add(key)
  const load = key === 'admin-legends'
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
  void load?.catch(() => prefetched.delete(key))
}
