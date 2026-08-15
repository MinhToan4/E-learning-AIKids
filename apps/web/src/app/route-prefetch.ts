const prefetched = new Set<string>()

/** Warm the route chunk while the user hovers/focuses a navigation item. */
export function prefetchRoute(path: string) {
  const normalized = path.split('?')[0]
  const key = normalized === '/admin/legends' ? 'admin-legends' : normalized.split('/').filter(Boolean)[0] ?? 'home'
  if (prefetched.has(key)) return
  prefetched.add(key)
  const load = key === 'admin-legends'
    ? Promise.all([import('@/features/admin/pages/AdminPage'), import('@/features/admin/components/LegendRewardStudio')])
    : key === 'admin' ? import('@/features/admin/pages/AdminPage')
    : key === 'teacher' ? import('@/features/teacher/pages/TeacherPage')
      : key === 'parent' ? import('@/features/parent/pages/ParentPage')
        : key === 'home' ? import('@/features/home/pages/HomePage')
          : key === 'world' ? import('@/features/world/pages/WorldPage')
            : key === 'progress' ? import('@/features/leaderboard/pages/LeaderboardPage')
              : key === 'events' ? import('@/features/events/pages/EventsPage')
                : key === 'storybook' ? import('@/features/storybook/pages/StorybookPage')
                  : key === 'achievements' ? import('@/features/achievements/pages/AchievementsPage')
                    : key === 'backpack' ? import('@/features/backpack/pages/BackpackPage')
                      : key === 'profile' ? import('@/features/profile/pages/ProfilePage')
                        : key === 'creative' ? import('@/features/creative/pages/CreativePage')
                          : null
  void load?.catch(() => prefetched.delete(key))
}
