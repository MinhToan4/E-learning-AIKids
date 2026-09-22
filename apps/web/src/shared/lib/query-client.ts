import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 30 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})

export function clearStudentProgressionCache(userId?: string): void {
  if (!userId) return
  queryClient.removeQueries({ queryKey: ['progression', userId] })
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`aiki.progression.v1.${userId}`)
      localStorage.removeItem('aiki_last_known_xp')
      localStorage.removeItem('aiki_last_known_level')
    } catch {}
  }
}
